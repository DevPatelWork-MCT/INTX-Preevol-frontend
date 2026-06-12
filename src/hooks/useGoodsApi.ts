import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useGoodsApi() {
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

  // Goods
  const listGoods = useCallback(
    () => handleRequest<any>("/goods", { method: "GET" }),
    [handleRequest]
  )

  const getGood = useCallback(
    (id: string) => handleRequest<any>(`/goods/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createGood = useCallback(
    (payload: any) =>
      handleRequest<any>("/goods", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateGood = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/goods/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteGood = useCallback(
    (id: string) => handleRequest<any>(`/goods/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  // Inventory
  const listInventory = useCallback(
    (params?: { goodsId?: string; company?: string }) => {
      const query = new URLSearchParams()
      if (params?.goodsId) query.set("goodsId", params.goodsId)
      if (params?.company) query.set("company", params.company)
      const qs = query.toString()
      return handleRequest<any>(`/goods/inventory/all${qs ? `?${qs}` : ""}`, { method: "GET" })
    },
    [handleRequest]
  )

  const createInventory = useCallback(
    (payload: any) =>
      handleRequest<any>("/goods/inventory", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateInventory = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/goods/inventory/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteInventory = useCallback(
    (id: string) => handleRequest<any>(`/goods/inventory/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listGoods, getGood, createGood, updateGood, deleteGood, listInventory, createInventory, updateInventory, deleteInventory }
}
