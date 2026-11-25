using System.Globalization;
using System.Text.Json;
using Hassad.Application.Common;
using Hassad.Application.Weather;
using Microsoft.Extensions.Logging;

namespace Hassad.Infrastructure.Weather;

/// <summary>Free weather API (open-meteo.com), no key needed.</summary>
public sealed class OpenMeteoWeatherClient : IWeatherClient
{
    private const int ForecastDays = 5;

    private readonly HttpClient _http;
    private readonly ILogger<OpenMeteoWeatherClient> _logger;

    public OpenMeteoWeatherClient(HttpClient http, ILogger<OpenMeteoWeatherClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<Result<WeatherReportDto>> GetForecastAsync(string city, string country, double latitude, double longitude, CancellationToken ct = default)
    {
        var lat = latitude.ToString(CultureInfo.InvariantCulture);
        var lon = longitude.ToString(CultureInfo.InvariantCulture);
        var url = "https://api.open-meteo.com/v1/forecast" +
                  $"?latitude={lat}&longitude={lon}" +
                  "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
                  "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code" +
                  $"&forecast_days={ForecastDays}&timezone=auto";

        HttpResponseMessage response;
        try
        {
            response = await _http.GetAsync(url, ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Weather API is not reachable");
            return Error.Unavailable("Weather API is not reachable.");
        }

        var raw = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Weather API returned {Status}: {Body}", (int)response.StatusCode, raw);
            return Error.Upstream("Weather API returned an error.", (int)response.StatusCode);
        }

        try
        {
            using var doc = JsonDocument.Parse(raw);
            var current = doc.RootElement.GetProperty("current");
            var daily = doc.RootElement.GetProperty("daily");
            var code = GetInt(current, "weather_code");

            return new WeatherReportDto(
                city, country, latitude, longitude,
                new CurrentWeatherDto(
                    GetString(current, "time"),
                    GetDouble(current, "temperature_2m"),
                    GetInt(current, "relative_humidity_2m"),
                    GetDouble(current, "precipitation"),
                    GetDouble(current, "wind_speed_10m"),
                    code,
                    Describe(code)),
                BuildDaily(daily));
        }
        catch (Exception ex) when (ex is JsonException or KeyNotFoundException or InvalidOperationException)
        {
            _logger.LogWarning(ex, "Weather API response could not be processed: {Body}", raw);
            return Error.Upstream("Weather API response could not be processed.", 502);
        }
    }

    private static List<DailyForecastDto> BuildDaily(JsonElement daily)
    {
        var list = new List<DailyForecastDto>();
        if (!daily.TryGetProperty("time", out var time))
            return list;

        var max = daily.GetProperty("temperature_2m_max");
        var min = daily.GetProperty("temperature_2m_min");
        var rain = daily.GetProperty("precipitation_sum");
        var codes = daily.GetProperty("weather_code");

        for (var i = 0; i < Math.Min(ForecastDays, time.GetArrayLength()); i++)
        {
            var code = GetInt(codes, i);
            list.Add(new DailyForecastDto(GetString(time, i), GetDouble(max, i), GetDouble(min, i), GetDouble(rain, i), code, Describe(code)));
        }
        return list;
    }

    private static JsonElement? Item(JsonElement array, int i) =>
        array.ValueKind == JsonValueKind.Array && i < array.GetArrayLength() ? array[i] : null;

    private static JsonElement? Prop(JsonElement obj, string name) =>
        obj.TryGetProperty(name, out var p) ? p : null;

    private static string? GetString(JsonElement obj, string name) => Prop(obj, name)?.ToString();
    private static double? GetDouble(JsonElement obj, string name) => AsDouble(Prop(obj, name));
    private static int? GetInt(JsonElement obj, string name) => AsInt(Prop(obj, name));
    private static string? GetString(JsonElement array, int i) => Item(array, i)?.ToString();
    private static double? GetDouble(JsonElement array, int i) => AsDouble(Item(array, i));
    private static int? GetInt(JsonElement array, int i) => AsInt(Item(array, i));

    private static double? AsDouble(JsonElement? e) =>
        e is { ValueKind: JsonValueKind.Number } v && v.TryGetDouble(out var d) ? d : null;

    private static int? AsInt(JsonElement? e) =>
        e is { ValueKind: JsonValueKind.Number } v && v.TryGetInt32(out var n) ? n : null;

    private static string Describe(int? code) => code switch
    {
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Cloudy",
        45 => "Fog",
        48 => "Depositing rime fog",
        51 => "Light drizzle",
        53 => "Moderate drizzle",
        55 => "Dense drizzle",
        61 => "Slight rain",
        63 => "Moderate rain",
        65 => "Heavy rain",
        71 => "Slight snow",
        73 => "Moderate snow",
        75 => "Heavy snow",
        80 => "Slight rain showers",
        81 => "Moderate rain showers",
        82 => "Violent rain showers",
        95 => "Thunderstorm",
        96 => "Thunderstorm with hail",
        99 => "Heavy thunderstorm with hail",
        _ => "Unknown"
    };
}
