using Hassad.Domain.Entities;

namespace Hassad.Application.Common.Interfaces;

/// <summary>Who is calling the API right now (read from the JWT). Null when not logged in.</summary>
public interface ICurrentUser
{
    int? UserId { get; }
    bool IsAdmin { get; }
}

/// <summary>Wraps DateTime so code that depends on time can be unit-tested.</summary>
public interface IClock
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string storedHash);
    /// <summary>True for old passwords that were saved as plain text and must be re-hashed.</summary>
    bool NeedsRehash(string storedHash);
}

public sealed record AccessToken(string Token, DateTime ExpiresAt);

public interface IJwtTokenGenerator
{
    AccessToken Generate(User user);
}

public interface IEmailSender
{
    Task SendPasswordResetCodeAsync(string toEmail, string userName, string code, CancellationToken ct = default);
}

/// <summary>Result of calling the Hassad machine-learning API.</summary>
public sealed record AiPrediction(double? PredictedProduction, string? Quality, string? PriceTrend, string RawResponse);

public interface IAiPredictionClient
{
    Task<Result<AiPrediction>> PredictAsync(string crop, int targetYear, string season, CancellationToken ct = default);
}

/// <summary>Large-language-model text generation (OpenAI today, could be anything tomorrow).</summary>
public interface IAiTextClient
{
    Task<string> GenerateAsync(string prompt, CancellationToken ct = default);
}
