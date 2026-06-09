/**
 * Simple API client wrapper for the backend.
 * Adjust BASE_URL as needed (e.g., from environment variables).
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  // If no content (204), return undefined
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}
