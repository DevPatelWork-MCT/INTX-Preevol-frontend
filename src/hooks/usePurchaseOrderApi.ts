import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function usePurchaseOrderApi() {
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

  const listPurchaseOrders = useCallback(
    () => handleRequest<any>("/purchase-order", { method: "GET" }),
    [handleRequest]
  )

  const getPurchaseOrder = useCallback(
    (id: string) => handleRequest<any>(`/purchase-order/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createPurchaseOrder = useCallback(
    (payload: any) =>
      handleRequest<any>("/purchase-order", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updatePurchaseOrder = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/purchase-order/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deletePurchaseOrder = useCallback(
    (id: string) => handleRequest<any>(`/purchase-order/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder }
}
