namespace Hassad.Infrastructure.Ai;

/// <summary>Hassad ML model API ("AiModel" section).</summary>
public sealed class AiModelOptions
{
    public const string SectionName = "AiModel";
    public string PredictUrl { get; set; } = "";
    public int TimeoutSeconds { get; set; } = 180;
}

/// <summary>OpenAI ("OpenAI" section). ApiKey must come from user-secrets or the OPENAI_API_KEY variable.</summary>
public sealed class OpenAiOptions
{
    public const string SectionName = "OpenAI";
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "gpt-5.5";
    public string Endpoint { get; set; } = "https://api.openai.com/v1/responses";
    public int MaxOutputTokens { get; set; } = 800;
}
