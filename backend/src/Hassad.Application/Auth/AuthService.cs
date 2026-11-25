using System.Security.Cryptography;
using System.Text;
using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;

namespace Hassad.Application.Auth;

public interface IAuthService
{
    Task<Result<RegisterResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<Result<MessageResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default);
    Task<Result<MessageResponse>> VerifyResetCodeAsync(VerifyResetCodeRequest request, CancellationToken ct = default);
    Task<Result<MessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
}

/// <summary>Sign up, log in and reset password. No HTTP or database code here, only the rules.</summary>
public sealed class AuthService : IAuthService
{
    public const int MinPasswordLength = 6;

    // Same message whatever went wrong, so nobody can find out which emails are registered.
    private const string InvalidResetCode = "Invalid or expired reset code. Please request a new code.";

    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly IEmailSender _email;
    private readonly IClock _clock;

    public AuthService(IUserRepository users, IUnitOfWork unitOfWork, IPasswordHasher hasher,
        IJwtTokenGenerator jwt, IEmailSender email, IClock clock)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _hasher = hasher;
        _jwt = jwt;
        _email = email;
        _clock = clock;
    }

    public async Task<Result<RegisterResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return Error.Validation("All fields are required");

        if (!IsValidEmail(request.Email))
            return Error.Validation("Email is not valid");

        if (request.Password.Length < MinPasswordLength)
            return Error.Validation($"Password must be at least {MinPasswordLength} characters");

        var email = User.NormalizeEmail(request.Email);
        if (await _users.EmailExistsAsync(email, ct))
            return Error.Conflict("Email already exists");

        var user = User.Register(request.FirstName, request.LastName, email, _hasher.Hash(request.Password), _clock.Now);
        _users.Add(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return new RegisterResponse("User created successfully", ToDto(user));
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return Error.Validation("Email and password are required");

        var user = await _users.GetByEmailAsync(User.NormalizeEmail(request.Email), ct);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            return Error.Validation("Invalid email or password");

        if (user.IsBlocked)
            return Error.Forbidden("Your account is blocked. Please contact the administrator.");

        // Old accounts may still have a plain-text password: replace it with a hash now.
        var changed = false;
        if (_hasher.NeedsRehash(user.PasswordHash))
        {
            user.PasswordHash = _hasher.Hash(request.Password);
            changed = true;
        }

        if (user.IsProfileCompleted != user.HasCompleteProfile)
        {
            user.IsProfileCompleted = user.HasCompleteProfile;
            changed = true;
        }

        if (changed)
            await _unitOfWork.SaveChangesAsync(ct);

        var token = _jwt.Generate(user);
        return new LoginResponse("Login successful", token.Token, token.ExpiresAt, ToDto(user));
    }

    public async Task<Result<MessageResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return Error.Validation("Email is required");

        // Always the same answer, even when the email is unknown (prevents finding registered emails).
        var response = new MessageResponse("If an account exists for this email, a reset code has been sent.");

        var user = await _users.GetByEmailAsync(User.NormalizeEmail(request.Email), ct);
        if (user is null || user.IsBlocked)
            return response;

        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        user.StartPasswordReset(code, _clock.UtcNow);
        await _unitOfWork.SaveChangesAsync(ct);

        // If sending fails, the exception goes to the global error handler (logged, generic 500 to the client).
        await _email.SendPasswordResetCodeAsync(user.Email, string.IsNullOrWhiteSpace(user.FullName) ? "Hassad User" : user.FullName, code, ct);

        return response;
    }

    public async Task<Result<MessageResponse>> VerifyResetCodeAsync(VerifyResetCodeRequest request, CancellationToken ct = default)
    {
        var check = await FindUserWithValidCodeAsync(request.Email, request.Code, ct);
        if (!check.IsSuccess)
            return check.Error!;

        return new MessageResponse("Reset code verified successfully");
    }

    public async Task<Result<MessageResponse>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return Error.Validation("New password is required");

        if (request.NewPassword.Length < MinPasswordLength)
            return Error.Validation($"Password must be at least {MinPasswordLength} characters");

        var check = await FindUserWithValidCodeAsync(request.Email, request.Code, ct);
        if (!check.IsSuccess)
            return check.Error!;

        check.Value!.CompletePasswordReset(_hasher.Hash(request.NewPassword));
        await _unitOfWork.SaveChangesAsync(ct);

        return new MessageResponse("Password reset successfully");
    }

    private async Task<Result<User>> FindUserWithValidCodeAsync(string email, string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Error.Validation("Email is required");

        if (string.IsNullOrWhiteSpace(code))
            return Error.Validation("Reset code is required");

        var user = await _users.GetByEmailAsync(User.NormalizeEmail(email), ct);
        if (user is null || !user.HasActiveResetCode(_clock.UtcNow) || !SameCode(user.PasswordResetCode!, code.Trim()))
            return Error.Validation(InvalidResetCode);

        return user;
    }

    /// <summary>Compares in constant time, so the response time does not leak how many digits were right.</summary>
    private static bool SameCode(string expected, string given) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(given));

    private static bool IsValidEmail(string email)
    {
        var value = email.Trim();
        var at = value.IndexOf('@');
        return at > 0 && at < value.Length - 3 && value.IndexOf('.', at) > at + 1 && !value.Contains(' ');
    }

    internal static AuthUserDto ToDto(User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.Role.ToString(),
        user.AccountStatus.ToString(),
        user.HasCompleteProfile,
        user.TotalPredictions);
}
