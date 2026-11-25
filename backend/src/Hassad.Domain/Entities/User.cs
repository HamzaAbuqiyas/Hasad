using Hassad.Domain.Enums;

namespace Hassad.Domain.Entities;

/// <summary>
/// A farmer or an admin.
/// Business rules about a user live HERE (not in controllers),
/// so every part of the app applies them the same way.
/// </summary>
public class User
{
    public const int ResetCodeLifetimeMinutes = 15;

    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.User;

    public string? Phone { get; set; }
    public string? Location { get; set; }
    public double? FarmSize { get; set; }

    /// <summary>Comma-separated in the database (e.g. "Wheat,Barley"). Use <see cref="CropList"/> in code.</summary>
    public string? Crops { get; set; }

    public DateTime JoinDate { get; set; }
    public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
    public int TotalPredictions { get; set; }
    public bool IsProfileCompleted { get; set; }

    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetCodeExpiresAt { get; set; }
    public bool PasswordResetCodeUsed { get; set; } = true;

    // ---------- read-only helpers ----------

    public string FullName => $"{FirstName} {LastName}".Trim();

    public bool IsAdmin => Role == UserRole.Admin;

    public bool IsBlocked => AccountStatus == AccountStatus.Blocked;

    public IReadOnlyList<string> CropList =>
        string.IsNullOrWhiteSpace(Crops)
            ? Array.Empty<string>()
            : Crops.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    /// <summary>Profile is complete when phone, location, farm size and at least one crop are set.</summary>
    public bool HasCompleteProfile =>
        !string.IsNullOrWhiteSpace(Phone) &&
        !string.IsNullOrWhiteSpace(Location) &&
        FarmSize is > 0 &&
        CropList.Count > 0;

    // ---------- behaviour ----------

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static User Register(string firstName, string lastName, string email, string passwordHash, DateTime now) => new()
    {
        FirstName = firstName.Trim(),
        LastName = lastName.Trim(),
        Email = NormalizeEmail(email),
        PasswordHash = passwordHash,
        Role = UserRole.User,
        AccountStatus = AccountStatus.Active,
        JoinDate = now,
        IsProfileCompleted = false,
        TotalPredictions = 0,
        PasswordResetCodeUsed = true
    };

    public void UpdateFarmProfile(string phone, string location, double farmSize, IEnumerable<string> crops)
    {
        Phone = phone.Trim();
        Location = location.Trim();
        FarmSize = farmSize;
        Crops = string.Join(",", crops.Select(c => c.Trim()).Where(c => c.Length > 0).Distinct());
        IsProfileCompleted = HasCompleteProfile;
    }

    public void StartPasswordReset(string code, DateTime nowUtc)
    {
        PasswordResetCode = code;
        PasswordResetCodeExpiresAt = nowUtc.AddMinutes(ResetCodeLifetimeMinutes);
        PasswordResetCodeUsed = false;
    }

    public bool HasActiveResetCode(DateTime nowUtc) =>
        !PasswordResetCodeUsed &&
        !string.IsNullOrWhiteSpace(PasswordResetCode) &&
        PasswordResetCodeExpiresAt is not null &&
        PasswordResetCodeExpiresAt >= nowUtc;

    public void CompletePasswordReset(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        CancelPasswordReset();
    }

    public void CancelPasswordReset()
    {
        PasswordResetCode = null;
        PasswordResetCodeExpiresAt = null;
        PasswordResetCodeUsed = true;
    }

    public void RecordPrediction() => TotalPredictions++;
}
