using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Hassad.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace Hassad.Infrastructure.Ai;

/// <summary>Calls the OpenAI Responses API and returns the generated text.</summary>
public sealed class OpenAiTextClient : IAiTextClient
{
    private readonly HttpClient _http;
    private readonly OpenAiOptions _options;

    public OpenAiTextClient(HttpClient http, IOptions<OpenAiOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<string> GenerateAsync(string prompt, CancellationToken ct = default)
    {
        var apiKey = string.IsNullOrWhiteSpace(_options.ApiKey)
            ? Environment.GetEnvironmentVariable("OPENAI_API_KEY")
            : _options.ApiKey;

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("OpenAI API key is missing. Set OpenAI:ApiKey with dotnet user-secrets or OPENAI_API_KEY.");

        using var request = new HttpRequestMessage(HttpMethod.Post, _options.Endpoint)
        {
            Content = JsonContent.Create(new
            {
                model = _options.Model,
                input = prompt,
                store = false,
                max_output_tokens = _options.MaxOutputTokens
            })
        };
        // Header per request (before, it was set on a shared client).
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _http.SendAsync(request, ct);
        var json = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"OpenAI returned {(int)response.StatusCode}: {json}");

        return ExtractOutputText(json);
    }

    private static string ExtractOutputText(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (root.TryGetProperty("output_text", out var outputText))
            return outputText.GetString() ?? "";

        if (root.TryGetProperty("output", out var output) && output.ValueKind == JsonValueKind.Array)
            foreach (var item in output.EnumerateArray())
                if (item.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.Array)
                    foreach (var part in content.EnumerateArray())
                        if (part.TryGetProperty("text", out var text))
                            return text.GetString() ?? "";

        return "";
    }
}
