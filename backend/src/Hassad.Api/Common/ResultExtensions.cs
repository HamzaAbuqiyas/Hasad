using Hassad.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace Hassad.Api.Common;

/// <summary>Turns an Application Result into an HTTP response. Every error body is { "message": "..." }.</summary>
public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result) =>
        result.IsSuccess ? new OkObjectResult(result.Value) : ToErrorResult(result.Error!);

    public static IActionResult ToErrorResult(Error error)
    {
        var status = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unavailable => StatusCodes.Status503ServiceUnavailable,
            ErrorType.Upstream => error.StatusCode is >= 400 and < 600 ? error.StatusCode.Value : StatusCodes.Status502BadGateway,
            _ => StatusCodes.Status500InternalServerError
        };

        return new ObjectResult(new MessageResponse(error.Message)) { StatusCode = status };
    }
}
