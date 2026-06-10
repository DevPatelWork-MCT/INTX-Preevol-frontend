import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

/**
 * Hook for Company related API calls.
 * Adjust the endpoint paths to match your backend routes.
 */
export function useCompanyApi() {
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

  const listCompanies = useCallback(
    () => handleRequest<any>("/company", { method: "GET" }),
    [handleRequest]
  );

  const getCompany = useCallback(
    (id: string) => handleRequest<any>(`/company/${id}`, { method: "GET" }),
    [handleRequest]
  );

  const createCompany = useCallback(
    (payload: any) =>
      handleRequest<any>("/company", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const updateCompany = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/company/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const deleteCompany = useCallback(
    (id: string) => handleRequest<any>(`/company/${id}`, { method: "DELETE" }),
    [handleRequest]
  );

  return { loading, error, listCompanies, getCompany, createCompany, updateCompany, deleteCompany };
}
