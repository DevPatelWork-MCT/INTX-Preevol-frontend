import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useVendorApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleRequest = useCallback(
    async <T>(path: string, options?: RequestInit) => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiRequest<T>(path, options)
        setLoading(false)
        return data
      } catch (err) {
        setLoading(false)
        setError(err as Error)
        throw err
      }
    },
    []
  )

  const listVendors = useCallback(
    () => handleRequest<any>("/vendor", { method: "GET" }),
    [handleRequest]
  )

  const getVendor = useCallback(
    (id: string) => handleRequest<any>(`/vendor/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createVendor = useCallback(
    (payload: any) =>
      handleRequest<any>("/vendor", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateVendor = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/vendor/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteVendor = useCallback(
    (id: string) => handleRequest<any>(`/vendor/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listVendors, getVendor, createVendor, updateVendor, deleteVendor }
}
