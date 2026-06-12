"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { usePartyApi } from "@/hooks/usePartyApi"
import { useProductApi } from "@/hooks/useProductApi"
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
  IconPlus, IconTrash, IconEye, IconPrinter, IconDownload,
  IconFileInvoice, IconBuilding, IconTruck, IconShieldCheck,
} from "@tabler/icons-react"
import { formatINR } from "@/lib/currency"

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */
interface LineItem {
  id: string; ProductName: string; Description: string; HSNACS: string;
  UOM: string; Qty: number; Rate: number; IsService: boolean;
  Discount: number; Amount: number; DiscountVal: number; TaxableValue: number;
  CGSTRate: number; CGSTAmt: number; SGSTRate: number; SGSTAmt: number;
  IGSTRate: number; IGSTAmt: number; TotalAmount: number;
}

interface InvoiceForm {
  InvoiceNo: string; InvoiceDate: string; InvoiceType: string;
  TaxType: "Local State" | "Inter-State";
  ChallanNo: string; ChallanDate: string; PartyDCNo: string; PartyDCDate: string;
  PO: string; PODate: string; ARNNo: string; ARNDate: string;
  TransportationMode: string; ModelNo: string; AgainstForm: string;
  SupplyTo: string; SupplyStateCode: string;
  PartyID: string; ReceiverName: string; ReceiverAddress: string;
  ReceiverGSTIN: string; ReceiverState: string; ReceiverStateCode: string; ReceiverPanNo: string;
  IsSameAddress: boolean; ConsigneeName: string; ConsigneeAddress: string;
  ConsigneeGSTIN: string; ConsigneeState: string; ConsigneeStateCode: string; ConsigneePanNo: string;
  PackingCharge: string; PCGSTRate: string; PSGSTRate: string; PIGSTRate: string;
  GSTReverseCharge: boolean;
  VehicleNo: string; VehicleType: string; Distance: string;
  TransporterID: string; TransporterName: string;
  Remarks: string;
}

const emptyInvoiceForm = (): InvoiceForm => ({
  InvoiceNo: "", InvoiceDate: new Date().toISOString().split("T")[0],
  InvoiceType: "Sales Invoice", TaxType: "Local State",
  ChallanNo: "", ChallanDate: "", PartyDCNo: "", PartyDCDate: "",
  PO: "", PODate: "", ARNNo: "", ARNDate: "",
  TransportationMode: "", ModelNo: "", AgainstForm: "",
  SupplyTo: "", SupplyStateCode: "",
  PartyID: "", ReceiverName: "", ReceiverAddress: "",
  ReceiverGSTIN: "", ReceiverState: "", ReceiverStateCode: "", ReceiverPanNo: "",
  IsSameAddress: true, ConsigneeName: "", ConsigneeAddress: "",
  ConsigneeGSTIN: "", ConsigneeState: "", ConsigneeStateCode: "", ConsigneePanNo: "",
  PackingCharge: "0", PCGSTRate: "0", PSGSTRate: "0", PIGSTRate: "0",
  GSTReverseCharge: false,
  VehicleNo: "", VehicleType: "Regular", Distance: "",
  TransporterID: "", TransporterName: "",
  Remarks: "",
})

/* ================================================================== */
/*  INDIAN NUMBER TO WORDS                                             */
/* ================================================================== */
const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"]
const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

function convertHundreds(n: number): string {
  if (n === 0) return ""
  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertHundreds(n % 100) : "")
}

function convertToWords(num: number): string {
  if (num === 0) return "Zero"
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  let words = ""
  const crore = Math.floor(intPart / 10000000)
  const lakh = Math.floor((intPart % 10000000) / 100000)
  const thousand = Math.floor((intPart % 100000) / 1000)
  const remainder = intPart % 1000
  if (crore) words += convertHundreds(crore) + " Crore "
  if (lakh) words += convertHundreds(lakh) + " Lakh "
  if (thousand) words += convertHundreds(thousand) + " Thousand "
  if (remainder) words += convertHundreds(remainder)
  words = words.trim()
  if (decPart) words += " and " + convertHundreds(decPart) + " Paise"
  return words + " Only"
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function SalesInvoicePage() {
  const { listInvoices, createInvoice, getInvoice, deleteInvoice, loading } = useInvoiceApi()
  const { listParties } = usePartyApi()
  const { listProducts } = useProductApi()

  const [invoices, setInvoices] = React.useState<any[]>([])
  const [parties, setParties] = React.useState<any[]>([])
  const [products, setProducts] = React.useState<any[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [viewingInvoice, setViewingInvoice] = React.useState<any>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState("header")

  const [form, setForm] = React.useState<InvoiceForm>(emptyInvoiceForm())
  const [lineItems, setLineItems] = React.useState<LineItem[]>([])

  const fetchData = React.useCallback(async () => {
    try {
      const [invRes, partyRes, prodRes] = await Promise.all([
        listInvoices(), listParties(), listProducts(),
      ])
      setInvoices(invRes?.data || [])
      setParties(partyRes?.data || [])
      setProducts(prodRes?.data || [])
    } catch { /* silent */ }
  }, [listInvoices, listParties, listProducts])

  React.useEffect(() => { fetchData() }, [fetchData])

  const updateForm = (field: keyof InvoiceForm, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const isInterState = form.TaxType === "Inter-State"

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      id: crypto.randomUUID(), ProductName: "", Description: "", HSNACS: "", UOM: "",
      Qty: 1, Rate: 0, IsService: false, Discount: 0, Amount: 0, DiscountVal: 0,
      TaxableValue: 0, CGSTRate: 0, CGSTAmt: 0, SGSTRate: 0, SGSTAmt: 0,
      IGSTRate: 0, IGSTAmt: 0, TotalAmount: 0,
    }])
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const u = { ...item, [field]: value }
      const qty = Number(u.Qty) || 0
      const rate = Number(u.Rate) || 0
      const disc = Number(u.Discount) || 0
      u.Amount = qty * rate
      u.DiscountVal = u.Amount * (disc / 100)
      u.TaxableValue = u.Amount - u.DiscountVal
      if (!isInterState) {
        u.CGSTAmt = (u.TaxableValue * Number(u.CGSTRate)) / 100
        u.SGSTAmt = (u.TaxableValue * Number(u.SGSTRate)) / 100
        u.IGSTAmt = 0
      } else {
        u.IGSTAmt = (u.TaxableValue * Number(u.IGSTRate)) / 100
        u.CGSTAmt = 0; u.SGSTAmt = 0
      }
      u.TotalAmount = u.TaxableValue + u.CGSTAmt + u.SGSTAmt + u.IGSTAmt
      return u
    }))
  }

  const removeLineItem = (id: string) => setLineItems(prev => prev.filter(i => i.id !== id))

  const selectProduct = (id: string, productName: string) => {
    const product = products.find(p => p.ProductName === productName)
    if (!product) return
    const gstRate = Number(product.GSTRate || 0)
    updateLineItem(id, "ProductName", productName)
    updateLineItem(id, "HSNACS", product.HSNNoOrSACNo || "")
    updateLineItem(id, "UOM", product.UOM || "")
    updateLineItem(id, "Rate", Number(product.Price || 0))
    updateLineItem(id, "IsService", product.IsService || false)
    if (!isInterState) {
      updateLineItem(id, "CGSTRate", (gstRate / 2).toFixed(2))
      updateLineItem(id, "SGSTRate", (gstRate / 2).toFixed(2))
      updateLineItem(id, "IGSTRate", "0")
    } else {
      updateLineItem(id, "IGSTRate", gstRate.toFixed(2))
      updateLineItem(id, "CGSTRate", "0")
      updateLineItem(id, "SGSTRate", "0")
    }
  }

  const totals = React.useMemo(() => {
    const beforeTax = lineItems.reduce((s, i) => s + i.TaxableValue, 0)
    const cgst = lineItems.reduce((s, i) => s + i.CGSTAmt, 0)
    const sgst = lineItems.reduce((s, i) => s + i.SGSTAmt, 0)
    const igst = lineItems.reduce((s, i) => s + i.IGSTAmt, 0)
    const packing = Number(form.PackingCharge) || 0
    const pcCgst = (packing * Number(form.PCGSTRate)) / 100
    const pcSgst = (packing * Number(form.PSGSTRate)) / 100
    const pcIgst = (packing * Number(form.PIGSTRate)) / 100
    const totalGST = cgst + sgst + igst + pcCgst + pcSgst + pcIgst
    const afterTax = beforeTax + packing + totalGST
    const roundOff = Math.round(afterTax) - afterTax
    const grandTotal = afterTax + roundOff
    return { beforeTax, cgst, sgst, igst, packing, pcCgst, pcSgst, pcIgst, totalGST, afterTax, roundOff, grandTotal }
  }, [lineItems, form.PackingCharge, form.PCGSTRate, form.PSGSTRate, form.PIGSTRate])

  const totalInWords = React.useMemo(() => convertToWords(totals.grandTotal), [totals.grandTotal])
  const taxInWords = React.useMemo(() => convertToWords(totals.totalGST), [totals.totalGST])

  const handlePartyChange = (id: string) => {
    updateForm("PartyID", id)
    const party = parties.find(p => String(p.PartyID) === id)
    if (!party) return
    updateForm("ReceiverName", party.PartyName)
    updateForm("ReceiverAddress", party.Address || "")
    updateForm("ReceiverGSTIN", party.GSTIN || "")
    updateForm("ReceiverState", party.State || "")
    updateForm("ReceiverStateCode", party.StateCode ? String(party.StateCode) : "")
    updateForm("ReceiverPanNo", party.PANNo || "")
    if (form.IsSameAddress) {
      updateForm("ConsigneeName", party.PartyName)
      updateForm("ConsigneeAddress", party.Address || "")
      updateForm("ConsigneeGSTIN", party.GSTIN || "")
      updateForm("ConsigneeState", party.State || "")
      updateForm("ConsigneeStateCode", party.StateCode ? String(party.StateCode) : "")
      updateForm("ConsigneePanNo", party.PANNo || "")
    }
  }

  const handleSameAddress = (checked: boolean) => {
    updateForm("IsSameAddress", checked)
    if (checked) {
      const party = parties.find(p => String(p.PartyID) === form.PartyID)
      if (party) {
        updateForm("ConsigneeName", party.PartyName)
        updateForm("ConsigneeAddress", party.Address || "")
        updateForm("ConsigneeGSTIN", party.GSTIN || "")
        updateForm("ConsigneeState", party.State || "")
        updateForm("ConsigneeStateCode", party.StateCode ? String(party.StateCode) : "")
        updateForm("ConsigneePanNo", party.PANNo || "")
      }
    }
  }

  const validateForm = (): string | null => {
    if (!form.InvoiceDate) return "Invoice date is required"
    if (!form.ReceiverName.trim()) return "Please select Receiver/Buyer Name"
    if (lineItems.length === 0) return "Please add at least one product in the invoice"
    for (let i = 0; i < lineItems.length; i++) {
      const li = lineItems[i]
      if (!li.ProductName.trim()) return `Product name cannot be empty in row ${i + 1}`
      if (Number(li.Qty) <= 0) return `Quantity must be greater than 0 in row ${i + 1}`
      if (Number(li.Rate) <= 0) return `Rate must be greater than 0 in row ${i + 1}`
      if (!li.IsService && !li.HSNACS) return `HSN/SAC code is missing for row ${i + 1}. Required for GST filing.`
    }
    if (totals.grandTotal <= 0) return "Grand Total must be greater than 0"
    if (isInterState && !form.SupplyStateCode) return "Please select Supply State for IGST invoice"
    if (Number(form.PackingCharge) > 0 && Number(form.PCGSTRate) <= 0 && Number(form.PIGSTRate) <= 0)
      return "Please enter GST rate for Packing Charge"
    return null
  }

  const handleSave = async () => {
    const err = validateForm()
    if (err) { alert(err); return }
    try {
      const payload = {
        ...form,
        PartyID: Number(form.PartyID),
        InvoiceDate: form.InvoiceDate ? new Date(form.InvoiceDate) : new Date(),
        ChallanDate: form.ChallanDate ? new Date(form.ChallanDate) : null,
        PartyDCDate: form.PartyDCDate ? new Date(form.PartyDCDate) : null,
        PODate: form.PODate ? new Date(form.PODate) : null,
        ARNDate: form.ARNDate ? new Date(form.ARNDate) : null,
        PackingCharge: Number(form.PackingCharge),
        PCGSTRate: Number(form.PCGSTRate), PSGSTRate: Number(form.PSGSTRate), PIGSTRate: Number(form.PIGSTRate),
        TotalAmtBeforeTax: totals.beforeTax,
        CGST: totals.cgst, SGST: totals.sgst, IGST: totals.igst,
        PCGSTAmt: totals.pcCgst, PSGSTAmt: totals.pcSgst, PIGSTAmt: totals.pcIgst,
        TotalGSTTax: totals.totalGST,
        TotalAmtAfterTax: totals.afterTax,
        GrandTotalAmount: totals.grandTotal,
        RoundOff: totals.roundOff,
        TotalInWords: totalInWords, TaxInWords: taxInWords,
        lineItems: lineItems.map(item => ({
          ProductName: item.ProductName, Description: item.Description,
          HSNACS: item.HSNACS, UOM: item.UOM, Qty: item.Qty, Rate: item.Rate,
          IsService: item.IsService ? "Y" : "N",
          Discount: item.Discount, DiscountVal: item.DiscountVal, TaxableValue: item.TaxableValue,
          CGSTRate: item.CGSTRate, CGSTAmt: item.CGSTAmt,
          SGSTRate: item.SGSTRate, SGSTAmt: item.SGSTAmt,
          IGSTRate: item.IGSTRate, IGSTAmt: item.IGSTAmt, TotalAmount: item.TotalAmount,
        })),
      }
      await createInvoice(payload)
      setDialogOpen(false); setEditingId(null)
      setForm(emptyInvoiceForm()); setLineItems([]); fetchData()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this invoice?")) return
    try { await deleteInvoice(String(id)); fetchData() } catch { /* silent */ }
  }

  const handleView = async (id: number) => {
    try { const res = await getInvoice(String(id)); setViewingInvoice(res?.data || null); setViewDialogOpen(true) } catch { /* silent */ }
  }

  const generateInvoiceNo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const shortYear = String(year).slice(-2) + '-' + String(year + 1).slice(-2)
    const count = String(invoices.length + 1).padStart(3, '0')
    return `INV/${count}/${shortYear}`
  }

  const openCreateForm = () => {
    setEditingId(null)
    const newForm = emptyInvoiceForm()
    newForm.InvoiceNo = generateInvoiceNo()
    setForm(newForm)
    setLineItems([])
    setActiveTab("header")
    setDialogOpen(true)
  }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><IconFileInvoice className="h-6 w-6" /> Invoices</h1>
          <p className="text-sm text-muted-foreground">GST-compliant invoice management with line items (one-to-many)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyInvoiceForm()); setLineItems([]) } }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm}><IconPlus className="mr-2 h-4 w-4" /> New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[94vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Create"} Invoice</DialogTitle></DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="header"><IconBuilding className="mr-1 h-3 w-3" /> Header</TabsTrigger>
                <TabsTrigger value="receiver"><IconShieldCheck className="mr-1 h-3 w-3" /> Receiver</TabsTrigger>
                <TabsTrigger value="lineitems"><IconFileInvoice className="mr-1 h-3 w-3" /> Items ({lineItems.length})</TabsTrigger>
                <TabsTrigger value="summary"><IconPrinter className="mr-1 h-3 w-3" /> Summary</TabsTrigger>
              </TabsList>

              {/* TAB 1: HEADER */}
              <TabsContent value="header" className="space-y-4 mt-4">
                <FieldGroup>
                  <div className="grid grid-cols-3 gap-4">
                    <Field><FieldLabel>Invoice No (H1) — Auto Generated</FieldLabel><Input value={form.InvoiceNo} readOnly className="bg-muted font-mono text-sm" /></Field>
                    <Field><FieldLabel>Invoice Date (H2) *</FieldLabel><Input type="date" value={form.InvoiceDate} onChange={e => updateForm("InvoiceDate", e.target.value)} /></Field>
                    <Field>
                      <FieldLabel>Invoice Type</FieldLabel>
                      <Select value={form.InvoiceType} onValueChange={v => updateForm("InvoiceType", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sales Invoice">Sales Invoice</SelectItem>
                          <SelectItem value="Service Invoice">Service Invoice</SelectItem>
                          <SelectItem value="SEZ Sales Invoice">SEZ Sales Invoice</SelectItem>
                          <SelectItem value="SEZ Service Invoice">SEZ Service Invoice</SelectItem>
                          <SelectItem value="Export Sales Invoice">Export Sales Invoice</SelectItem>
                          <SelectItem value="Export Service Invoice">Export Service Invoice</SelectItem>
                          <SelectItem value="Proforma Invoice">Proforma Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Tax Type</FieldLabel>
                      <Select value={form.TaxType} onValueChange={v => updateForm("TaxType", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Local State">Local State (CGST + SGST)</SelectItem>
                          <SelectItem value="Inter-State">Inter-State (IGST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Party (Receiver) *</FieldLabel>
                      <Select value={form.PartyID} onValueChange={handlePartyChange}><SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                        <SelectContent>{parties.map(p => <SelectItem key={p.PartyID} value={String(p.PartyID)}>{p.PartyName}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">References (H3-H10)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Challan No (H3)</FieldLabel><Input value={form.ChallanNo} onChange={e => updateForm("ChallanNo", e.target.value)} /></Field>
                        <Field><FieldLabel>Challan Date (H4)</FieldLabel><Input type="date" value={form.ChallanDate} onChange={e => updateForm("ChallanDate", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Party DC No (H5)</FieldLabel><Input value={form.PartyDCNo} onChange={e => updateForm("PartyDCNo", e.target.value)} /></Field>
                        <Field><FieldLabel>Party DC Date (H6)</FieldLabel><Input type="date" value={form.PartyDCDate} onChange={e => updateForm("PartyDCDate", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>PO No (H7)</FieldLabel><Input value={form.PO} onChange={e => updateForm("PO", e.target.value)} /></Field>
                        <Field><FieldLabel>PO Date (H8)</FieldLabel><Input type="date" value={form.PODate} onChange={e => updateForm("PODate", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>ARN No (H9)</FieldLabel><Input value={form.ARNNo} onChange={e => updateForm("ARNNo", e.target.value)} /></Field>
                        <Field><FieldLabel>ARN Date (H10)</FieldLabel><Input type="date" value={form.ARNDate} onChange={e => updateForm("ARNDate", e.target.value)} /></Field>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><IconTruck className="h-3.5 w-3.5" /> Transportation (H11-H14, W1-W6)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Field>
                          <FieldLabel>Transport Mode (H11)</FieldLabel>
                          <Select value={form.TransportationMode} onValueChange={v => updateForm("TransportationMode", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent><SelectItem value="Road">Road</SelectItem><SelectItem value="Rail">Rail</SelectItem><SelectItem value="Air">Air</SelectItem><SelectItem value="Ship">Ship</SelectItem></SelectContent>
                          </Select>
                        </Field>
                        <Field><FieldLabel>Supply To State (H12)</FieldLabel><Input value={form.SupplyTo} onChange={e => updateForm("SupplyTo", e.target.value)} /></Field>
                        <Field><FieldLabel>Supply State Code</FieldLabel><Input value={form.SupplyStateCode} onChange={e => updateForm("SupplyStateCode", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Model No (H13)</FieldLabel><Input value={form.ModelNo} onChange={e => updateForm("ModelNo", e.target.value)} /></Field>
                        <Field><FieldLabel>Against Form (H14)</FieldLabel><Input value={form.AgainstForm} onChange={e => updateForm("AgainstForm", e.target.value)} placeholder="C, F, H..." /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>Transporter ID (W1)</FieldLabel><Input value={form.TransporterID} onChange={e => updateForm("TransporterID", e.target.value)} /></Field>
                        <Field><FieldLabel>Transporter Name (W2)</FieldLabel><Input value={form.TransporterName} onChange={e => updateForm("TransporterName", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Field><FieldLabel>Distance KM (W4)</FieldLabel><Input value={form.Distance} onChange={e => updateForm("Distance", e.target.value)} /></Field>
                        <Field><FieldLabel>Vehicle No (W5)</FieldLabel><Input value={form.VehicleNo} onChange={e => updateForm("VehicleNo", e.target.value)} /></Field>
                        <Field>
                          <FieldLabel>Vehicle Type (W6)</FieldLabel>
                          <Select value={form.VehicleType} onValueChange={v => updateForm("VehicleType", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Over Dimensional Cargo">Over Dimensional Cargo</SelectItem></SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-4 gap-4">
                    <Field><FieldLabel>Packing Charge (F2)</FieldLabel><Input type="number" value={form.PackingCharge} onChange={e => updateForm("PackingCharge", e.target.value)} /></Field>
                    {!isInterState ? (<>
                      <Field><FieldLabel>PC CGST % (F3)</FieldLabel><Input type="number" value={form.PCGSTRate} onChange={e => updateForm("PCGSTRate", e.target.value)} /></Field>
                      <Field><FieldLabel>PC SGST %</FieldLabel><Input type="number" value={form.PSGSTRate} onChange={e => updateForm("PSGSTRate", e.target.value)} /></Field>
                    </>) : (
                      <Field className="col-span-2"><FieldLabel>PC IGST % (F3)</FieldLabel><Input type="number" value={form.PIGSTRate} onChange={e => updateForm("PIGSTRate", e.target.value)} /></Field>
                    )}
                    <Field>
                      <FieldLabel>GST Reverse Charge (F9)</FieldLabel>
                      <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" checked={form.GSTReverseCharge} onChange={e => updateForm("GSTReverseCharge", e.target.checked)} className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Apply</span>
                      </div>
                    </Field>
                  </div>
                  <Field><FieldLabel>Remarks (F15)</FieldLabel><Input value={form.Remarks} onChange={e => updateForm("Remarks", e.target.value)} /></Field>
                </FieldGroup>
              </TabsContent>

              {/* TAB 2: RECEIVER / CONSIGNEE */}
              <TabsContent value="receiver" className="space-y-4 mt-4">
                <FieldGroup>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Receiver / Bill To (R1-R6)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Field><FieldLabel>Receiver Name (R1) *</FieldLabel><Input value={form.ReceiverName} onChange={e => updateForm("ReceiverName", e.target.value)} /></Field>
                      <Field><FieldLabel>Receiver Address (R2)</FieldLabel><Input value={form.ReceiverAddress} onChange={e => updateForm("ReceiverAddress", e.target.value)} /></Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>GSTIN (R3)</FieldLabel><Input value={form.ReceiverGSTIN} onChange={e => updateForm("ReceiverGSTIN", e.target.value)} /></Field>
                        <Field><FieldLabel>PAN No (R6)</FieldLabel><Input value={form.ReceiverPanNo} onChange={e => updateForm("ReceiverPanNo", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel>State (R4)</FieldLabel><Input value={form.ReceiverState} onChange={e => updateForm("ReceiverState", e.target.value)} /></Field>
                        <Field><FieldLabel>State Code (R5)</FieldLabel><Input value={form.ReceiverStateCode} onChange={e => updateForm("ReceiverStateCode", e.target.value)} /></Field>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Consignee / Ship To (C1-C7)</CardTitle>
                        <label className="flex items-center gap-2 text-sm font-normal">
                          <input type="checkbox" checked={form.IsSameAddress} onChange={e => handleSameAddress(e.target.checked)} className="h-4 w-4" />
                          Same as Receiver (C1)
                        </label>
                      </div>
                    </CardHeader>
                    {!form.IsSameAddress && (
                      <CardContent className="space-y-3">
                        <Field><FieldLabel>Consignee Name (C2)</FieldLabel><Input value={form.ConsigneeName} onChange={e => updateForm("ConsigneeName", e.target.value)} /></Field>
                        <Field><FieldLabel>Consignee Address (C3)</FieldLabel><Input value={form.ConsigneeAddress} onChange={e => updateForm("ConsigneeAddress", e.target.value)} /></Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field><FieldLabel>GSTIN (C4)</FieldLabel><Input value={form.ConsigneeGSTIN} onChange={e => updateForm("ConsigneeGSTIN", e.target.value)} /></Field>
                          <Field><FieldLabel>PAN No (C7)</FieldLabel><Input value={form.ConsigneePanNo} onChange={e => updateForm("ConsigneePanNo", e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field><FieldLabel>State (C5)</FieldLabel><Input value={form.ConsigneeState} onChange={e => updateForm("ConsigneeState", e.target.value)} /></Field>
                          <Field><FieldLabel>State Code (C6)</FieldLabel><Input value={form.ConsigneeStateCode} onChange={e => updateForm("ConsigneeStateCode", e.target.value)} /></Field>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </FieldGroup>
              </TabsContent>

              {/* TAB 3: LINE ITEMS G1-G17 */}
              <TabsContent value="lineitems" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{lineItems.length} item(s) — Invoice → InvoiceDetail (one-to-many)</p>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}><IconPlus className="mr-1 h-3 w-3" /> Add Item</Button>
                </div>
                {lineItems.length > 0 ? (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[160px]"># Product (G1)</TableHead>
                          <TableHead>Description (G2)</TableHead>
                          <TableHead className="w-[70px]">HSN/SAC (G3)</TableHead>
                          <TableHead className="w-[50px]">UOM (G4)</TableHead>
                          <TableHead className="w-[50px]">Qty (G5)</TableHead>
                          <TableHead className="w-[70px]">Rate ₹ (G6)</TableHead>
                          <TableHead className="w-[50px]">Disc% (G8)</TableHead>
                          <TableHead className="w-[80px]">Taxable (G10)</TableHead>
                          {!isInterState ? (<><TableHead className="w-[55px]">CGST% (G11)</TableHead><TableHead className="w-[55px]">SGST% (G13)</TableHead></>) : (<TableHead className="w-[55px]">IGST% (G15)</TableHead>)}
                          <TableHead className="w-[80px] text-right">Total ₹ (G17)</TableHead>
                          <TableHead className="w-[36px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, idx) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs">{idx + 1}.</TableCell>
                            <TableCell>
                              <Select value={item.ProductName} onValueChange={v => selectProduct(item.id, v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p.ProductID} value={p.ProductName}>{p.ProductName}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Input className="h-8 text-xs" value={item.Description} onChange={e => updateLineItem(item.id, "Description", e.target.value)} /></TableCell>
                            <TableCell><Input className="h-8 text-xs" value={item.HSNACS} onChange={e => updateLineItem(item.id, "HSNACS", e.target.value)} /></TableCell>
                            <TableCell><Input className="h-8 text-xs w-12" value={item.UOM} onChange={e => updateLineItem(item.id, "UOM", e.target.value)} /></TableCell>
                            <TableCell><Input type="number" className="h-8 text-xs w-12" value={item.Qty} onChange={e => updateLineItem(item.id, "Qty", e.target.value)} /></TableCell>
                            <TableCell><Input type="number" className="h-8 text-xs w-16" value={item.Rate} onChange={e => updateLineItem(item.id, "Rate", e.target.value)} /></TableCell>
                            <TableCell><Input type="number" className="h-8 text-xs w-12" value={item.Discount} onChange={e => updateLineItem(item.id, "Discount", e.target.value)} /></TableCell>
                            <TableCell className="text-right text-xs font-medium">{formatINR(item.TaxableValue)}</TableCell>
                            {!isInterState ? (<>
                              <TableCell><Input type="number" className="h-8 text-xs w-12" value={item.CGSTRate} onChange={e => updateLineItem(item.id, "CGSTRate", e.target.value)} /></TableCell>
                              <TableCell><Input type="number" className="h-8 text-xs w-12" value={item.SGSTRate} onChange={e => updateLineItem(item.id, "SGSTRate", e.target.value)} /></TableCell>
                            </>) : (
                              <TableCell><Input type="number" className="h-8 text-xs w-12" value={item.IGSTRate} onChange={e => updateLineItem(item.id, "IGSTRate", e.target.value)} /></TableCell>
                            )}
                            <TableCell className="text-right text-xs font-semibold">{formatINR(item.TotalAmount)}</TableCell>
                            <TableCell><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLineItem(item.id)}><IconTrash className="h-3 w-3" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">No line items yet. Click &quot;Add Item&quot; to begin.</div>
                )}
              </TabsContent>

              {/* TAB 4: SUMMARY F1-F14 */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Tax & Total Summary (F1-F14)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Total Amt Before Tax (F1):</span><span className="font-medium">{formatINR(totals.beforeTax)}</span></div>
                    <div className="flex justify-between text-sm"><span>Packing Charge (F2):</span><span>{formatINR(totals.packing)}</span></div>
                    {totals.pcCgst > 0 && <div className="flex justify-between text-xs text-muted-foreground pl-4"><span>PC CGST (F4):</span><span>{formatINR(totals.pcCgst)}</span></div>}
                    {totals.pcSgst > 0 && <div className="flex justify-between text-xs text-muted-foreground pl-4"><span>PC SGST:</span><span>{formatINR(totals.pcSgst)}</span></div>}
                    {totals.pcIgst > 0 && <div className="flex justify-between text-xs text-muted-foreground pl-4"><span>PC IGST (F4):</span><span>{formatINR(totals.pcIgst)}</span></div>}
                    <div className="flex justify-between text-sm border-t pt-1"><span>CGST Total (F5):</span><span>{formatINR(totals.cgst)}</span></div>
                    <div className="flex justify-between text-sm"><span>SGST Total (F6):</span><span>{formatINR(totals.sgst)}</span></div>
                    <div className="flex justify-between text-sm"><span>IGST Total (F7):</span><span>{formatINR(totals.igst)}</span></div>
                    <div className="flex justify-between text-sm"><span>Total GST Tax (F8):</span><span className="font-medium">{formatINR(totals.totalGST)}</span></div>
                    <div className="flex justify-between text-sm"><span>Total Amt After Tax (F10):</span><span>{formatINR(totals.afterTax)}</span></div>
                    <div className="flex justify-between text-sm"><span>Round Off (F11):</span><span>{totals.roundOff.toFixed(2)}</span></div>
                    <div className="flex justify-between border-t pt-2 text-xl font-bold"><span>Grand Total (F12):</span><span>{formatINR(totals.grandTotal)}</span></div>
                    <div className="rounded bg-muted p-2 text-xs"><span className="font-semibold">Total In Words (F13):</span> {totalInWords}</div>
                    <div className="rounded bg-muted p-2 text-xs"><span className="font-semibold">Tax In Words (F14):</span> {taxInWords}</div>
                  </CardContent>
                </Card>
                <Button onClick={handleSave} disabled={loading || !form.PartyID || lineItems.length === 0} className="w-full" size="lg">
                  {editingId ? "Update Invoice" : "Save Invoice"}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* INVOICE DATA TABLE — all fields */}
      <Card>
        <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead><TableHead>Invoice No</TableHead><TableHead>Date</TableHead>
                  <TableHead>Type</TableHead><TableHead>Party</TableHead><TableHead>GSTIN</TableHead>
                  <TableHead>Consignee</TableHead><TableHead>Challan</TableHead><TableHead>PO</TableHead>
                  <TableHead>ARN</TableHead><TableHead>Transport</TableHead><TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Before Tax</TableHead><TableHead className="text-right">CGST</TableHead>
                  <TableHead className="text-right">SGST</TableHead><TableHead className="text-right">IGST</TableHead>
                  <TableHead className="text-right">Packing</TableHead><TableHead className="text-right">Total Tax</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead>IRN</TableHead><TableHead>EWB</TableHead><TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead><TableHead className="w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={24} className="text-center text-muted-foreground py-8">No invoices found. Create your first invoice.</TableCell></TableRow>
                ) : invoices.map((inv) => (
                  <TableRow key={inv.InvoiceID}>
                    <TableCell className="font-medium">{inv.InvoiceID}</TableCell>
                    <TableCell>{inv.InvoiceNo || "-"}</TableCell>
                    <TableCell>{inv.InvoiceDate ? new Date(inv.InvoiceDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                    <TableCell>{inv.InvoiceType || "-"}</TableCell>
                    <TableCell>{inv.ReceiverName || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.ReceiverGSTIN || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.ConsigneeName || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.ChallanNo || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.PO || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.ARNNo || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.TransportationMode || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.VehNo || "-"}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.TotalAmtBeforeTax)}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.CGST)}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.SGST)}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.IGST)}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.PackingCharge)}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(inv.TotalGSTTax)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatINR(inv.GrandTotalAmount)}</TableCell>
                    <TableCell className="text-xs">{inv.IRNNo || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.EwbNo || "-"}</TableCell>
                    <TableCell className="text-xs">{inv.CreatedBy || "-"}</TableCell>
                    <TableCell>{inv.IRNNo ? <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">E-Invoice</span> : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Draft</span>}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(inv.InvoiceID)} title="View"><IconEye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Print"><IconPrinter className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Export PDF"><IconDownload className="h-3.5 w-3.5" /></Button>
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(inv.InvoiceID)} title="Delete"><IconTrash className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice Details — {viewingInvoice?.InvoiceNo || ""}</DialogTitle></DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Invoice No:</span> <span className="font-medium">{viewingInvoice.InvoiceNo || "-"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewingInvoice.InvoiceDate ? new Date(viewingInvoice.InvoiceDate).toLocaleDateString("en-IN") : "-"}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{viewingInvoice.InvoiceType || "-"}</span></div>
                <div><span className="text-muted-foreground">Party:</span> {viewingInvoice.ReceiverName || "-"}</div>
                <div><span className="text-muted-foreground">GSTIN:</span> {viewingInvoice.ReceiverGSTIN || "-"}</div>
                <div><span className="text-muted-foreground">State:</span> {viewingInvoice.ReceiverState || "-"} ({viewingInvoice.ReceiverStateCode || "-"})</div>
                <div><span className="text-muted-foreground">Consignee:</span> {viewingInvoice.ConsigneeName || "-"}</div>
                <div><span className="text-muted-foreground">Challan:</span> {viewingInvoice.ChallanNo || "-"}</div>
                <div><span className="text-muted-foreground">PO:</span> {viewingInvoice.PO || "-"}</div>
                <div><span className="text-muted-foreground">Transport:</span> {viewingInvoice.TransportationMode || "-"}</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {viewingInvoice.VehNo || "-"}</div>
                <div><span className="text-muted-foreground">IRN:</span> {viewingInvoice.IRNNo || "-"}</div>
                <div><span className="text-muted-foreground">EWB:</span> {viewingInvoice.EwbNo || "-"}</div>
              </div>
              {viewingInvoice.lineItems && viewingInvoice.lineItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Line Items (InvoiceDetail)</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Product</TableHead><TableHead>HSN</TableHead><TableHead>UOM</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Disc</TableHead><TableHead className="text-right">Taxable</TableHead><TableHead className="text-right">CGST</TableHead><TableHead className="text-right">SGST</TableHead><TableHead className="text-right">IGST</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {viewingInvoice.lineItems.map((li: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{li.ProductName}</TableCell>
                          <TableCell className="text-xs">{li.HSNACS || "-"}</TableCell>
                          <TableCell className="text-xs">{li.UOM || "-"}</TableCell>
                          <TableCell className="text-right text-xs">{li.Qty}</TableCell>
                          <TableCell className="text-right text-xs">{formatINR(li.Rate)}</TableCell>
                          <TableCell className="text-right text-xs">{li.Discount || 0}%</TableCell>
                          <TableCell className="text-right text-xs">{formatINR(li.TaxableValue)}</TableCell>
                          <TableCell className="text-right text-xs">{formatINR(li.CGSTAmt)}</TableCell>
                          <TableCell className="text-right text-xs">{formatINR(li.SGSTAmt)}</TableCell>
                          <TableCell className="text-right text-xs">{formatINR(li.IGSTAmt)}</TableCell>
                          <TableCell className="text-right text-xs font-semibold">{formatINR(li.TotalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Before Tax:</span><span>{formatINR(viewingInvoice.TotalAmtBeforeTax)}</span></div>
                <div className="flex justify-between"><span>Packing:</span><span>{formatINR(viewingInvoice.PackingCharge)}</span></div>
                <div className="flex justify-between"><span>CGST:</span><span>{formatINR(viewingInvoice.CGST)}</span></div>
                <div className="flex justify-between"><span>SGST:</span><span>{formatINR(viewingInvoice.SGST)}</span></div>
                <div className="flex justify-between"><span>IGST:</span><span>{formatINR(viewingInvoice.IGST)}</span></div>
                <div className="flex justify-between"><span>Total Tax:</span><span>{formatINR(viewingInvoice.TotalGSTTax)}</span></div>
                <div className="flex justify-between border-t pt-1 font-bold text-base"><span>Grand Total:</span><span>{formatINR(viewingInvoice.GrandTotalAmount)}</span></div>
                {viewingInvoice.TotalInWords && <div className="text-xs text-muted-foreground pt-1"><strong>In Words:</strong> {viewingInvoice.TotalInWords}</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedLayout>
  )
}
