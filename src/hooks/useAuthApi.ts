import { useState, useCallback } from "react";
import { apiRequest, setAuthToken } from "../lib/apiClient";

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
    async (payload: { email: string; password: string; companyId: number }) => {
      const response = await handleRequest<any>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Backend returns { message, data: { token, companyId, companyName, expiresAt } }
      if (response && typeof response === "object" && response.data && "token" in response.data) {
        setAuthToken(response.data.token);
      }
      return response;
    },
    [handleRequest]
  );

  const signUp = useCallback(
    async (payload: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await handleRequest<any>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Backend may return token similarly after signup (if implemented)
      if (response && typeof response === "object" && response.data && "token" in response.data) {
        const token = response.data.token as string;
        document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        setAuthToken(token);
      }
      return response;
    },
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
