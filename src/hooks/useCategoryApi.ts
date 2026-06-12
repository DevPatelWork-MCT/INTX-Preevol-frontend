import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useCategoryApi() {
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

  const listCategories = useCallback(
    () => handleRequest<any>("/category", { method: "GET" }),
    [handleRequest]
  )

  const getCategory = useCallback(
    (id: string) => handleRequest<any>(`/category/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createCategory = useCallback(
    (payload: any) =>
      handleRequest<any>("/category", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateCategory = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/category/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteCategory = useCallback(
    (id: string) => handleRequest<any>(`/category/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  const listSubCategories = useCallback(
    (categoryId?: string) => {
      const qs = categoryId ? `?categoryId=${categoryId}` : ""
      return handleRequest<any>(`/category/sub/all${qs}`, { method: "GET" })
    },
    [handleRequest]
  )

  const createSubCategory = useCallback(
    (payload: any) =>
      handleRequest<any>("/category/sub", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateSubCategory = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/category/sub/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteSubCategory = useCallback(
    (id: string) => handleRequest<any>(`/category/sub/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listCategories, getCategory, createCategory, updateCategory, deleteCategory, listSubCategories, createSubCategory, updateSubCategory, deleteSubCategory }
}
