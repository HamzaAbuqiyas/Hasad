namespace Hassad.Application.Profiles;

public sealed class UpdateProfileRequest
{
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public double? FarmSize { get; set; }
    public List<string>? Crops { get; set; }
}

/// <summary>Older Angular screens send the crops as one comma-separated string.</summary>
public sealed class UpdateProfileByEmailRequest
{
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public double? FarmSize { get; set; }
    public string? Crops { get; set; }
}

public sealed record UserProfileDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string? Phone,
    string? Location,
    double? FarmSize,
    IReadOnlyList<string> Crops,
    DateTime JoinDate,
    string AccountStatus,
    bool IsProfileCompleted,
    int TotalPredictions);

public sealed record UpdateProfileResponse(string Message, UserProfileDto User);

public sealed record ProfileStatusDto(bool IsCompleted);
