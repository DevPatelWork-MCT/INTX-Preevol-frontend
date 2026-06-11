"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  CompanyDataTable,
  type CompanyRow,
  type PaginationInfo,
} from "@/components/company-data-table"
import { useCompanyApi } from "@/hooks/useCompanyApi"
import { FinancialYearDialog } from "./financial-year-dialog"

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export default function CompanyPage() {
  const router = useRouter()
  const { listCompanies, deleteCompany, loading, error } = useCompanyApi()
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION)
  const [search, setSearch] = useState("")
  const [apiError, setApiError] = useState<string | null>(null)

  // Financial year dialog state
  const [fyDialogCompany, setFyDialogCompany] = useState<CompanyRow | null>(null)
  const [fyDialogOpen, setFyDialogOpen] = useState(false)

  // Fetch companies whenever page, limit, or search changes
  useEffect(() => {
    let cancelled = false
    listCompanies({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
      .then((res) => {
        if (cancelled) return
        setApiError(null)
        const rows = Array.isArray(res?.data) ? res.data : []
        setCompanies(rows as CompanyRow[])
        if (res?.pagination) {
          setPagination(res.pagination)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Failed to load companies"
        setApiError(message)
      })
    return () => { cancelled = true }
  }, [listCompanies, pagination.page, pagination.limit, search])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (limit: number) => {
    setPagination({ page: 1, limit, total: pagination.total, totalPages: Math.ceil(pagination.total / limit) })
  }

  const handleSearchChange = (search: string) => {
    setSearch(search)
    setPagination((prev) => ({ ...prev, page: 1 })) // reset to page 1 on search
  }

  const handleDelete = async (id: number) => {
    await deleteCompany(String(id))
    // Re-fetch current page
    listCompanies({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : []
        setCompanies(rows as CompanyRow[])
        if (res?.pagination) setPagination(res.pagination)
      })
      .catch(() => {})
  }

  const handleEdit = (row: CompanyRow) => {
    router.push(`/masters/company/edit/${row.CompanyID}`)
  }

  const handleAddFinancialYear = (row: CompanyRow) => {
    setFyDialogCompany(row)
    setFyDialogOpen(true)
  }

  const handleViewFinancialYears = (row: CompanyRow) => {
    setFyDialogCompany(row)
    setFyDialogOpen(true)
  }

  const handleFinancialYearRefresh = () => {
    // Re-fetch companies to update latestFinancialYear
    listCompanies({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : []
        setCompanies(rows as CompanyRow[])
        if (res?.pagination) setPagination(res.pagination)
      })
      .catch(() => {})
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header card */}
              <Card className="mx-4 lg:mx-6">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl">Companies</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your company masters
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/masters/company/create">Add Company</a>
                  </Button>
                </CardHeader>
              </Card>

              {/* Error banner */}
              {(apiError || error) && (
                <div className="mx-4 lg:mx-6">
                  <Alert variant="destructive" className="relative">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {apiError ?? error?.message}
                    </AlertDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setApiError(null)}
                    >
                      ✕
                    </Button>
                  </Alert>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="mx-4 lg:mx-6">
                  <p className="text-muted-foreground text-sm">Loading companies…</p>
                </div>
              )}

              {/* Data table card */}
              <Card className="mx-4 lg:mx-6">
                <CardContent className="p-0">
                  <CompanyDataTable
                    data={companies}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearchChange={handleSearchChange}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onAddFinancialYear={handleAddFinancialYear}
                    onViewFinancialYears={handleViewFinancialYears}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>

    {/* Financial Year Dialog */}
    <FinancialYearDialog
      company={fyDialogCompany}
      open={fyDialogOpen}
      onClose={() => setFyDialogOpen(false)}
      onRefresh={handleFinancialYearRefresh}
    />
  )
}
