"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { usePartyApi } from "@/hooks/usePartyApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  IconPlus, IconEdit, IconTrash, IconBuilding, IconMapPin, IconReceipt, IconPhone,
} from "@tabler/icons-react"

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */
interface PartyForm {
  PartyName: string; ContactPerson: string; Contact1: string; Contact2: string;
  Address: string; City: string; State: string; StateCode: string;
  Country: string; Email: string; Website: string;
  GSTStatus: string; GSTIN: string; PANNo: string;
  VATNo: string; CSTNo: string; ECCNo: string; IECCode: string;
  Pin: string; Company: string;
}

const emptyPartyForm = (): PartyForm => ({
  PartyName: "", ContactPerson: "", Contact1: "", Contact2: "",
  Address: "", City: "", State: "", StateCode: "",
  Country: "India", Email: "", Website: "",
  GSTStatus: "Registered", GSTIN: "", PANNo: "",
  VATNo: "", CSTNo: "", ECCNo: "", IECCode: "",
  Pin: "", Company: "",
})

const GST_STATUS_OPTIONS = [
  { value: "Registered", label: "Registered" },
  { value: "Unregistered", label: "Unregistered" },
  { value: "Composition", label: "Composition" },
  { value: "SEZ", label: "SEZ" },
  { value: "Export", label: "Export" },
]

const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" }, { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" }, { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" }, { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" }, { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" }, { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" }, { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" }, { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" }, { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" }, { code: "28", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" }, { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" }, { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" }, { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar" }, { code: "36", name: "Telangana" },
  { code: "37", name: "Ladakh" }, { code: "97", name: "Other Territory" },
]

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function PartyPage() {
  const { listParties, createParty, updateParty, deleteParty, loading } = usePartyApi()
  const [parties, setParties] = React.useState<any[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState("basic")
  const [form, setForm] = React.useState<PartyForm>(emptyPartyForm())
  const [searchTerm, setSearchTerm] = React.useState("")

  const fetchParties = React.useCallback(async () => {
    try { const res = await listParties(); setParties(res?.data || []) } catch { /* silent */ }
  }, [listParties])
  React.useEffect(() => { fetchParties() }, [fetchParties])

  const updateField = (field: keyof PartyForm, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!form.PartyName.trim()) { alert("Party Name is required"); return }
    try {
      const payload = {
        ...form,
        StateCode: form.StateCode ? Number(form.StateCode) : null,
        VATNo: form.VATNo ? Number(form.VATNo) : null,
        CSTNo: form.CSTNo ? Number(form.CSTNo) : null,
      }
      if (editingId) { await updateParty(String(editingId), payload) }
      else { await createParty(payload) }
      setDialogOpen(false); setEditingId(null); setForm(emptyPartyForm()); fetchParties()
    } catch { /* silent */ }
  }

  const handleEdit = (party: any) => {
    setEditingId(party.PartyID)
    setForm({
      PartyName: party.PartyName || "", ContactPerson: party.ContactPerson || "",
      Contact1: party.Contact1 || "", Contact2: party.Contact2 || "",
      Address: party.Address || "", City: party.City || "", State: party.State || "",
      StateCode: party.StateCode ? String(party.StateCode) : "",
      Country: party.Country || "India", Email: party.Email || "", Website: party.Website || "",
      GSTStatus: party.GSTStatus || "Registered", GSTIN: party.GSTIN || "", PANNo: party.PANNo || "",
      VATNo: party.VATNo ? String(party.VATNo) : "", CSTNo: party.CSTNo ? String(party.CSTNo) : "",
      ECCNo: party.ECCNo || "", IECCode: party.IECCode || "",
      Pin: party.Pin || "", Company: party.Company || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this party? This action cannot be undone.")) return
    try { await deleteParty(String(id)); fetchParties() } catch { /* silent */ }
  }

  const openCreateForm = () => { setEditingId(null); setForm(emptyPartyForm()); setActiveTab("basic"); setDialogOpen(true) }

  const filteredParties = parties.filter(p =>
    !searchTerm || p.PartyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.GSTIN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Contact1?.includes(searchTerm)
  )

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><IconBuilding className="h-6 w-6" /> Parties (Customers)</h1>
            <p className="text-sm text-muted-foreground">Manage customer and vendor master data</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyPartyForm()) } }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateForm}><IconPlus className="mr-2 h-4 w-4" /> Add Party</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Party</DialogTitle></DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic"><IconBuilding className="mr-1 h-3 w-3" /> Basic</TabsTrigger>
                  <TabsTrigger value="address"><IconMapPin className="mr-1 h-3 w-3" /> Address</TabsTrigger>
                  <TabsTrigger value="tax"><IconReceipt className="mr-1 h-3 w-3" /> Tax Details</TabsTrigger>
                  <TabsTrigger value="contact"><IconPhone className="mr-1 h-3 w-3" /> Contact</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FieldGroup>
                    <Field><FieldLabel>Party Name *</FieldLabel><Input value={form.PartyName} onChange={e => updateField("PartyName", e.target.value)} placeholder="Enter party/business name" /></Field>
                    <Field><FieldLabel>Contact Person</FieldLabel><Input value={form.ContactPerson} onChange={e => updateField("ContactPerson", e.target.value)} placeholder="Primary contact name" /></Field>
                    <Field><FieldLabel>Country</FieldLabel><Input value={form.Country} onChange={e => updateField("Country", e.target.value)} /></Field>
                    <Field><FieldLabel>Company (Group)</FieldLabel><Input value={form.Company} onChange={e => updateField("Company", e.target.value)} placeholder="Associated company name" /></Field>
                  </FieldGroup>
                </TabsContent>
                <TabsContent value="address" className="space-y-4 mt-4">
                  <FieldGroup>
                    <Field><FieldLabel>Address</FieldLabel><Input value={form.Address} onChange={e => updateField("Address", e.target.value)} placeholder="Full address" /></Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field><FieldLabel>City</FieldLabel><Input value={form.City} onChange={e => updateField("City", e.target.value)} placeholder="City" /></Field>
                      <Field><FieldLabel>Pin Code</FieldLabel><Input value={form.Pin} onChange={e => updateField("Pin", e.target.value)} placeholder="PIN / ZIP code" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>State</FieldLabel>
                        <Select value={form.State} onValueChange={v => updateField("State", v)}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>State Code (GST)</FieldLabel>
                        <Select value={form.StateCode} onValueChange={v => updateField("StateCode", v)}><SelectTrigger><SelectValue placeholder="Select code" /></SelectTrigger>
                          <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </FieldGroup>
                </TabsContent>
                <TabsContent value="tax" className="space-y-4 mt-4">
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>GST Status</FieldLabel>
                        <Select value={form.GSTStatus} onValueChange={v => updateField("GSTStatus", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{GST_STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field><FieldLabel>GSTIN</FieldLabel><Input value={form.GSTIN} onChange={e => updateField("GSTIN", e.target.value)} placeholder="15-character GSTIN" maxLength={15} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field><FieldLabel>PAN No</FieldLabel><Input value={form.PANNo} onChange={e => updateField("PANNo", e.target.value)} placeholder="10-character PAN" maxLength={10} /></Field>
                      <Field><FieldLabel>VAT No</FieldLabel><Input value={form.VATNo} onChange={e => updateField("VATNo", e.target.value)} placeholder="VAT registration number" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field><FieldLabel>CST No</FieldLabel><Input value={form.CSTNo} onChange={e => updateField("CSTNo", e.target.value)} placeholder="Central Sales Tax number" /></Field>
                      <Field><FieldLabel>ECC No</FieldLabel><Input value={form.ECCNo} onChange={e => updateField("ECCNo", e.target.value)} placeholder="Excise Control Code" /></Field>
                    </div>
                    <Field><FieldLabel>IEC Code</FieldLabel><Input value={form.IECCode} onChange={e => updateField("IECCode", e.target.value)} placeholder="Import Export Code" /></Field>
                  </FieldGroup>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4 mt-4">
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <Field><FieldLabel>Contact 1 (Primary Phone)</FieldLabel><Input value={form.Contact1} onChange={e => updateField("Contact1", e.target.value)} placeholder="Primary phone number" /></Field>
                      <Field><FieldLabel>Contact 2 (Secondary Phone)</FieldLabel><Input value={form.Contact2} onChange={e => updateField("Contact2", e.target.value)} placeholder="Secondary phone number" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field><FieldLabel>Email</FieldLabel><Input type="email" value={form.Email} onChange={e => updateField("Email", e.target.value)} placeholder="email@example.com" /></Field>
                      <Field><FieldLabel>Website</FieldLabel><Input value={form.Website} onChange={e => updateField("Website", e.target.value)} placeholder="https://example.com" /></Field>
                    </div>
                  </FieldGroup>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditingId(null); setForm(emptyPartyForm()) }}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading || !form.PartyName.trim()}>{editingId ? "Update Party" : "Save Party"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-4 items-center">
          <Input placeholder="Search by name, GSTIN, city, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
          <span className="text-sm text-muted-foreground">{filteredParties.length} party(ies)</span>
        </div>

        {/* Party Data Table */}
        <Card>
          <CardHeader><CardTitle>All Parties</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Party Name</TableHead><TableHead>Contact Person</TableHead>
                    <TableHead>Phone 1</TableHead><TableHead>Phone 2</TableHead><TableHead>City</TableHead>
                    <TableHead>State</TableHead><TableHead>State Code</TableHead><TableHead>GST Status</TableHead>
                    <TableHead>GSTIN</TableHead><TableHead>PAN No</TableHead><TableHead>VAT No</TableHead>
                    <TableHead>CST No</TableHead><TableHead>ECC No</TableHead><TableHead>IEC Code</TableHead>
                    <TableHead>Email</TableHead><TableHead>Pin</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParties.length === 0 ? (
                    <TableRow><TableCell colSpan={18} className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No parties match your search." : "No parties found. Add your first party."}
                    </TableCell></TableRow>
                  ) : filteredParties.map((party) => (
                    <TableRow key={party.PartyID}>
                      <TableCell className="font-medium">{party.PartyID}</TableCell>
                      <TableCell className="font-semibold">{party.PartyName}</TableCell>
                      <TableCell>{party.ContactPerson || "-"}</TableCell>
                      <TableCell>{party.Contact1 || "-"}</TableCell>
                      <TableCell>{party.Contact2 || "-"}</TableCell>
                      <TableCell>{party.City || "-"}</TableCell>
                      <TableCell>{party.State || "-"}</TableCell>
                      <TableCell>{party.StateCode || "-"}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          party.GSTStatus === "Registered" ? "bg-green-100 text-green-800" :
                          party.GSTStatus === "Unregistered" ? "bg-gray-100 text-gray-600" :
                          "bg-blue-100 text-blue-800"
                        }`}>{party.GSTStatus || "-"}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{party.GSTIN || "-"}</TableCell>
                      <TableCell className="text-xs">{party.PANNo || "-"}</TableCell>
                      <TableCell className="text-xs">{party.VATNo || "-"}</TableCell>
                      <TableCell className="text-xs">{party.CSTNo || "-"}</TableCell>
                      <TableCell className="text-xs">{party.ECCNo || "-"}</TableCell>
                      <TableCell className="text-xs">{party.IECCode || "-"}</TableCell>
                      <TableCell className="text-xs">{party.Email || "-"}</TableCell>
                      <TableCell className="text-xs">{party.Pin || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(party)} title="Edit"><IconEdit className="h-3.5 w-3.5" /></Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(party.PartyID)} title="Delete"><IconTrash className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
