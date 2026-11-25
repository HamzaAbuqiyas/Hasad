namespace Hassad.Application.Auth;

// Requests: same JSON field names the Angular app already sends.
public sealed class RegisterRequest
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public sealed class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public sealed class ForgotPasswordRequest
{
    public string Email { get; set; } = "";
}

public sealed class VerifyResetCodeRequest
{
    public string Email { get; set; } = "";
    public string Code { get; set; } = "";
}

public sealed class ResetPasswordRequest
{
    public string Email { get; set; } = "";
    public string Code { get; set; } = "";
    public string NewPassword { get; set; } = "";
}

// Responses: same JSON shape as before, so Angular keeps working.
public sealed record AuthUserDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string AccountStatus,
    bool IsProfileCompleted,
    int TotalPredictions);

public sealed record LoginResponse(string Message, string Token, DateTime ExpiresAt, AuthUserDto User);

public sealed record RegisterResponse(string Message, AuthUserDto User);
