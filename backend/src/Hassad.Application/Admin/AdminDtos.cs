namespace Hassad.Application.Admin;

public sealed class UpdateUserStatusRequest
{
    public string AccountStatus { get; set; } = "";
}

public sealed class UpdateUserRoleRequest
{
    public string Role { get; set; } = "";
}

public sealed record AdminSummaryDto(int TotalUsers, int TotalAdmins, int ActiveUsers, int BlockedUsers, int TotalPredictions);

public sealed record AdminUserDto(
    int Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? Phone,
    string? Location,
    double? FarmSize,
    string? Crops,
    string Role,
    string AccountStatus,
    DateTime JoinDate,
    bool IsProfileCompleted,
    int TotalPredictions);

public sealed record AdminPredictionDto(
    int Id,
    int UserId,
    string UserName,
    string UserEmail,
    string Crop,
    int TargetYear,
    string Season,
    double? PredictedProduction,
    string? Quality,
    string? PriceTrend,
    DateTime CreatedAt);

public sealed record UserStatusChangedDto(string Message, int UserId, string AccountStatus);

public sealed record UserRoleChangedDto(string Message, int UserId, string Role);
