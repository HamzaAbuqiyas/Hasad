using Hassad.Api.Common;
using Hassad.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Hassad.Api.Controllers;

[ApiController]
[Route("api/SignUp")]
[AllowAnonymous]
public class SignUpController : ControllerBase
{
    private readonly IAuthService _auth;

    public SignUpController(IAuthService auth) => _auth = auth;

    [HttpPost]
    [EnableRateLimiting(RateLimits.Auth)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct) =>
        (await _auth.RegisterAsync(request, ct)).ToActionResult();
}
