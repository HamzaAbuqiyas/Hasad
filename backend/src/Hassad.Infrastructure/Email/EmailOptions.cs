namespace Hassad.Infrastructure.Email;

/// <summary>Bound from "EmailSettings". The password must come from user-secrets / environment variables.</summary>
public sealed class EmailOptions
{
    public const string SectionName = "EmailSettings";

    public string SmtpServer { get; set; } = "";
    public int Port { get; set; } = 465;
    public string SenderName { get; set; } = "Hassad Support";
    public string SenderEmail { get; set; } = "";
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}
