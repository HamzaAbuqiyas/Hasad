using Hassad.Api.Common;
using Hassad.Application.Weather;
using Microsoft.AspNetCore.Mvc;

namespace Hassad.Api.Controllers;

[ApiController]
[Route("api/Weather")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weather;

    public WeatherController(IWeatherService weather) => _weather = weather;

    [HttpGet("amman")]
    public async Task<IActionResult> GetAmman(CancellationToken ct) =>
        (await _weather.GetAmmanAsync(ct)).ToActionResult();
}
