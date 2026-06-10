import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

/** Hook for Bank related API calls */
export function useBankApi() {
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

  const listBanks = useCallback(
    () => handleRequest<any>("/bank", { method: "GET" }),
    [handleRequest]
  );

  const getBank = useCallback(
    (id: string) => handleRequest<any>(`/bank/${id}`, { method: "GET" }),
    [handleRequest]
  );

  const createBank = useCallback(
    (payload: any) =>
      handleRequest<any>("/bank", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const updateBank = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/bank/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const deleteBank = useCallback(
    (id: string) => handleRequest<any>(`/bank/${id}`, { method: "DELETE" }),
    [handleRequest]
  );

  return { loading, error, listBanks, getBank, createBank, updateBank, deleteBank };
}
