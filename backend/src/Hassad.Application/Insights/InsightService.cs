using System.Text.Json;
using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;

namespace Hassad.Application.Insights;

public interface IInsightService
{
    Task<Result<HasadAiExplanation>> ExplainAsync(ExplainPredictionRequest request, CancellationToken ct = default);
    Task<Result<AskHasadAiResponse>> AskAsync(AskHasadAiRequest request, CancellationToken ct = default);
}

/// <summary>"Hasad AI": explains a prediction in simple words using a language model.</summary>
public sealed class InsightService : IInsightService
{
    public const int MaxQuestionLength = 500;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IAiTextClient _ai;

    public InsightService(IAiTextClient ai) => _ai = ai;

    public async Task<Result<HasadAiExplanation>> ExplainAsync(ExplainPredictionRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Crop))
            return Error.Validation("Crop is required.");

        var text = await _ai.GenerateAsync(Prompts.Explain(request), ct);

        try
        {
            var parsed = JsonSerializer.Deserialize<HasadAiExplanation>(ExtractJsonObject(text), JsonOptions);
            if (parsed is not null)
                return parsed;
        }
        catch (JsonException)
        {
            // The model did not return valid JSON: fall back to showing its text as the summary.
        }

        return new HasadAiExplanation
        {
            Title = "Hasad AI Insight",
            Summary = text,
            ConfidenceNote = "This explanation is based on Hasad machine learning model outputs."
        };
    }

    public async Task<Result<AskHasadAiResponse>> AskAsync(AskHasadAiRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
            return Error.Validation("Question is required.");

        if (request.Question.Length > MaxQuestionLength)
            return Error.Validation($"Question is too long (max {MaxQuestionLength} characters).");

        var answer = await _ai.GenerateAsync(Prompts.Ask(request), ct);
        return new AskHasadAiResponse(answer);
    }

    /// <summary>Models sometimes wrap JSON in ```json fences or add text around it: keep only the {...} part.</summary>
    private static string ExtractJsonObject(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return "{}";

        var first = text.IndexOf('{');
        var last = text.LastIndexOf('}');
        return first >= 0 && last > first ? text[first..(last + 1)] : text;
    }
}
