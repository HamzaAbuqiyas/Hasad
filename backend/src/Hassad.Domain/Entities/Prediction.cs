namespace Hassad.Domain.Entities;

/// <summary>One crop prediction result returned by the Hassad ML model.</summary>
public class Prediction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Crop { get; set; } = "";
    public int TargetYear { get; set; }
    public string Season { get; set; } = "";

    public double? PredictedProduction { get; set; }
    public string? Quality { get; set; }
    public string? PriceTrend { get; set; }

    /// <summary>The full JSON the AI model returned, kept for debugging.</summary>
    public string? RawAiResponse { get; set; }

    public DateTime CreatedAt { get; set; }
}
