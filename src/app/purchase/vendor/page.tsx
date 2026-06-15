"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useVendorApi } from "@/hooks/useVendorApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconPlus, IconEdit, IconTrash, IconSearch, IconBuilding } from "@tabler/icons-react"

export default function VendorPage() {
  const { listVendors, createVendor, updateVendor, deleteVendor, loading } = useVendorApi()
  const [vendors, setVendors] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState({
    VendorName: "", ContactPerson: "", Contact1: "", Contact2: "",
    Address: "", City: "", State: "", StateCode: "", Email: "", Website: "",
    GSTStatus: "", GSTIN: "", PANNo: "", VATNo: "", CSTNo: "", ECCNo: "", IECCode: "",
  })

  const fetchVendors = React.useCallback(async () => {
    try { const res = await listVendors(); setVendors(res?.data || []) } catch {}
  }, [listVendors])
  React.useEffect(() => { fetchVendors() }, [fetchVendors])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return vendors
    const q = search.toLowerCase()
    return vendors.filter(v =>
      (v.VendorName || "").toLowerCase().includes(q) ||
      (v.ContactPerson || "").toLowerCase().includes(q) ||
      (v.GSTIN || "").toLowerCase().includes(q) ||
      (v.City || "").toLowerCase().includes(q) ||
      (v.Contact1 || "").toLowerCase().includes(q) ||
      String(v.VendorID).includes(q)
    )
  }, [vendors, search])

  const handleSave = async () => {
    if (!form.VendorName.trim()) return
    try {
      const payload = { ...form, StateCode: form.StateCode ? Number(form.StateCode) : null, VATNo: form.VATNo ? Number(form.VATNo) : null, CSTNo: form.CSTNo ? Number(form.CSTNo) : null }
      if (editingId) { await updateVendor(String(editingId), payload) } else { await createVendor(payload) }
      setDialogOpen(false); resetForm(); fetchVendors()
    } catch {}
  }

  const resetForm = () => {
    setForm({ VendorName: "", ContactPerson: "", Contact1: "", Contact2: "", Address: "", City: "", State: "", StateCode: "", Email: "", Website: "", GSTStatus: "", GSTIN: "", PANNo: "", VATNo: "", CSTNo: "", ECCNo: "", IECCode: "" })
    setEditingId(null)
  }

  const handleEdit = (v: any) => {
    setEditingId(v.VendorID)
    setForm({
      VendorName: v.VendorName || "", ContactPerson: v.ContactPerson || "", Contact1: v.Contact1 || "", Contact2: v.Contact2 || "",
      Address: v.Address || "", City: v.City || "", State: v.State || "", StateCode: v.StateCode ? String(v.StateCode) : "",
      Email: v.Email || "", Website: v.Website || "", GSTStatus: v.GSTStatus || "", GSTIN: v.GSTIN || "", PANNo: v.PANNo || "",
      VATNo: v.VATNo ? String(v.VATNo) : "", CSTNo: v.CSTNo ? String(v.CSTNo) : "", ECCNo: v.ECCNo || "", IECCode: v.IECCode || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vendor?")) return
    try { await deleteVendor(String(id)); fetchVendors() } catch {}
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
                    <IconBuilding className="h-5 w-5" /> Vendors
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your supplier and vendor masters
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}><IconPlus className="mr-2 h-4 w-4" /> Add Vendor</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Vendor</DialogTitle></DialogHeader>
                    <FieldGroup>
                      <Field><FieldLabel>Vendor Name *</FieldLabel><Input value={form.VendorName} onChange={(e) => setForm({ ...form, VendorName: e.target.value })} /></Field>
                      <Field><FieldLabel>Contact Person</FieldLabel><Input value={form.ContactPerson} onChange={(e) => setForm({ ...form, ContactPerson: e.target.value })} /></Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Contact 1</FieldLabel><Input value={form.Contact1} onChange={(e) => setForm({ ...form, Contact1: e.target.value })} /></Field>
                        <Field><FieldLabel>Contact 2</FieldLabel><Input value={form.Contact2} onChange={(e) => setForm({ ...form, Contact2: e.target.value })} /></Field>
                      </div>
                      <Field><FieldLabel>Address</FieldLabel><Input value={form.Address} onChange={(e) => setForm({ ...form, Address: e.target.value })} /></Field>
                      <div className="grid grid-cols-3 gap-4">
                        <Field><FieldLabel>City</FieldLabel><Input value={form.City} onChange={(e) => setForm({ ...form, City: e.target.value })} /></Field>
                        <Field><FieldLabel>State</FieldLabel><Input value={form.State} onChange={(e) => setForm({ ...form, State: e.target.value })} /></Field>
                        <Field><FieldLabel>State Code</FieldLabel><Input value={form.StateCode} onChange={(e) => setForm({ ...form, StateCode: e.target.value })} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Email</FieldLabel><Input value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} /></Field>
                        <Field><FieldLabel>Website</FieldLabel><Input value={form.Website} onChange={(e) => setForm({ ...form, Website: e.target.value })} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>GST Status</FieldLabel><Input value={form.GSTStatus} onChange={(e) => setForm({ ...form, GSTStatus: e.target.value })} /></Field>
                        <Field><FieldLabel>GSTIN</FieldLabel><Input value={form.GSTIN} onChange={(e) => setForm({ ...form, GSTIN: e.target.value })} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>PAN No</FieldLabel><Input value={form.PANNo} onChange={(e) => setForm({ ...form, PANNo: e.target.value })} /></Field>
                        <Field><FieldLabel>IEC Code</FieldLabel><Input value={form.IECCode} onChange={(e) => setForm({ ...form, IECCode: e.target.value })} /></Field>
                      </div>
                      <Button onClick={handleSave} disabled={loading || !form.VendorName.trim()}>{editingId ? "Update" : "Save"}</Button>
                    </FieldGroup>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            {/* Data table */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <div className="relative w-full sm:max-w-xs">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                </div>
                <p className="text-xs text-muted-foreground">{filtered.length} vendor(s)</p>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading vendors…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>GSTIN</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No vendors found. Add your first vendor.
                            </TableCell>
                          </TableRow>
                        ) : filtered.map((v) => (
                          <TableRow key={v.VendorID}>
                            <TableCell className="font-medium">{v.VendorID}</TableCell>
                            <TableCell className="font-semibold">{v.VendorName}</TableCell>
                            <TableCell>{v.ContactPerson || "-"}</TableCell>
                            <TableCell>{v.Contact1 || "-"}</TableCell>
                            <TableCell>{v.GSTIN || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(v)} title="Edit"><IconEdit className="h-3.5 w-3.5" /></Button>
                                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(v.VendorID)} title="Delete"><IconTrash className="h-3.5 w-3.5" /></Button>
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
    </ProtectedLayout>
  )
}
