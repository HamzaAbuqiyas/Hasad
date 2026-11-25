import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns any error from an API call into one readable sentence.
 * The Hassad API always answers errors as { "message": "..." }.
 */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Make sure the Hassad API is running.';
    }
    if (error.status === 429) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    const body = error.error as { message?: unknown } | string | null;
    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message) {
      return body.message;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return 'The request took too long. Please try again.';
  }

  return fallback;
}
