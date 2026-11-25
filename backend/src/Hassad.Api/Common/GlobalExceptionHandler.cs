using Hassad.Application.Common;
using Microsoft.AspNetCore.Diagnostics;

namespace Hassad.Api.Common;

/// <summary>
/// Catches any unexpected exception: logs the full details for us,
/// and returns a short message to the client (no stack traces or internal errors leak out).
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        _logger.LogError(exception, "Unhandled error on {Method} {Path}", context.Request.Method, context.Request.Path);

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var message = _env.IsDevelopment()
            ? $"Something went wrong: {exception.Message}"
            : "Something went wrong. Please try again later.";

        await context.Response.WriteAsJsonAsync(new MessageResponse(message), ct);
        return true;
    }
}
