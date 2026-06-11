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
  IconX,
} from "@tabler/icons-react"
import { useFinancialApi, type FinancialYearRow } from "@/hooks/useFinancialApi"
import type { CompanyRow } from "@/components/company-data-table"

interface FinancialYearDialogProps {
  company: CompanyRow | null
  open: boolean
  onClose: () => void
  onRefresh?: () => void
}

const emptyForm = {
  year: "",
  startDate: "",
  endDate: "",
  salesCount: "",
  serviceCount: "",
  proformaSalesCount: "",
  proformaServiceCount: "",
  quotationCount: "",
  proposalCount: "",
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

  // Form state — all 9 fields from DB schema
  const [form, setForm] = React.useState({ ...emptyForm })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  // Auto-generate year label from start/end dates (e.g. 01-04-2026 → 31-03-2027 = "26-27")
  React.useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startYY = String(start.getFullYear()).slice(-2)
        const endYY = String(end.getFullYear()).slice(-2)
        const label = `${startYY}-${endYY}`
        setForm((prev) => {
          // Only auto-fill if user hasn't manually typed a year label
          if (!prev.year || prev.year === `${startYY}-${endYY}` || /^\d{2}-\d{2}$/.test(prev.year)) {
            return { ...prev, year: label }
          }
          return prev
        })
      }
    }
  }, [form.startDate, form.endDate])

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

  const resetForm = () => setForm({ ...emptyForm })

  const loadForm = (fy: FinancialYearRow) => {
    setForm({
      year: fy.FinancialYear,
      startDate: fy.StartDate ? fy.StartDate.slice(0, 10) : "",
      endDate: fy.EndDate ? fy.EndDate.slice(0, 10) : "",
      salesCount: fy.SalesInvoiceCount ?? "",
      serviceCount: fy.ServiceInvoiceCount ?? "",
      proformaSalesCount: fy.ProformaSalesInvoiceCount ?? "",
      proformaServiceCount: fy.ProformaServiceInvoiceCount ?? "",
      quotationCount: fy.QuotationCount ?? "",
      proposalCount: fy.ProposalCount ?? "",
    })
  }

  const handleAdd = async () => {
    if (!company || !form.year || !form.startDate || !form.endDate) {
      toast.error("Please fill in Year Label, Start Date, and End Date")
      return
    }
    try {
      await createFinancialYear(company.CompanyID, {
        FinancialYear: form.year,
        StartDate: new Date(form.startDate).toISOString(),
        EndDate: new Date(form.endDate).toISOString(),
        SalesInvoiceCount: form.salesCount || undefined,
        ServiceInvoiceCount: form.serviceCount || undefined,
        ProformaSalesInvoiceCount: form.proformaSalesCount || undefined,
        ProformaServiceInvoiceCount: form.proformaServiceCount || undefined,
        QuotationCount: form.quotationCount || undefined,
        ProposalCount: form.proposalCount || undefined,
      })
      toast.success("Financial year added")
      resetForm()
      setShowAddForm(false)
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
      await updateFinancialYear(company.CompanyID, fyId, {
        FinancialYear: form.year || undefined,
        StartDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        EndDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        SalesInvoiceCount: form.salesCount || undefined,
        ServiceInvoiceCount: form.serviceCount || undefined,
        ProformaSalesInvoiceCount: form.proformaSalesCount || undefined,
        ProformaServiceInvoiceCount: form.proformaServiceCount || undefined,
        QuotationCount: form.quotationCount || undefined,
        ProposalCount: form.proposalCount || undefined,
      })
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
    loadForm(fy)
    setShowAddForm(false)
  }

  if (!company) return null

  const isActiveFY = (fy: FinancialYearRow) => {
    const now = new Date()
    return now >= new Date(fy.StartDate) && now <= new Date(fy.EndDate)
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  // ── Reusable form fields ────────────────────────────────────────
  const renderFormFields = (prefix: string) => (
    <div className="space-y-3">
      {/* Row 1: Year Label + Start Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-year`} className="text-xs">Year Label * <span className="text-muted-foreground font-normal">(auto from dates)</span></Label>
          <Input
            id={`${prefix}-year`}
            value={form.year}
            onChange={set("year")}
            placeholder="Auto-generated"
            className="h-8 mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-start`} className="text-xs">Start Date *</Label>
          <Input id={`${prefix}-start`} type="date" value={form.startDate} onChange={set("startDate")} className="h-8 mt-1" />
        </div>
      </div>
      {/* Row 2: End Date + Sales Count */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-end`} className="text-xs">End Date *</Label>
          <Input id={`${prefix}-end`} type="date" value={form.endDate} onChange={set("endDate")} className="h-8 mt-1" />
        </div>
        <div>
          <Label htmlFor={`${prefix}-sales`} className="text-xs">Sales Invoice Count</Label>
          <Input id={`${prefix}-sales`} value={form.salesCount} onChange={set("salesCount")} placeholder="0" className="h-8 mt-1" />
        </div>
      </div>
      {/* Row 3: Service Count + Proforma Sales Count */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-service`} className="text-xs">Service Invoice Count</Label>
          <Input id={`${prefix}-service`} value={form.serviceCount} onChange={set("serviceCount")} placeholder="0" className="h-8 mt-1" />
        </div>
        <div>
          <Label htmlFor={`${prefix}-proforma-sales`} className="text-xs">Proforma Sales Count</Label>
          <Input id={`${prefix}-proforma-sales`} value={form.proformaSalesCount} onChange={set("proformaSalesCount")} placeholder="0" className="h-8 mt-1" />
        </div>
      </div>
      {/* Row 4: Proforma Service Count + Quotation Count */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-proforma-service`} className="text-xs">Proforma Service Count</Label>
          <Input id={`${prefix}-proforma-service`} value={form.proformaServiceCount} onChange={set("proformaServiceCount")} placeholder="0" className="h-8 mt-1" />
        </div>
        <div>
          <Label htmlFor={`${prefix}-quotation`} className="text-xs">Quotation Count</Label>
          <Input id={`${prefix}-quotation`} value={form.quotationCount} onChange={set("quotationCount")} placeholder="0" className="h-8 mt-1" />
        </div>
      </div>
      {/* Row 5: Proposal Count */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-proposal`} className="text-xs">Proposal Count</Label>
          <Input id={`${prefix}-proposal`} value={form.proposalCount} onChange={set("proposalCount")} placeholder="0" className="h-8 mt-1" />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-primary" />
            {company.Name}
          </DialogTitle>
          <DialogDescription>
            Manage financial years for this company
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Header row */}
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

          {/* List */}
          <div className="space-y-2">
            {financialYears.map((fy) => (
              <div
                key={fy.FinancialYearID}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                {editingId === fy.FinancialYearID ? (
                  <div className="space-y-3">
                    {renderFormFields(`edit-${fy.FinancialYearID}`)}
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); resetForm(); }} className="gap-1">
                        <IconX className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(fy.FinancialYearID)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{fy.FinancialYear}</span>
                        {isActiveFY(fy) && (
                          <Badge variant="default" className="text-[10px] h-4 px-1">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(fy.StartDate)} → {fmtDate(fy.EndDate)}
                      </p>
                      {/* Count badges */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {fy.SalesInvoiceCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Sales: {fy.SalesInvoiceCount}</Badge>
                        )}
                        {fy.ServiceInvoiceCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Service: {fy.ServiceInvoiceCount}</Badge>
                        )}
                        {fy.ProformaSalesInvoiceCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Proforma Sales: {fy.ProformaSalesInvoiceCount}</Badge>
                        )}
                        {fy.ProformaServiceInvoiceCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Proforma Service: {fy.ProformaServiceInvoiceCount}</Badge>
                        )}
                        {fy.QuotationCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Quotation: {fy.QuotationCount}</Badge>
                        )}
                        {fy.ProposalCount && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">Proposal: {fy.ProposalCount}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(fy)}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(fy.FinancialYearID)}>
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
              {renderFormFields("new")}
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
