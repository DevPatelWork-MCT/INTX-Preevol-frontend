import { useState, useCallback } from "react"
import { apiRequest } from "../lib/apiClient"

export interface FinancialYearRow {
  FinancialYearID: number
  CompanyID: number
  FinancialYear: string
  StartDate: string
  EndDate: string
  SalesInvoiceCount: string | null
  ServiceInvoiceCount: string | null
  ProformaSalesInvoiceCount: string | null
  ProformaServiceInvoiceCount: string | null
  QuotationCount: string | null
  ProposalCount: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateFinancialYearPayload {
  FinancialYear: string
  StartDate: string
  EndDate: string
  SalesInvoiceCount?: string
  ServiceInvoiceCount?: string
  ProformaSalesInvoiceCount?: string
  ProformaServiceInvoiceCount?: string
  QuotationCount?: string
  ProposalCount?: string
}

export function useFinancialApi() {
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

  const listFinancialYears = useCallback(
    (companyId: number) =>
      handleRequest<{ data: FinancialYearRow[] }>(`/company/${companyId}/financial-years`, { method: "GET" }),
    [handleRequest]
  )

  const createFinancialYear = useCallback(
    (companyId: number, payload: CreateFinancialYearPayload) =>
      handleRequest<{ data: FinancialYearRow }>(`/company/${companyId}/financial-years`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  )

  const updateFinancialYear = useCallback(
    (companyId: number, financialYearId: number, payload: Partial<CreateFinancialYearPayload>) =>
      handleRequest<{ data: FinancialYearRow }>(`/company/${companyId}/financial-years/${financialYearId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    [handleRequest]
  )

  const deleteFinancialYear = useCallback(
    (companyId: number, financialYearId: number) =>
      handleRequest<unknown>(`/company/${companyId}/financial-years/${financialYearId}`, { method: "DELETE" }),
    [handleRequest]
  )

  return { loading, error, listFinancialYears, createFinancialYear, updateFinancialYear, deleteFinancialYear }
}
