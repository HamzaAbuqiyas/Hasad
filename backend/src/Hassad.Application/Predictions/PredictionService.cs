using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;

namespace Hassad.Application.Predictions;

public interface IPredictionService
{
    Task<Result<PredictionDto>> PredictAsync(PredictionRequest request, CancellationToken ct = default);
    Task<Result<IReadOnlyList<PredictionDto>>> GetForUserAsync(int userId, int? take = null, CancellationToken ct = default);
}

public sealed class PredictionService : IPredictionService
{
    public const int LatestCount = 5;

    private readonly IPredictionRepository _predictions;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAiPredictionClient _ai;
    private readonly ICurrentUser _current;
    private readonly IClock _clock;

    public PredictionService(IPredictionRepository predictions, IUserRepository users, IUnitOfWork unitOfWork,
        IAiPredictionClient ai, ICurrentUser current, IClock clock)
    {
        _predictions = predictions;
        _users = users;
        _unitOfWork = unitOfWork;
        _ai = ai;
        _current = current;
        _clock = clock;
    }

    public async Task<Result<PredictionDto>> PredictAsync(PredictionRequest request, CancellationToken ct = default)
    {
        // The prediction belongs to whoever is logged in. (Before, the client could send any UserId.)
        if (_current.UserId is not int userId)
            return Error.Forbidden("Please log in first.");

        if (string.IsNullOrWhiteSpace(request.Crop)) return Error.Validation("Crop is required");
        if (request.FinalTargetYear <= 0) return Error.Validation("Target year is required");
        if (string.IsNullOrWhiteSpace(request.Season)) return Error.Validation("Season is required");

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Error.NotFound("User not found");

        var crop = request.Crop.Trim();
        var season = request.Season.Trim();

        var ai = await _ai.PredictAsync(crop, request.FinalTargetYear, season, ct);
        if (!ai.IsSuccess)
            return ai.Error!;

        var prediction = new Prediction
        {
            UserId = user.Id,
            Crop = crop,
            TargetYear = request.FinalTargetYear,
            Season = season,
            PredictedProduction = ai.Value!.PredictedProduction,
            Quality = ai.Value.Quality ?? "N/A",
            PriceTrend = ai.Value.PriceTrend ?? "N/A",
            RawAiResponse = ai.Value.RawResponse,
            CreatedAt = _clock.Now
        };

        _predictions.Add(prediction);
        user.RecordPrediction();
        await _unitOfWork.SaveChangesAsync(ct);

        return ToDto(prediction);
    }

    public async Task<Result<IReadOnlyList<PredictionDto>>> GetForUserAsync(int userId, int? take = null, CancellationToken ct = default)
    {
        if (!_current.CanAccessUser(userId))
            return Error.Forbidden();

        var list = await _predictions.GetForUserNewestFirstAsync(userId, take, ct);
        return Result<IReadOnlyList<PredictionDto>>.Success(list.Select(ToDto).ToList());
    }

    internal static PredictionDto ToDto(Prediction p) => new(
        p.Id, p.UserId, p.Crop, p.TargetYear, p.Season, p.PredictedProduction, p.Quality, p.PriceTrend, p.CreatedAt);
}
