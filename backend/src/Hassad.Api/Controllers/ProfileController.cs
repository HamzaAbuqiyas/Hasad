using Hassad.Api.Common;
using Hassad.Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace Hassad.Api.Controllers;

/// <summary>
/// Older email-based profile endpoints, kept so nothing in Angular breaks.
/// Prefer /api/Auth/profile/{id}. These now check that the email belongs to the logged-in user.
/// </summary>
[ApiController]
[Route("api/Profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profiles;

    public ProfileController(IProfileService profiles) => _profiles = profiles;

    [HttpGet("status/{email}")]
    public async Task<IActionResult> GetStatus(string email, CancellationToken ct) =>
        (await _profiles.GetStatusByEmailAsync(email, ct)).ToActionResult();

    [HttpGet("{email}")]
    public async Task<IActionResult> Get(string email, CancellationToken ct) =>
        (await _profiles.GetByEmailAsync(email, ct)).ToActionResult();

    [HttpPut("update")]
    public async Task<IActionResult> Update(UpdateProfileByEmailRequest request, CancellationToken ct) =>
        (await _profiles.UpdateByEmailAsync(request, ct)).ToActionResult();
}
