namespace Hassad.Infrastructure.Security;

/// <summary>Bound from the "Jwt" section of the configuration.</summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>Secret signing key, at least 32 characters. Keep it in user-secrets, never in appsettings.json.</summary>
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "HassadApi";
    public string Audience { get; set; } = "HassadAngular";
    public int ExpiresInMinutes { get; set; } = 120;
}
