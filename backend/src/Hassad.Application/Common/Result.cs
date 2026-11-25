namespace Hassad.Application.Common;

/// <summary>What kind of failure happened. The API layer turns each kind into an HTTP status code.</summary>
public enum ErrorType
{
    Validation,   // 400
    NotFound,     // 404
    Forbidden,    // 403
    Conflict,     // 409
    Unavailable,  // 503 - an outside service is down
    Upstream      // the outside service answered with an error (status code passed through)
}

public sealed record Error(ErrorType Type, string Message, int? StatusCode = null, string? Details = null)
{
    public static Error Validation(string message) => new(ErrorType.Validation, message);
    public static Error NotFound(string message) => new(ErrorType.NotFound, message);
    public static Error Forbidden(string message = "You are not allowed to do this.") => new(ErrorType.Forbidden, message);
    public static Error Conflict(string message) => new(ErrorType.Conflict, message);
    public static Error Unavailable(string message) => new(ErrorType.Unavailable, message);
    public static Error Upstream(string message, int statusCode, string? details = null) => new(ErrorType.Upstream, message, statusCode, details);
}

/// <summary>
/// A service returns a Result instead of throwing exceptions for normal failures
/// ("email already exists", "not found"...). Exceptions are only for real bugs/outages.
/// </summary>
public class Result
{
    protected Result(Error? error) => Error = error;

    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    public static Result Success() => new(null);
    public static Result Failure(Error error) => new(error);

    public static implicit operator Result(Error error) => Failure(error);
}

public sealed class Result<T> : Result
{
    private Result(T value) : base(null) => Value = value;
    private Result(Error error) : base(error) => Value = default;

    public T? Value { get; }

    public static Result<T> Success(T value) => new(value);
    public new static Result<T> Failure(Error error) => new(error);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}

/// <summary>Simple success body: { "message": "..." }.</summary>
public sealed record MessageResponse(string Message);
