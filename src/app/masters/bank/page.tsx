"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useBankApi } from "@/hooks/useBankApi"
import { useCompanyApi } from "@/hooks/useCompanyApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  IconPlus, IconEdit, IconTrash, IconSearch, IconBuilding, IconCreditCard,
} from "@tabler/icons-react"

interface BankRow {
  BankID: number
  CompanyID: number | null
  BankName: string | null
  AccountNo: string | null
  IFSCCode: string | null
  SwiftCode: string | null
  Company: string | null
  createdAt?: string
}

export default function BankPage() {
  const { listBanks, createBank, updateBank, deleteBank, loading } = useBankApi()
  const { listCompanies } = useCompanyApi()

  const [banks, setBanks] = React.useState<BankRow[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [companies, setCompanies] = React.useState<any[]>([])

  const [form, setForm] = React.useState({
    BankName: "",
    AccountNo: "",
    IFSCCode: "",
    SwiftCode: "",
    CompanyID: "",
    Company: "",
  })

  const fetchBanks = React.useCallback(async () => {
    try {
      const res = await listBanks()
      setBanks(res?.data || [])
    } catch {
      setBanks([])
    }
  }, [listBanks])

  const fetchCompanies = React.useCallback(async () => {
    try {
      const res = await listCompanies({ page: 1, limit: 100 })
      setCompanies(res?.data || [])
    } catch {
      setCompanies([])
    }
  }, [listCompanies])

  React.useEffect(() => {
    fetchBanks()
    fetchCompanies()
  }, [fetchBanks, fetchCompanies])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return banks
    const q = search.toLowerCase()
    return banks.filter(b =>
      (b.BankName || "").toLowerCase().includes(q) ||
      (b.AccountNo || "").toLowerCase().includes(q) ||
      (b.IFSCCode || "").toLowerCase().includes(q) ||
      (b.SwiftCode || "").toLowerCase().includes(q) ||
      (b.Company || "").toLowerCase().includes(q) ||
      String(b.BankID).includes(q)
    )
  }, [banks, search])

  const resetForm = () => {
    setForm({ BankName: "", AccountNo: "", IFSCCode: "", SwiftCode: "", CompanyID: "", Company: "" })
    setEditingId(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleOpenEdit = (bank: BankRow) => {
    setEditingId(bank.BankID)
    setForm({
      BankName: bank.BankName || "",
      AccountNo: bank.AccountNo || "",
      IFSCCode: bank.IFSCCode || "",
      SwiftCode: bank.SwiftCode || "",
      CompanyID: bank.CompanyID ? String(bank.CompanyID) : "",
      Company: bank.Company || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.BankName.trim()) { alert("Bank name is required"); return }
    try {
      const payload: any = {
        BankName: form.BankName.trim(),
        AccountNo: form.AccountNo.trim() || null,
        IFSCCode: form.IFSCCode.trim() || null,
        SwiftCode: form.SwiftCode.trim() || null,
        Company: form.Company.trim() || null,
      }
      if (form.CompanyID) {
        payload.CompanyID = Number(form.CompanyID)
      }

      if (editingId) {
        await updateBank(String(editingId), payload)
      } else {
        await createBank(payload)
      }
      setDialogOpen(false)
      resetForm()
      fetchBanks()
    } catch (e) {
      console.error(e)
      alert("Failed to save bank")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bank?")) return
    try {
      await deleteBank(String(id))
      fetchBanks()
    } catch {
      alert("Failed to delete bank")
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setForm(prev => ({ ...prev, CompanyID: companyId }))
    const company = companies.find(c => String(c.CompanyID) === companyId)
    if (company) {
      setForm(prev => ({ ...prev, CompanyID: companyId, Company: company.Name || "" }))
    }
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

            {/* Header */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <IconCreditCard className="h-5 w-5" /> Banks
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage bank accounts for your companies
                  </p>
                </div>
                <Button onClick={handleOpenCreate}>
                  <IconPlus className="mr-2 h-4 w-4" /> Add Bank
                </Button>
              </CardHeader>
            </Card>

            {/* Data table */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <div className="relative w-full sm:max-w-xs">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search banks…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{filtered.length} bank(s)</p>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading banks…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead>Bank Name</TableHead>
                          <TableHead>Account No</TableHead>
                          <TableHead>IFSC Code</TableHead>
                          <TableHead>SWIFT Code</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead className="w-[130px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              {loading ? "Loading…" : "No banks found. Add your first bank."}
                            </TableCell>
                          </TableRow>
                        ) : filtered.map((bank) => (
                          <TableRow key={bank.BankID}>
                            <TableCell className="font-medium">{bank.BankID}</TableCell>
                            <TableCell className="font-semibold">{bank.BankName || "-"}</TableCell>
                            <TableCell>{bank.AccountNo || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">{bank.IFSCCode || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">{bank.SwiftCode || "-"}</TableCell>
                            <TableCell>{bank.Company || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(bank)} title="Edit">
                                  <IconEdit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(bank.BankID)} title="Delete">
                                  <IconTrash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              {editingId ? "Edit Bank" : "Add Bank"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Bank Name *</FieldLabel>
              <Input
                value={form.BankName}
                onChange={e => setForm(prev => ({ ...prev, BankName: e.target.value }))}
                placeholder="e.g., State Bank of India"
              />
            </Field>
            <Field>
              <FieldLabel>Account Number</FieldLabel>
              <Input
                value={form.AccountNo}
                onChange={e => setForm(prev => ({ ...prev, AccountNo: e.target.value }))}
                placeholder="e.g., 1234567890"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>IFSC Code</FieldLabel>
                <Input
                  value={form.IFSCCode}
                  onChange={e => setForm(prev => ({ ...prev, IFSCCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SBIN0001234"
                  maxLength={50}
                />
              </Field>
              <Field>
                <FieldLabel>SWIFT Code</FieldLabel>
                <Input
                  value={form.SwiftCode}
                  onChange={e => setForm(prev => ({ ...prev, SwiftCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SBININBB"
                  maxLength={100}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Company</FieldLabel>
              <Select value={form.CompanyID} onValueChange={handleCompanyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.CompanyID} value={String(c.CompanyID)}>
                      {c.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {editingId ? "Update Bank" : "Save Bank"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}
