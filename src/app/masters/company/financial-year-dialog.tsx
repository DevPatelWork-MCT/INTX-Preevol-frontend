"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconCalendar,
  IconCalendarPlus,
  IconTrash,
  IconPencil,
  IconBuilding,
  IconLoader,
} from "@tabler/icons-react"
import { useFinancialApi, type FinancialYearRow } from "@/hooks/useFinancialApi"
import type { CompanyRow } from "@/components/company-data-table"

interface FinancialYearDialogProps {
  company: CompanyRow | null
  open: boolean
  onClose: () => void
  onRefresh?: () => void
}

export function FinancialYearDialog({
  company,
  open,
  onClose,
  onRefresh,
}: FinancialYearDialogProps) {
  const { listFinancialYears, createFinancialYear, updateFinancialYear, deleteFinancialYear, loading } = useFinancialApi()
  const [financialYears, setFinancialYears] = React.useState<FinancialYearRow[]>([])
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)

  // Form state
  const [fyYear, setFyYear] = React.useState("")
  const [fyStartDate, setFyStartDate] = React.useState("")
  const [fyEndDate, setFyEndDate] = React.useState("")
  const [fySalesCount, setFySalesCount] = React.useState("")
  const [fyServiceCount, setFyServiceCount] = React.useState("")

  // Load financial years when dialog opens
  React.useEffect(() => {
    if (open && company) {
      listFinancialYears(company.CompanyID)
        .then((res) => {
          const data = Array.isArray(res?.data) ? res.data : []
          setFinancialYears(data)
        })
        .catch(() => {
          toast.error("Failed to load financial years")
        })
      resetForm()
      setShowAddForm(false)
      setEditingId(null)
    }
  }, [open, company, listFinancialYears])

  const resetForm = () => {
    setFyYear("")
    setFyStartDate("")
    setFyEndDate("")
    setFySalesCount("")
    setFyServiceCount("")
  }

  const handleAdd = async () => {
    if (!company || !fyYear || !fyStartDate || !fyEndDate) {
      toast.error("Please fill in all required fields")
      return
    }
    try {
      await createFinancialYear(company.CompanyID, {
        FinancialYear: fyYear,
        StartDate: new Date(fyStartDate).toISOString(),
        EndDate: new Date(fyEndDate).toISOString(),
        SalesInvoiceCount: fySalesCount || undefined,
        ServiceInvoiceCount: fyServiceCount || undefined,
      })
      toast.success("Financial year added")
      resetForm()
      setShowAddForm(false)
      // Reload
      const res = await listFinancialYears(company.CompanyID)
      setFinancialYears(Array.isArray(res?.data) ? res.data : [])
      onRefresh?.()
    } catch {
      toast.error("Failed to add financial year")
    }
  }

  const handleUpdate = async (fyId: number) => {
    if (!company) return
    try {
      const updates: Record<string, string> = {}
      if (fyYear) updates.FinancialYear = fyYear
      if (fyStartDate) updates.StartDate = new Date(fyStartDate).toISOString()
      if (fyEndDate) updates.EndDate = new Date(fyEndDate).toISOString()
      if (fySalesCount) updates.SalesInvoiceCount = fySalesCount
      if (fyServiceCount) updates.ServiceInvoiceCount = fyServiceCount

      await updateFinancialYear(company.CompanyID, fyId, updates)
      toast.success("Financial year updated")
      setEditingId(null)
      resetForm()
      const res = await listFinancialYears(company.CompanyID)
      setFinancialYears(Array.isArray(res?.data) ? res.data : [])
      onRefresh?.()
    } catch {
      toast.error("Failed to update financial year")
    }
  }

  const handleDelete = async (fyId: number) => {
    if (!company) return
    try {
      await deleteFinancialYear(company.CompanyID, fyId)
      toast.success("Financial year deleted")
      const res = await listFinancialYears(company.CompanyID)
      setFinancialYears(Array.isArray(res?.data) ? res.data : [])
      onRefresh?.()
    } catch {
      toast.error("Failed to delete financial year")
    }
  }

  const startEdit = (fy: FinancialYearRow) => {
    setEditingId(fy.FinancialYearID)
    setFyYear(fy.FinancialYear)
    setFyStartDate(fy.StartDate ? fy.StartDate.slice(0, 10) : "")
    setFyEndDate(fy.EndDate ? fy.EndDate.slice(0, 10) : "")
    setFySalesCount(fy.SalesInvoiceCount ?? "")
    setFyServiceCount(fy.ServiceInvoiceCount ?? "")
    setShowAddForm(false)
  }

  if (!company) return null

  const isActiveFY = (fy: FinancialYearRow) => {
    const now = new Date()
    const start = new Date(fy.StartDate)
    const end = new Date(fy.EndDate)
    return now >= start && now <= end
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-primary" />
            {company.Name}
          </DialogTitle>
          <DialogDescription>
            Manage financial years for this company
          </DialogDescription>
        </DialogHeader>

        {/* Existing financial years */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              Financial Years ({financialYears.length})
            </h4>
            {!showAddForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}
                className="gap-1 h-7"
              >
                <IconCalendarPlus className="h-3.5 w-3.5" />
                Add New
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <IconLoader className="h-5 w-5 animate-spin mr-2" />
              Loading…
            </div>
          )}

          {!loading && financialYears.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <IconCalendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No financial years yet</p>
              <p className="text-xs">Add one to get started</p>
            </div>
          )}

          {/* List of financial years */}
          <div className="space-y-2">
            {financialYears.map((fy) => (
              <div
                key={fy.FinancialYearID}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                {editingId === fy.FinancialYearID ? (
                  /* Edit form */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`fy-year-${fy.FinancialYearID}`} className="text-xs">Year Label *</Label>
                        <Input
                          id={`fy-year-${fy.FinancialYearID}`}
                          value={fyYear}
                          onChange={(e) => setFyYear(e.target.value)}
                          placeholder="e.g. 2025-26"
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fy-sales-${fy.FinancialYearID}`} className="text-xs">Sales Count</Label>
                        <Input
                          id={`fy-sales-${fy.FinancialYearID}`}
                          value={fySalesCount}
                          onChange={(e) => setFySalesCount(e.target.value)}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fy-start-${fy.FinancialYearID}`} className="text-xs">Start Date *</Label>
                        <Input
                          id={`fy-start-${fy.FinancialYearID}`}
                          type="date"
                          value={fyStartDate}
                          onChange={(e) => setFyStartDate(e.target.value)}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fy-end-${fy.FinancialYearID}`} className="text-xs">End Date *</Label>
                        <Input
                          id={`fy-end-${fy.FinancialYearID}`}
                          type="date"
                          value={fyEndDate}
                          onChange={(e) => setFyEndDate(e.target.value)}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); resetForm(); }}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(fy.FinancialYearID)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{fy.FinancialYear}</span>
                          {isActiveFY(fy) && (
                            <Badge variant="default" className="text-[10px] h-4 px-1">Active</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(fy.StartDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          {" → "}
                          {new Date(fy.EndDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(fy)}
                      >
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(fy.FinancialYearID)}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new form */}
          {showAddForm && (
            <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 space-y-3">
              <h5 className="text-sm font-medium flex items-center gap-1.5">
                <IconCalendarPlus className="h-4 w-4 text-primary" />
                New Financial Year
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-fy-year" className="text-xs">Year Label *</Label>
                  <Input
                    id="new-fy-year"
                    value={fyYear}
                    onChange={(e) => setFyYear(e.target.value)}
                    placeholder="e.g. 2025-26"
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-fy-sales" className="text-xs">Sales Count</Label>
                  <Input
                    id="new-fy-sales"
                    value={fySalesCount}
                    onChange={(e) => setFySalesCount(e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-fy-start" className="text-xs">Start Date *</Label>
                  <Input
                    id="new-fy-start"
                    type="date"
                    value={fyStartDate}
                    onChange={(e) => setFyStartDate(e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-fy-end" className="text-xs">End Date *</Label>
                  <Input
                    id="new-fy-end"
                    type="date"
                    value={fyEndDate}
                    onChange={(e) => setFyEndDate(e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} className="gap-1">
                  <IconCalendarPlus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
