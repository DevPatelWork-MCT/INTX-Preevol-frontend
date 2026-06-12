import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useProductApi() {
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

  const listProducts = useCallback(
    (params?: { categoryId?: string; company?: string }) => {
      const query = new URLSearchParams()
      if (params?.categoryId) query.set("categoryId", params.categoryId)
      if (params?.company) query.set("company", params.company)
      const qs = query.toString()
      return handleRequest<any>(`/product${qs ? `?${qs}` : ""}`, { method: "GET" })
    },
    [handleRequest]
  )

  const getProduct = useCallback(
    (id: string) => handleRequest<any>(`/product/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createProduct = useCallback(
    (payload: any) =>
      handleRequest<any>("/product", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateProduct = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/product/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteProduct = useCallback(
    (id: string) => handleRequest<any>(`/product/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  const listPOProducts = useCallback(
    () => handleRequest<any>("/product/po/all", { method: "GET" }),
    [handleRequest]
  )

  const createPOProduct = useCallback(
    (payload: any) =>
      handleRequest<any>("/product/po", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updatePOProduct = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/product/po/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deletePOProduct = useCallback(
    (id: string) => handleRequest<any>(`/product/po/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listProducts, getProduct, createProduct, updateProduct, deleteProduct, listPOProducts, createPOProduct, updatePOProduct, deletePOProduct }
}
