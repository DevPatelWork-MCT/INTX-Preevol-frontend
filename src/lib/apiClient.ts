/**
 * Simple API client wrapper for the backend.
 * Adjust BASE_URL as needed (e.g., from environment variables).
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

/**
 * Retrieve the stored auth token (if any).
 * The token is expected to be saved under the key "authToken" in localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  // Prefer token from localStorage (set by apiClient after login)
  try {
    const ls = localStorage.getItem("authToken");
    if (ls) return ls;
  } catch {}
  // Fallback: read from cookies (e.g., set by server or signIn)
  const match = document.cookie.match(/(?:^|; )authToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Save the auth token for future requests.
 * Exported so other parts of the app (e.g., login flow) can store it.
 */
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let authToken = getAuthToken();
  // Clean token: remove any leading "$" or "Bearer " strings
  if (authToken) {
    authToken = authToken.replace(/^\$+/, "");
    authToken = authToken.replace(/^Bearer\s+/i, "");
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  // Save auth token from response headers if provided (e.g., after login)
  const authHeader = response.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    setAuthToken(authHeader.replace(/^Bearer\s+/i, ""));
  }

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
