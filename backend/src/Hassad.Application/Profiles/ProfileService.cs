using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;

namespace Hassad.Application.Profiles;

public interface IProfileService
{
    Task<Result<UserProfileDto>> GetAsync(int userId, CancellationToken ct = default);
    Task<Result<UpdateProfileResponse>> UpdateAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default);

    // Kept for the older /api/Profile endpoints that use the email.
    Task<Result<ProfileStatusDto>> GetStatusByEmailAsync(string email, CancellationToken ct = default);
    Task<Result<UserProfileDto>> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Result<MessageResponse>> UpdateByEmailAsync(UpdateProfileByEmailRequest request, CancellationToken ct = default);
}

public sealed class ProfileService : IProfileService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _current;

    public ProfileService(IUserRepository users, IUnitOfWork unitOfWork, ICurrentUser current)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _current = current;
    }

    public async Task<Result<UserProfileDto>> GetAsync(int userId, CancellationToken ct = default)
    {
        if (!_current.CanAccessUser(userId))
            return Error.Forbidden();

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        // A GET request only reads. (Before, it also wrote to the database.)
        return ToDto(user);
    }

    public async Task<Result<UpdateProfileResponse>> UpdateAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        if (!_current.CanAccessUser(userId))
            return Error.Forbidden();

        var invalid = Validate(request.Phone, request.Location, request.FarmSize, request.Crops);
        if (invalid is not null)
            return invalid;

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        user.UpdateFarmProfile(request.Phone!, request.Location!, request.FarmSize!.Value, request.Crops!);
        await _unitOfWork.SaveChangesAsync(ct);

        return new UpdateProfileResponse("Profile saved successfully", ToDto(user));
    }

    public async Task<Result<ProfileStatusDto>> GetStatusByEmailAsync(string email, CancellationToken ct = default)
    {
        var found = await FindAllowedByEmailAsync(email, ct);
        if (!found.IsSuccess)
            return found.Error!;

        return new ProfileStatusDto(found.Value!.HasCompleteProfile);
    }

    public async Task<Result<UserProfileDto>> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var found = await FindAllowedByEmailAsync(email, ct);
        if (!found.IsSuccess)
            return found.Error!;

        return ToDto(found.Value!);
    }

    public async Task<Result<MessageResponse>> UpdateByEmailAsync(UpdateProfileByEmailRequest request, CancellationToken ct = default)
    {
        var crops = string.IsNullOrWhiteSpace(request.Crops)
            ? new List<string>()
            : request.Crops.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var invalid = Validate(request.Phone, request.Location, request.FarmSize, crops);
        if (invalid is not null)
            return invalid;

        var found = await FindAllowedByEmailAsync(request.Email, ct);
        if (!found.IsSuccess)
            return found.Error!;

        // Only these 4 fields can change. (Before, the whole User object came from the request.)
        found.Value!.UpdateFarmProfile(request.Phone!, request.Location!, request.FarmSize!.Value, crops);
        await _unitOfWork.SaveChangesAsync(ct);

        return new MessageResponse("Profile updated successfully");
    }

    private async Task<Result<User>> FindAllowedByEmailAsync(string email, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Error.Validation("Email is required");

        var user = await _users.GetByEmailAsync(User.NormalizeEmail(email), ct);
        if (user is null)
            return Error.NotFound("User not found");

        if (!_current.CanAccessUser(user.Id))
            return Error.Forbidden();

        return user;
    }

    private static Error? Validate(string? phone, string? location, double? farmSize, IReadOnlyCollection<string>? crops)
    {
        if (string.IsNullOrWhiteSpace(phone)) return Error.Validation("Phone number is required");
        if (string.IsNullOrWhiteSpace(location)) return Error.Validation("Location is required");
        if (farmSize is null or <= 0) return Error.Validation("Farm size is required");
        if (crops is null || crops.Count == 0) return Error.Validation("At least one crop is required");
        return null;
    }

    internal static UserProfileDto ToDto(User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.Role.ToString(),
        user.Phone,
        user.Location,
        user.FarmSize,
        user.CropList,
        user.JoinDate,
        user.AccountStatus.ToString(),
        user.HasCompleteProfile,
        user.TotalPredictions);
}
