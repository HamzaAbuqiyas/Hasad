using Hassad.Application.Common.Interfaces;

namespace Hassad.Application.Common;

/// <summary>
/// One place for "who may see what". Before, each controller checked this differently (or not at all),
/// so any logged-in user could read and change other users' profiles and predictions.
/// </summary>
public static class AccessRules
{
    public static bool CanAccessUser(this ICurrentUser current, int userId) =>
        current.IsAdmin || current.UserId == userId;
}
