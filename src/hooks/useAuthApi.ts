import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

/**
 * Hook providing authentication related API calls.
 */
export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = useCallback(
    async <T>(path: string, options?: RequestInit) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<T>(path, options);
        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const signIn = useCallback(
    (payload: { email: string; password: string }) =>
      handleRequest<any>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const signUp = useCallback(
    (payload: { email: string; password: string; firstName?: string; lastName?: string }) =>
      handleRequest<any>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const signOut = useCallback(
    () => handleRequest<any>("/auth/sign-out", { method: "POST" }),
    [handleRequest]
  );

  const getMe = useCallback(
    () => handleRequest<any>("/auth/me", { method: "GET" }),
    [handleRequest]
  );

  return { loading, error, signIn, signUp, signOut, getMe };
}
