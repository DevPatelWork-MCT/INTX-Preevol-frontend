import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export function useInvoiceApi() {
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

  const listInvoices = useCallback(
    (params?: { company?: string; partyId?: string; invoiceType?: string }) => {
      const query = new URLSearchParams()
      if (params?.company) query.set("company", params.company)
      if (params?.partyId) query.set("partyId", params.partyId)
      if (params?.invoiceType) query.set("invoiceType", params.invoiceType)
      const qs = query.toString()
      return handleRequest<any>(`/invoice${qs ? `?${qs}` : ""}`, { method: "GET" })
    },
    [handleRequest]
  )

  const getInvoice = useCallback(
    (id: string) => handleRequest<any>(`/invoice/${id}`, { method: "GET" }),
    [handleRequest]
  )

  const createInvoice = useCallback(
    (payload: any) =>
      handleRequest<any>("/invoice", { method: "POST", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const updateInvoice = useCallback(
    (id: string, payload: any) =>
      handleRequest<any>(`/invoice/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    [handleRequest]
  )

  const deleteInvoice = useCallback(
    (id: string) => handleRequest<any>(`/invoice/${id}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice }
}
