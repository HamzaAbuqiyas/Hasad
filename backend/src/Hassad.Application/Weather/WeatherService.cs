using Hassad.Application.Common;

namespace Hassad.Application.Weather;

public interface IWeatherClient
{
    Task<Result<WeatherReportDto>> GetForecastAsync(string city, string country, double latitude, double longitude, CancellationToken ct = default);
}

public interface IWeatherService
{
    Task<Result<WeatherReportDto>> GetAmmanAsync(CancellationToken ct = default);
}

public sealed class WeatherService : IWeatherService
{
    private const double AmmanLatitude = 31.9539;
    private const double AmmanLongitude = 35.9106;

    private readonly IWeatherClient _client;

    public WeatherService(IWeatherClient client) => _client = client;

    public Task<Result<WeatherReportDto>> GetAmmanAsync(CancellationToken ct = default) =>
        _client.GetForecastAsync("Amman", "Jordan", AmmanLatitude, AmmanLongitude, ct);
}
