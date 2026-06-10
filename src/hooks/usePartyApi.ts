import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

/** Hook for Party related API calls */
export function usePartyApi() {
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

  const listParties = useCallback(
    () => handleRequest<any>("/party", { method: "GET" }),
    [handleRequest]
  );

  const getParty = useCallback(
    (id: string) => handleRequest<any>(`/party/${id}`, { method: "GET" }),
    [handleRequest]
  );

  const createParty = useCallback(
    (payload: any) =>
      handleRequest<any>("/party", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const updateParty = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/party/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const deleteParty = useCallback(
    (id: string) => handleRequest<any>(`/party/${id}`, { method: "DELETE" }),
    [handleRequest]
  );

  return { loading, error, listParties, getParty, createParty, updateParty, deleteParty };
}
