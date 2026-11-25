using System.Text.Json.Serialization;

namespace Hassad.Application.Predictions;

public sealed class PredictionRequest
{
    /// <summary>Ignored: the user always comes from the login token. Kept so old clients don't break.</summary>
    public int? UserId { get; set; }

    public string Crop { get; set; } = "";
    public int? TargetYear { get; set; }

    /// <summary>Older name for TargetYear.</summary>
    public int? Year { get; set; }

    public string Season { get; set; } = "";

    [JsonIgnore]
    public int FinalTargetYear => TargetYear ?? Year ?? 0;
}

public sealed record PredictionDto(
    int Id,
    int UserId,
    string Crop,
    int TargetYear,
    string Season,
    double? PredictedProduction,
    string? Quality,
    string? PriceTrend,
    DateTime CreatedAt);
