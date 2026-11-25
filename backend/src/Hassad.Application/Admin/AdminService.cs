using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Enums;

namespace Hassad.Application.Admin;

public interface IAdminService
{
    Task<AdminSummaryDto> GetSummaryAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(CancellationToken ct = default);
    Task<Result<UserStatusChangedDto>> UpdateUserStatusAsync(int userId, UpdateUserStatusRequest request, CancellationToken ct = default);
    Task<Result<UserRoleChangedDto>> UpdateUserRoleAsync(int userId, UpdateUserRoleRequest request, CancellationToken ct = default);
    Task<Result<MessageResponse>> DeleteUserAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<AdminPredictionDto>> GetPredictionsAsync(CancellationToken ct = default);
    Task<Result<MessageResponse>> DeletePredictionAsync(int predictionId, CancellationToken ct = default);
}

/// <summary>Admin-only use cases. The API only lets admins reach this (policy "AdminOnly").</summary>
public sealed class AdminService : IAdminService
{
    private readonly IUserRepository _users;
    private readonly IPredictionRepository _predictions;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _current;

    public AdminService(IUserRepository users, IPredictionRepository predictions, IUnitOfWork unitOfWork, ICurrentUser current)
    {
        _users = users;
        _predictions = predictions;
        _unitOfWork = unitOfWork;
        _current = current;
    }

    public async Task<AdminSummaryDto> GetSummaryAsync(CancellationToken ct = default) => new(
        await _users.CountAsync(ct),
        await _users.CountByRoleAsync(UserRole.Admin, ct),
        await _users.CountByStatusAsync(AccountStatus.Active, ct),
        await _users.CountByStatusAsync(AccountStatus.Blocked, ct),
        await _predictions.CountAsync(ct));

    public async Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(CancellationToken ct = default)
    {
        var users = await _users.GetAllNewestFirstAsync(ct);
        return users.Select(u => new AdminUserDto(
            u.Id, u.FirstName, u.LastName, u.FullName, u.Email, u.Phone, u.Location, u.FarmSize, u.Crops,
            u.Role.ToString(), u.AccountStatus.ToString(), u.JoinDate, u.HasCompleteProfile, u.TotalPredictions)).ToList();
    }

    public async Task<Result<UserStatusChangedDto>> UpdateUserStatusAsync(int userId, UpdateUserStatusRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<AccountStatus>(request.AccountStatus?.Trim(), ignoreCase: true, out var status) ||
            !Enum.IsDefined(status))
            return Error.Validation("Status must be Active or Blocked");

        if (_current.UserId == userId && status == AccountStatus.Blocked)
            return Error.Validation("You cannot block your own admin account");

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        user.AccountStatus = status;
        await _unitOfWork.SaveChangesAsync(ct);

        return new UserStatusChangedDto("User status updated successfully", user.Id, user.AccountStatus.ToString());
    }

    public async Task<Result<UserRoleChangedDto>> UpdateUserRoleAsync(int userId, UpdateUserRoleRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<UserRole>(request.Role?.Trim(), ignoreCase: true, out var role) || !Enum.IsDefined(role))
            return Error.Validation("Role must be Admin or User");

        if (_current.UserId == userId && role != UserRole.Admin)
            return Error.Validation("You cannot remove your own admin role");

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        user.Role = role;
        await _unitOfWork.SaveChangesAsync(ct);

        return new UserRoleChangedDto("User role updated successfully", user.Id, user.Role.ToString());
    }

    public async Task<Result<MessageResponse>> DeleteUserAsync(int userId, CancellationToken ct = default)
    {
        if (_current.UserId == userId)
            return Error.Validation("You cannot delete your own admin account");

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        _users.Remove(user); // the user's predictions are deleted too (cascade)
        await _unitOfWork.SaveChangesAsync(ct);

        return new MessageResponse("User deleted successfully");
    }

    public async Task<IReadOnlyList<AdminPredictionDto>> GetPredictionsAsync(CancellationToken ct = default)
    {
        var list = await _predictions.GetAllWithUserNewestFirstAsync(ct);
        return list.Select(p => new AdminPredictionDto(
            p.Id, p.UserId,
            p.User?.FullName ?? "Unknown",
            p.User?.Email ?? "",
            p.Crop, p.TargetYear, p.Season, p.PredictedProduction, p.Quality, p.PriceTrend, p.CreatedAt)).ToList();
    }

    public async Task<Result<MessageResponse>> DeletePredictionAsync(int predictionId, CancellationToken ct = default)
    {
        var prediction = await _predictions.GetByIdAsync(predictionId, ct);
        if (prediction is null)
            return Error.NotFound("Prediction not found");

        _predictions.Remove(prediction);
        if (prediction.User is { TotalPredictions: > 0 } owner)
            owner.TotalPredictions--;

        await _unitOfWork.SaveChangesAsync(ct);
        return new MessageResponse("Prediction deleted successfully");
    }
}
