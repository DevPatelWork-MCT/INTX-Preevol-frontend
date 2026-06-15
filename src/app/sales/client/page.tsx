"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { usePartyApi } from "@/hooks/usePartyApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers } from "@tabler/icons-react"
import * as React from "react"

export default function SalesClientPage() {
  const { listParties, createParty, updateParty, deleteParty, loading } = usePartyApi()
  const [parties, setParties] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState({
    PartyName: "", ContactPerson: "", Contact1: "", Contact2: "",
    Address: "", City: "", State: "", StateCode: "", Email: "", Website: "",
    GSTStatus: "", GSTIN: "", PANNo: "", VATNo: "", CSTNo: "", ECCNo: "", IECCode: "", Pin: "",
  })

  const fetchParties = React.useCallback(async () => {
    try { const res = await listParties(); setParties(res?.data || []) } catch {}
  }, [listParties])
  React.useEffect(() => { fetchParties() }, [fetchParties])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return parties
    const q = search.toLowerCase()
    return parties.filter(p =>
      (p.PartyName || "").toLowerCase().includes(q) ||
      (p.ContactPerson || "").toLowerCase().includes(q) ||
      (p.GSTIN || "").toLowerCase().includes(q) ||
      (p.City || "").toLowerCase().includes(q) ||
      (p.Contact1 || "").toLowerCase().includes(q) ||
      String(p.PartyID).includes(q)
    )
  }, [parties, search])

  const handleSave = async () => {
    if (!form.PartyName.trim()) return
    try {
      const payload = { ...form, StateCode: form.StateCode ? Number(form.StateCode) : null, VATNo: form.VATNo ? Number(form.VATNo) : null, CSTNo: form.CSTNo ? Number(form.CSTNo) : null }
      if (editingId) { await updateParty(String(editingId), payload) } else { await createParty(payload) }
      setDialogOpen(false); resetForm(); fetchParties()
    } catch {}
  }

  const resetForm = () => {
    setForm({ PartyName: "", ContactPerson: "", Contact1: "", Contact2: "", Address: "", City: "", State: "", StateCode: "", Email: "", Website: "", GSTStatus: "", GSTIN: "", PANNo: "", VATNo: "", CSTNo: "", ECCNo: "", IECCode: "", Pin: "" })
    setEditingId(null)
  }

  const handleEdit = (p: any) => {
    setEditingId(p.PartyID)
    setForm({ PartyName: p.PartyName || "", ContactPerson: p.ContactPerson || "", Contact1: p.Contact1 || "", Contact2: p.Contact2 || "", Address: p.Address || "", City: p.City || "", State: p.State || "", StateCode: p.StateCode ? String(p.StateCode) : "", Email: p.Email || "", Website: p.Website || "", GSTStatus: p.GSTStatus || "", GSTIN: p.GSTIN || "", PANNo: p.PANNo || "", VATNo: p.VATNo ? String(p.VATNo) : "", CSTNo: p.CSTNo ? String(p.CSTNo) : "", ECCNo: p.ECCNo || "", IECCode: p.IECCode || "", Pin: p.Pin || "" })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => { if (!confirm("Delete this party?")) return; try { await deleteParty(String(id)); fetchParties() } catch {} }

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
                    <IconUsers className="h-5 w-5" /> Clients (Parties)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your customer and party masters
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
                  <DialogTrigger asChild><Button onClick={resetForm}><IconPlus className="mr-2 h-4 w-4" /> Add Party</Button></DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Party</DialogTitle></DialogHeader>
                    <FieldGroup>
                      <Field><FieldLabel>Party Name *</FieldLabel><Input value={form.PartyName} onChange={(e) => setForm({ ...form, PartyName: e.target.value })} /></Field>
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
                        <Field><FieldLabel>Pin</FieldLabel><Input value={form.Pin} onChange={(e) => setForm({ ...form, Pin: e.target.value })} /></Field>
                      </div>
                      <Button onClick={handleSave} disabled={loading || !form.PartyName.trim()}>{editingId ? "Update" : "Save"}</Button>
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
                  <Input placeholder="Search parties…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                </div>
                <p className="text-xs text-muted-foreground">{filtered.length} party(s)</p>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading parties…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead>Party Name</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>GSTIN</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No parties found. Add your first party.
                            </TableCell>
                          </TableRow>
                        ) : filtered.map((p) => (
                          <TableRow key={p.PartyID}>
                            <TableCell className="font-medium">{p.PartyID}</TableCell>
                            <TableCell className="font-semibold">{p.PartyName}</TableCell>
                            <TableCell>{p.ContactPerson || "-"}</TableCell>
                            <TableCell>{p.Contact1 || "-"}</TableCell>
                            <TableCell>{p.GSTIN || "-"}</TableCell>
                            <TableCell>{p.City || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)} title="Edit"><IconEdit className="h-3.5 w-3.5" /></Button>
                                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.PartyID)} title="Delete"><IconTrash className="h-3.5 w-3.5" /></Button>
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
