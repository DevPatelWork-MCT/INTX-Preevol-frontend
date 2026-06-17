import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

export interface CompanyListResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for Company related API calls.
 * Matches backend routes: /company/* 
 */
export function useCompanyApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = useCallback(
    async <T>(path: string, options?: RequestInit): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<T>(path, options);
        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    []
  );

  const listCompanies = useCallback(
    (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
      const query = new URLSearchParams()
      if (params?.page) query.set("page", String(params.page))
      if (params?.limit) query.set("limit", String(params.limit))
      if (params?.search) query.set("search", params.search)
      if (params?.sortBy) query.set("sortBy", params.sortBy)
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder)
      const qs = query.toString()
      return handleRequest<CompanyListResponse>(`/company${qs ? `?${qs}` : ""}`, { method: "GET" })
    },
    [handleRequest]
  );

  const getCompany = useCallback(
    (id: string | number) => handleRequest<any>(`/company/${id}?includeFinancialYears=true`, { method: "GET" }),
    [handleRequest]
  );

  const createCompany = useCallback(
    (payload: any) =>
      handleRequest<any>("/company", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const updateCompany = useCallback(
    (id: string | number, payload: any) =>
      handleRequest<any>(`/company/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  );

  const deleteCompany = useCallback(
    (id: string | number) => handleRequest<any>(`/company/${id}`, { method: "DELETE" }),
    [handleRequest]
  );

  return { loading, error, listCompanies, getCompany, createCompany, updateCompany, deleteCompany };
}
