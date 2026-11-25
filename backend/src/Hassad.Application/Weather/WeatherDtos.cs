namespace Hassad.Application.Weather;

public sealed record CurrentWeatherDto(
    string? Time,
    double? Temperature,
    int? Humidity,
    double? Precipitation,
    double? WindSpeed,
    int? WeatherCode,
    string Condition);

public sealed record DailyForecastDto(
    string? Date,
    double? MaxTemperature,
    double? MinTemperature,
    double? Precipitation,
    int? WeatherCode,
    string Condition);

public sealed record WeatherReportDto(
    string City,
    string Country,
    double Latitude,
    double Longitude,
    CurrentWeatherDto Current,
    IReadOnlyList<DailyForecastDto> DailyForecast);
