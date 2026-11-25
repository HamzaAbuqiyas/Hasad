using Hassad.Api.Common;
using Hassad.Application.Predictions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Hassad.Api.Controllers;

[ApiController]
[Route("api/Predictions")]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionService _predictions;

    public PredictionsController(IPredictionService predictions) => _predictions = predictions;

    [HttpPost("predict")]
    [EnableRateLimiting(RateLimits.Ai)]
    public async Task<IActionResult> Predict(PredictionRequest request, CancellationToken ct) =>
        (await _predictions.PredictAsync(request, ct)).ToActionResult();

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetUserPredictions(int userId, CancellationToken ct) =>
        (await _predictions.GetForUserAsync(userId, null, ct)).ToActionResult();

    [HttpGet("latest/{userId:int}")]
    public async Task<IActionResult> GetLatest(int userId, CancellationToken ct) =>
        (await _predictions.GetForUserAsync(userId, PredictionService.LatestCount, ct)).ToActionResult();
}
