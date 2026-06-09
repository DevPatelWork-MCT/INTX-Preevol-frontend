import { useState, useCallback } from "react";
import { apiRequest } from "../lib/apiClient";

/**
 * Hook providing admin related API calls.
 * Each function returns a promise and also exposes loading / error state.
 */
export function useAdminApi() {
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

  const listUsers = useCallback(
    () => handleRequest<any>("/admin/users", { method: "GET" }),
    [handleRequest]
  );

  const getUser = useCallback(
    (id: string) => handleRequest<any>(`/admin/users/${id}`, { method: "GET" }),
    [handleRequest]
  );

  const approveUser = useCallback(
    (id: string, payload: { roleId?: number; grantAdmin?: boolean }) =>
      handleRequest<any>(`/admin/users/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const rejectUser = useCallback(
    (id: string) =>
      handleRequest<any>(`/admin/users/${id}/reject`, { method: "PATCH" }),
    [handleRequest]
  );

  const updateUserRole = useCallback(
    (id: string, payload: { roleId: number | null }) =>
      handleRequest<any>(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const listRoles = useCallback(
    () => handleRequest<any>("/admin/roles", { method: "GET" }),
    [handleRequest]
  );

  const createRole = useCallback(
    (payload: { roleName: string; company: string }) =>
      handleRequest<any>("/admin/roles", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const updateRole = useCallback(
    (id: string, payload: { roleName?: string; company?: string }) =>
      handleRequest<any>(`/admin/roles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  );

  const deleteRole = useCallback(
    (id: string) =>
      handleRequest<any>(`/admin/roles/${id}`, { method: "DELETE" }),
    [handleRequest]
  );

  return {
    loading,
    error,
    listUsers,
    getUser,
    approveUser,
    rejectUser,
    updateUserRole,
    listRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}
