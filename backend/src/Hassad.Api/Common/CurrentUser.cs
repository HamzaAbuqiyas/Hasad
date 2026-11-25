using System.Security.Claims;
using Hassad.Application.Common.Interfaces;

namespace Hassad.Api.Common;

/// <summary>Reads the logged-in user from the JWT of the current HTTP request.</summary>
public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    private ClaimsPrincipal? Principal => _accessor.HttpContext?.User;

    public int? UserId =>
        int.TryParse(Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public bool IsAdmin => Principal?.IsInRole("Admin") == true;
}
