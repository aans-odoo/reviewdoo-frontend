/**
 * Shared helpers for turning an unknown thrown value (typically an Axios error)
 * into a user-facing message. Centralised so every page extracts API errors the
 * same way instead of repeating the `err.response.data.error.message` dance.
 */

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { error?: { message?: string } };
  };
}

/**
 * Extracts the backend error message from a caught value, falling back to
 * `fallback` when the value isn't a recognised API error or carries no message.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const apiErr = err as ApiErrorShape;
  return apiErr.response?.data?.error?.message ?? fallback;
}

/** Returns the HTTP status code from a caught Axios-style error, if present. */
export function getApiErrorStatus(err: unknown): number | undefined {
  return (err as ApiErrorShape).response?.status;
}
