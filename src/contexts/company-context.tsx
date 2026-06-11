"use client"

import * as React from "react"
import { useCompanyApi } from "@/hooks/useCompanyApi"

export interface SelectedCompany {
  CompanyID: number
  Name: string
}

interface CompanyContextType {
  selectedCompany: SelectedCompany | null
  companies: SelectedCompany[]
  loading: boolean
  selectCompany: (company: SelectedCompany) => void
  refreshCompanies: () => void
}

const CompanyContext = React.createContext<CompanyContextType | null>(null)

const STORAGE_KEY = "selectedCompanyId"

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { listCompanies } = useCompanyApi()
  const [companies, setCompanies] = React.useState<SelectedCompany[]>([])
  const [selectedCompany, setSelectedCompany] = React.useState<SelectedCompany | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch companies on mount
  const fetchCompanies = React.useCallback(() => {
    setLoading(true)
    listCompanies({ page: 1, limit: 100 })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped: SelectedCompany[] = rows.map((c: any) => ({
          CompanyID: c.CompanyID,
          Name: c.Name,
        }))
        setCompanies(mapped)

        // Restore selected company from localStorage
        try {
          const savedId = localStorage.getItem(STORAGE_KEY)
          if (savedId) {
            const found = mapped.find((c) => c.CompanyID === Number(savedId))
            if (found) {
              setSelectedCompany(found)
              return
            }
          }
        } catch {}
        // Default to first company
        if (mapped.length > 0) {
          setSelectedCompany(mapped[0])
          localStorage.setItem(STORAGE_KEY, String(mapped[0].CompanyID))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [listCompanies])

  React.useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const selectCompany = React.useCallback((company: SelectedCompany) => {
    setSelectedCompany(company)
    localStorage.setItem(STORAGE_KEY, String(company.CompanyID))
  }, [])

  return (
    <CompanyContext.Provider value={{ selectedCompany, companies, loading, selectCompany, refreshCompanies: fetchCompanies }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = React.useContext(CompanyContext)
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider")
  return ctx
}
