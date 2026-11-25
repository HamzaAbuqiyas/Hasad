namespace Hassad.Api.Common;

/// <summary>Names of the rate-limit policies (see Program.cs).</summary>
public static class RateLimits
{
    /// <summary>Login, sign-up and password reset: stops password and reset-code guessing.</summary>
    public const string Auth = "auth";

    /// <summary>Paid AI calls (OpenAI, ML model): stops one user from running up the bill.</summary>
    public const string Ai = "ai";
}
