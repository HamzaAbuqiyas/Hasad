using Hassad.Api.Common;
using Hassad.Application.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hassad.Api.Controllers;

[ApiController]
[Route("api/Admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin) => _admin = admin;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct) => Ok(await _admin.GetSummaryAsync(ct));

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken ct) => Ok(await _admin.GetUsersAsync(ct));

    [HttpPut("users/{id:int}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, UpdateUserStatusRequest request, CancellationToken ct) =>
        (await _admin.UpdateUserStatusAsync(id, request, ct)).ToActionResult();

    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, UpdateUserRoleRequest request, CancellationToken ct) =>
        (await _admin.UpdateUserRoleAsync(id, request, ct)).ToActionResult();

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken ct) =>
        (await _admin.DeleteUserAsync(id, ct)).ToActionResult();

    [HttpGet("predictions")]
    public async Task<IActionResult> GetPredictions(CancellationToken ct) => Ok(await _admin.GetPredictionsAsync(ct));

    [HttpDelete("predictions/{id:int}")]
    public async Task<IActionResult> DeletePrediction(int id, CancellationToken ct) =>
        (await _admin.DeletePredictionAsync(id, ct)).ToActionResult();
}
