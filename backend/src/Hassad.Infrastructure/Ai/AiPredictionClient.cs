using System.Text.Json;
using Hassad.Application.Common;
using Hassad.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Hassad.Infrastructure.Ai;

/// <summary>Calls the Hassad ML API and reads production, quality and price trend from its JSON.</summary>
public sealed class AiPredictionClient : IAiPredictionClient
{
    private static readonly string[] ProductionNames =
        { "predicted_production", "production", "predictedProduction", "production_prediction", "Predicted Production" };
    private static readonly string[] QualityNames =
        { "quality", "predicted_quality", "predictedQuality", "quality_prediction", "Predicted Quality" };
    private static readonly string[] PriceTrendNames =
        { "price_trend", "predicted_price_trend", "priceTrend", "predictedPriceTrend", "Predicted Price Trend", "Price Trend" };

    private readonly HttpClient _http;
    private readonly AiModelOptions _options;
    private readonly ILogger<AiPredictionClient> _logger;

    public AiPredictionClient(HttpClient http, IOptions<AiModelOptions> options, ILogger<AiPredictionClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<Result<AiPrediction>> PredictAsync(string crop, int targetYear, string season, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.PredictUrl))
            throw new InvalidOperationException("AiModel:PredictUrl is missing in the configuration.");

        var url = $"{_options.PredictUrl}?crop={Uri.EscapeDataString(crop)}&target_year={targetYear}&season={Uri.EscapeDataString(season)}";

        HttpResponseMessage response;
        try
        {
            response = await _http.GetAsync(url, ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Hassad AI model API is not reachable");
            return Error.Unavailable("AI API is not reachable. Please try again later.");
        }

        var raw = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Hassad AI model API returned {Status}: {Body}", (int)response.StatusCode, raw);
            return Error.Upstream("AI API returned an error", (int)response.StatusCode);
        }

        try
        {
            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;
            return new AiPrediction(
                JsonSearch.FindDouble(root, ProductionNames),
                JsonSearch.FindString(root, QualityNames),
                JsonSearch.FindString(root, PriceTrendNames),
                raw);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Hassad AI model API returned invalid JSON: {Body}", raw);
            return Error.Upstream("AI API response is not valid JSON", 502);
        }
    }
}

/// <summary>Finds a value anywhere in a JSON document by any of several possible names ("predicted_production", "Predicted Production"...).</summary>
internal static class JsonSearch
{
    public static string? FindString(JsonElement element, IEnumerable<string> names)
    {
        var property = Find(element, names);
        if (property is null) return null;
        var value = property.Value.Value;
        return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
    }

    public static double? FindDouble(JsonElement element, IEnumerable<string> names)
    {
        foreach (var property in All(element).Where(p => Matches(p.Name, names)))
        {
            var v = property.Value;
            if (v.ValueKind == JsonValueKind.Number && v.TryGetDouble(out var number)) return number;
            if (v.ValueKind == JsonValueKind.String && double.TryParse(v.GetString(),
                    System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var parsed))
                return parsed;
        }
        return null;
    }

    private static JsonProperty? Find(JsonElement element, IEnumerable<string> names)
    {
        foreach (var property in All(element))
            if (Matches(property.Name, names))
                return property;
        return null;
    }

    private static bool Matches(string name, IEnumerable<string> names) => names.Any(n => Normalize(n) == Normalize(name));

    private static string Normalize(string value) =>
        value.Replace("_", "").Replace("-", "").Replace(" ", "").ToLowerInvariant();

    private static IEnumerable<JsonProperty> All(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.EnumerateObject())
            {
                yield return property;
                foreach (var child in All(property.Value)) yield return child;
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
                foreach (var child in All(item)) yield return child;
        }
    }
}
