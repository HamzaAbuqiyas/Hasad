using Hassad.Api.Common;
using Hassad.Application.Auth;
using Hassad.Application.Profiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Hassad.Api.Controllers;

// A controller now has ONE job: take the HTTP request, call a service, return the result.
// Same URLs as the old project, so the Angular app does not need to change.
[ApiController]
[Route("api/Auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IProfileService _profiles;

    public AuthController(IAuthService auth, IProfileService profiles)
    {
        _auth = auth;
        _profiles = profiles;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimits.Auth)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct) =>
        (await _auth.LoginAsync(request, ct)).ToActionResult();

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimits.Auth)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct) =>
        (await _auth.ForgotPasswordAsync(request, ct)).ToActionResult();

    [HttpPost("verify-reset-code")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimits.Auth)]
    public async Task<IActionResult> VerifyResetCode(VerifyResetCodeRequest request, CancellationToken ct) =>
        (await _auth.VerifyResetCodeAsync(request, ct)).ToActionResult();

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimits.Auth)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken ct) =>
        (await _auth.ResetPasswordAsync(request, ct)).ToActionResult();

    [HttpGet("profile/{id:int}")]
    public async Task<IActionResult> GetProfile(int id, CancellationToken ct) =>
        (await _profiles.GetAsync(id, ct)).ToActionResult();

    [HttpPut("profile/{id:int}")]
    public async Task<IActionResult> UpdateProfile(int id, UpdateProfileRequest request, CancellationToken ct) =>
        (await _profiles.UpdateAsync(id, request, ct)).ToActionResult();
}
