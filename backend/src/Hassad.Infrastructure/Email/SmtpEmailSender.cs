using System.Net;
using Hassad.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Hassad.Infrastructure.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;

    public SmtpEmailSender(IOptions<EmailOptions> options) => _options = options.Value;

    public async Task SendPasswordResetCodeAsync(string toEmail, string userName, string code, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.SmtpServer) || string.IsNullOrWhiteSpace(_options.SenderEmail) ||
            string.IsNullOrWhiteSpace(_options.Username) || string.IsNullOrWhiteSpace(_options.Password))
            throw new InvalidOperationException("EmailSettings are not configured.");

        // The name comes from the user: encode it so it cannot inject HTML into the email.
        var safeName = WebUtility.HtmlEncode(userName);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.SenderName, _options.SenderEmail));
        message.To.Add(new MailboxAddress(userName, toEmail));
        message.Subject = "Hassad Password Reset Code";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <div style='font-family: Arial, sans-serif; padding: 24px; color: #1f2937;'>
                    <h2 style='color: #2d5016;'>Hassad Password Reset</h2>
                    <p>Hello {safeName},</p>
                    <p>You requested to reset your password.</p>
                    <p>Your verification code is:</p>
                    <div style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2d5016; background: #f1f8e9; padding: 16px 24px; border-radius: 12px; width: fit-content;'>
                        {code}
                    </div>
                    <p>This code will expire in {Domain.Entities.User.ResetCodeLifetimeMinutes} minutes.</p>
                    <p>If you did not request this reset, please ignore this email.</p>
                    <br />
                    <p>Hassad Team</p>
                </div>
                """
        };

        using var client = new SmtpClient { Timeout = 30000 };
        client.AuthenticationMechanisms.Remove("XOAUTH2");

        var socket = _options.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
        await client.ConnectAsync(_options.SmtpServer, _options.Port, socket, ct);
        await client.AuthenticateAsync(_options.Username, _options.Password.Replace(" ", ""), ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}
