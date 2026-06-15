import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useQuotationApi() {
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

  const listQuotations = useCallback(
    (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
      const query = new URLSearchParams()
      if (params?.page) query.set("page", String(params.page))
      if (params?.limit) query.set("limit", String(params.limit))
      if (params?.search) query.set("search", params.search)
      if (params?.sortBy) query.set("sortBy", params.sortBy)
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder)
      const qs = query.toString()
      return handleRequest<any>(`/quotation${qs ? `?${qs}` : ""}`, { method: "GET" })
    },
    [handleRequest]
  )

  const getQuotation = useCallback(
    (id: string) => handleRequest<any>(`/quotation/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createQuotation = useCallback(
    (payload: any) =>
      handleRequest<any>("/quotation", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateQuotation = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/quotation/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteQuotation = useCallback(
    (id: string) => handleRequest<any>(`/quotation/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listQuotations, getQuotation, createQuotation, updateQuotation, deleteQuotation }
}
