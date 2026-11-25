using Hassad.Api.Common;
using Hassad.Application.Insights;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Hassad.Api.Controllers;

[ApiController]
[Route("api/HasadAi")]
[EnableRateLimiting(RateLimits.Ai)]
public class HasadAiController : ControllerBase
{
    private readonly IInsightService _insights;

    public HasadAiController(IInsightService insights) => _insights = insights;

    [HttpPost("explain")]
    public async Task<IActionResult> Explain(ExplainPredictionRequest request, CancellationToken ct) =>
        (await _insights.ExplainAsync(request, ct)).ToActionResult();

    [HttpPost("ask")]
    public async Task<IActionResult> Ask(AskHasadAiRequest request, CancellationToken ct) =>
        (await _insights.AskAsync(request, ct)).ToActionResult();
}
