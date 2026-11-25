namespace Hassad.Application.Insights;

public class PredictionContext
{
    public string Crop { get; set; } = "";
    public int TargetYear { get; set; }
    public string Season { get; set; } = "";
    public double? PredictedProduction { get; set; }
    public string? Quality { get; set; }
    public string? PriceTrend { get; set; }
    public string? ChartDataSummary { get; set; }
}

public sealed class ExplainPredictionRequest : PredictionContext
{
}

public sealed class AskHasadAiRequest : PredictionContext
{
    public string Question { get; set; } = "";
}

public sealed class HasadAiExplanation
{
    public string Title { get; set; } = "";
    public string Summary { get; set; } = "";
    public string ResultExplanation { get; set; } = "";
    public string ChartExplanation { get; set; } = "";
    public string Recommendation { get; set; } = "";
    public string RiskNote { get; set; } = "";
    public string ConfidenceNote { get; set; } = "";
}

public sealed record AskHasadAiResponse(string Answer);
