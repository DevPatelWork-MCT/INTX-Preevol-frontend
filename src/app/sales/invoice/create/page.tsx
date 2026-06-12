"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { usePartyApi } from "@/hooks/usePartyApi"
import { useProductApi } from "@/hooks/useProductApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  IconPlus, IconTrash, IconArrowLeft, IconDeviceFloppy,
  IconFileInvoice, IconBuilding, IconShieldCheck, IconTruck,
} from "@tabler/icons-react"
import { DatePicker } from "@/components/ui/date-picker"
import { StateCodeSelect } from "@/components/ui/state-code-select"
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
  SupplyTo: string; SupplyStateCode: number | null;
  PartyID: string; ReceiverName: string; ReceiverAddress: string;
  ReceiverGSTIN: string; ReceiverState: string; ReceiverStateCode: number | null; ReceiverPanNo: string;
  IsSameAddress: boolean; ConsigneeName: string; ConsigneeAddress: string;
  ConsigneeGSTIN: string; ConsigneeState: string; ConsigneeStateCode: number | null; ConsigneePanNo: string;
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
  SupplyTo: "", SupplyStateCode: null,
  PartyID: "", ReceiverName: "", ReceiverAddress: "",
  ReceiverGSTIN: "", ReceiverState: "", ReceiverStateCode: null, ReceiverPanNo: "",
  IsSameAddress: true, ConsigneeName: "", ConsigneeAddress: "",
  ConsigneeGSTIN: "", ConsigneeState: "", ConsigneeStateCode: null, ConsigneePanNo: "",
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
export default function CreateInvoicePage() {
  const router = useRouter()
  const { createInvoice, loading } = useInvoiceApi()
  const { listParties } = usePartyApi()
  const { listProducts } = useProductApi()

  const [parties, setParties] = React.useState<any[]>([])
  const [products, setProducts] = React.useState<any[]>([])
  const generateInvoiceNo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const shortYear = String(year).slice(-2) + '-' + String(year + 1).slice(-2)
    const count = "001"
    return `INV/${count}/${shortYear}`
  }

  const [form, setForm] = React.useState<InvoiceForm>(() => {
    const f = emptyInvoiceForm()
    f.InvoiceNo = generateInvoiceNo()
    return f
  })
  const [lineItems, setLineItems] = React.useState<LineItem[]>([])
  const [activeSection, setActiveSection] = React.useState("header")

  React.useEffect(() => {
    ;(async () => {
      const [partyRes, prodRes] = await Promise.all([listParties(), listProducts()])
      setParties(partyRes?.data || [])
      setProducts(prodRes?.data || [])
    })()
  }, [listParties, listProducts])

  const isInterState = form.TaxType === "Inter-State"

  const updateForm = (field: keyof InvoiceForm, value: any) => setForm(prev => ({ ...prev, [field]: value }))

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
    updateForm("ReceiverStateCode", party.StateCode ? Number(party.StateCode) : null)
    updateForm("ReceiverPanNo", party.PANNo || "")
    if (form.IsSameAddress) {
      updateForm("ConsigneeName", party.PartyName)
      updateForm("ConsigneeAddress", party.Address || "")
      updateForm("ConsigneeGSTIN", party.GSTIN || "")
      updateForm("ConsigneeState", party.State || "")
      updateForm("ConsigneeStateCode", party.StateCode ? Number(party.StateCode) : null)
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
        updateForm("ConsigneeStateCode", party.StateCode ? Number(party.StateCode) : null)
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
        InvoiceNo: form.InvoiceNo,
        InvoiceDate: form.InvoiceDate ? new Date(form.InvoiceDate) : new Date(),
        InvoiceType: form.InvoiceType,
        TaxType: form.TaxType,
        PartyID: Number(form.PartyID),
        ChallanNo: form.ChallanNo || null,
        ChallanDate: form.ChallanDate ? new Date(form.ChallanDate) : null,
        PartyDCNo: form.PartyDCNo || null,
        PartyDCDate: form.PartyDCDate ? new Date(form.PartyDCDate) : null,
        PO: form.PO || null,
        PODate: form.PODate ? new Date(form.PODate) : null,
        ARNNo: form.ARNNo || null,
        ARNDate: form.ARNDate ? new Date(form.ARNDate) : null,
        TransportationMode: form.TransportationMode || null,
        SupplyTo: form.SupplyTo || null,
        SupplyStateCode: form.SupplyStateCode != null ? Number(form.SupplyStateCode) : null,
        ModelNo: form.ModelNo || null,
        AgainstForm: form.AgainstForm || null,
        ReceiverName: form.ReceiverName,
        ReceiverAddress: form.ReceiverAddress || null,
        ReceiverGSTIN: form.ReceiverGSTIN || null,
        ReceiverState: form.ReceiverState || null,
        ReceiverStateCode: form.ReceiverStateCode != null ? String(form.ReceiverStateCode) : null,
        ReceiverPanNo: form.ReceiverPanNo || null,
        ConsigneeName: form.ConsigneeName || null,
        ConsigneeAddress: form.ConsigneeAddress || null,
        ConsigneeGSTIN: form.ConsigneeGSTIN || null,
        ConsigneeState: form.ConsigneeState || null,
        ConsigneeStateCode: form.ConsigneeStateCode != null ? String(form.ConsigneeStateCode) : null,
        ConsigneePanNo: form.ConsigneePanNo || null,
        IsSameAddress: form.IsSameAddress,
        PackingCharge: Number(form.PackingCharge) || 0,
        PCGSTRate: Number(form.PCGSTRate) || 0,
        PSGSTRate: Number(form.PSGSTRate) || 0,
        PIGSTRate: Number(form.PIGSTRate) || 0,
        TotalAmtBeforeTax: totals.beforeTax,
        CGST: totals.cgst, SGST: totals.sgst, IGST: totals.igst,
        PCGSTAmt: totals.pcCgst, PSGSTAmt: totals.pcSgst, PIGSTAmt: totals.pcIgst,
        TotalGSTTax: totals.totalGST,
        TotalAmtAfterTax: totals.afterTax,
        GrandTotalAmount: totals.grandTotal,
        RoundOff: totals.roundOff,
        GSTReverseCharge: form.GSTReverseCharge ? 1 : 0,
        TotalInWords: totalInWords,
        TaxInWords: taxInWords,
        Remarks: form.Remarks || null,
        VehicleNo: form.VehicleNo || null,
        VehicleType: form.VehicleType || null,
        Distance: form.Distance ? String(form.Distance) : null,
        TransporterID: form.TransporterID || null,
        TransporterName: form.TransporterName || null,
        lineItems: lineItems.map(item => ({
          ProductName: item.ProductName,
          Description: item.Description || null,
          HSNACS: item.HSNACS || null,
          UOM: item.UOM || null,
          Qty: Number(item.Qty) || 0,
          Rate: Number(item.Rate) || 0,
          IsService: item.IsService ? "Y" : "N",
          Discount: Number(item.Discount) || 0,
          DiscountVal: Number(item.DiscountVal) || 0,
          TaxableValue: Number(item.TaxableValue) || 0,
          CGSTRate: Number(item.CGSTRate) || 0,
          CGSTAmt: Number(item.CGSTAmt) || 0,
          SGSTRate: Number(item.SGSTRate) || 0,
          SGSTAmt: Number(item.SGSTAmt) || 0,
          IGSTRate: Number(item.IGSTRate) || 0,
          IGSTAmt: Number(item.IGSTAmt) || 0,
          TotalAmount: Number(item.TotalAmount) || 0,
        })),
      }
      await createInvoice(payload)
      alert("Invoice created successfully!")
      router.push("/sales/invoice")
    } catch (e) {
      console.error(e)
      alert("Failed to create invoice")
    }
  }

  const sections = [
    { id: "header", label: "Header", icon: <IconBuilding className="h-4 w-4" /> },
    { id: "receiver", label: "Receiver", icon: <IconShieldCheck className="h-4 w-4" /> },
    { id: "lineitems", label: `Items (${lineItems.length})`, icon: <IconFileInvoice className="h-4 w-4" /> },
    { id: "summary", label: "Summary", icon: <IconDeviceFloppy className="h-4 w-4" /> },
  ]

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

            {/* Header */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/sales/invoice"><IconArrowLeft className="h-4 w-4" /></Link>
                  </Button>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <IconFileInvoice className="h-5 w-5" /> Create Invoice
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fill in the details below to create a new GST invoice
                    </p>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={loading || !form.PartyID || lineItems.length === 0} size="lg">
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  {loading ? "Saving…" : "Save Invoice"}
                </Button>
              </CardHeader>
            </Card>

            {/* Section Navigation */}
            <div className="mx-4 lg:mx-6">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sections.map(s => (
                  <Button
                    key={s.id}
                    variant={activeSection === s.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(s.id)}
                    className="gap-1.5 whitespace-nowrap"
                  >
                    {s.icon}
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* SECTION: HEADER */}
            {activeSection === "header" && (
              <div className="mx-4 lg:mx-6 space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Invoice Details (H1-H2)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field>
                        <FieldLabel>Invoice No — Auto Generated</FieldLabel>
                        <Input value={form.InvoiceNo} readOnly className="bg-muted font-mono text-sm" />
                      </Field>
                      <Field>
                        <FieldLabel>Invoice Date *</FieldLabel>
                        <DatePicker value={form.InvoiceDate} onChange={v => updateForm("InvoiceDate", v)} />
                      </Field>
                      <Field>
                        <FieldLabel>Invoice Type</FieldLabel>
                        <Select value={form.InvoiceType} onValueChange={v => updateForm("InvoiceType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Tax & Party</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Tax Type</FieldLabel>
                        <Select value={form.TaxType} onValueChange={v => updateForm("TaxType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Local State">Local State (CGST + SGST)</SelectItem>
                            <SelectItem value="Inter-State">Inter-State (IGST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Party (Receiver) *</FieldLabel>
                        <Select value={form.PartyID} onValueChange={handlePartyChange}>
                          <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                          <SelectContent>
                            {parties.map(p => <SelectItem key={p.PartyID} value={String(p.PartyID)}>{p.PartyName}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">References (H3-H10)</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>Challan No (H3)</FieldLabel><Input value={form.ChallanNo} onChange={e => updateForm("ChallanNo", e.target.value)} /></Field>
                      <Field><FieldLabel>Challan Date (H4)</FieldLabel><DatePicker value={form.ChallanDate} onChange={v => updateForm("ChallanDate", v)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>Party DC No (H5)</FieldLabel><Input value={form.PartyDCNo} onChange={e => updateForm("PartyDCNo", e.target.value)} /></Field>
                      <Field><FieldLabel>Party DC Date (H6)</FieldLabel><DatePicker value={form.PartyDCDate} onChange={v => updateForm("PartyDCDate", v)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>PO No (H7)</FieldLabel><Input value={form.PO} onChange={e => updateForm("PO", e.target.value)} /></Field>
                      <Field><FieldLabel>PO Date (H8)</FieldLabel><DatePicker value={form.PODate} onChange={v => updateForm("PODate", v)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>ARN No (H9)</FieldLabel><Input value={form.ARNNo} onChange={e => updateForm("ARNNo", e.target.value)} /></Field>
                      <Field><FieldLabel>ARN Date (H10)</FieldLabel><DatePicker value={form.ARNDate} onChange={v => updateForm("ARNDate", v)} /></Field>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-1"><IconTruck className="h-4 w-4" /> Transportation (H11-H14, W1-W6)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field>
                        <FieldLabel>Transport Mode (H11)</FieldLabel>
                        <Select value={form.TransportationMode} onValueChange={v => updateForm("TransportationMode", v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Road">Road</SelectItem>
                            <SelectItem value="Rail">Rail</SelectItem>
                            <SelectItem value="Air">Air</SelectItem>
                            <SelectItem value="Ship">Ship</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field><FieldLabel>Supply To State (H12)</FieldLabel><Input value={form.SupplyTo} onChange={e => updateForm("SupplyTo", e.target.value)} /></Field>
                      <Field><FieldLabel>Supply State Code</FieldLabel><StateCodeSelect value={form.SupplyStateCode} onChange={v => updateForm("SupplyStateCode", v)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>Model No (H13)</FieldLabel><Input value={form.ModelNo} onChange={e => updateForm("ModelNo", e.target.value)} /></Field>
                      <Field><FieldLabel>Against Form (H14)</FieldLabel><Input value={form.AgainstForm} onChange={e => updateForm("AgainstForm", e.target.value)} placeholder="C, F, H..." /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>Transporter ID (W1)</FieldLabel><Input value={form.TransporterID} onChange={e => updateForm("TransporterID", e.target.value)} /></Field>
                      <Field><FieldLabel>Transporter Name (W2)</FieldLabel><Input value={form.TransporterName} onChange={e => updateForm("TransporterName", e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field><FieldLabel>Distance KM (W4)</FieldLabel><Input value={form.Distance} onChange={e => updateForm("Distance", e.target.value)} /></Field>
                      <Field><FieldLabel>Vehicle No (W5)</FieldLabel><Input value={form.VehicleNo} onChange={e => updateForm("VehicleNo", e.target.value)} /></Field>
                      <Field>
                        <FieldLabel>Vehicle Type (W6)</FieldLabel>
                        <Select value={form.VehicleType} onValueChange={v => updateForm("VehicleType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Over Dimensional Cargo">Over Dimensional Cargo</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Charges & Remarks (F2-F15)</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Field><FieldLabel>Packing Charge (F2)</FieldLabel><Input type="number" value={form.PackingCharge} onChange={e => updateForm("PackingCharge", e.target.value)} /></Field>
                      {!isInterState ? (
                        <>
                          <Field><FieldLabel>PC CGST % (F3)</FieldLabel><Input type="number" value={form.PCGSTRate} onChange={e => updateForm("PCGSTRate", e.target.value)} /></Field>
                          <Field><FieldLabel>PC SGST %</FieldLabel><Input type="number" value={form.PSGSTRate} onChange={e => updateForm("PSGSTRate", e.target.value)} /></Field>
                        </>
                      ) : (
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
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveSection("receiver")} size="lg">Next: Receiver →</Button>
                </div>
              </div>
            )}

            {/* SECTION: RECEIVER */}
            {activeSection === "receiver" && (
              <div className="mx-4 lg:mx-6 space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Receiver / Bill To (R1-R6)</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Field><FieldLabel>Receiver Name (R1) *</FieldLabel><Input value={form.ReceiverName} onChange={e => updateForm("ReceiverName", e.target.value)} /></Field>
                    <Field><FieldLabel>Receiver Address (R2)</FieldLabel><Input value={form.ReceiverAddress} onChange={e => updateForm("ReceiverAddress", e.target.value)} /></Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>GSTIN (R3)</FieldLabel><Input value={form.ReceiverGSTIN} onChange={e => updateForm("ReceiverGSTIN", e.target.value)} /></Field>
                      <Field><FieldLabel>PAN No (R6)</FieldLabel><Input value={form.ReceiverPanNo} onChange={e => updateForm("ReceiverPanNo", e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field><FieldLabel>State (R4)</FieldLabel><Input value={form.ReceiverState} onChange={e => updateForm("ReceiverState", e.target.value)} /></Field>
                      <Field><FieldLabel>State Code (R5)</FieldLabel><StateCodeSelect value={form.ReceiverStateCode} onChange={v => updateForm("ReceiverStateCode", v)} /></Field>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Consignee / Ship To (C1-C7)</CardTitle>
                      <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <input type="checkbox" checked={form.IsSameAddress} onChange={e => handleSameAddress(e.target.checked)} className="h-4 w-4" />
                        Same as Receiver (C1)
                      </label>
                    </div>
                  </CardHeader>
                  {!form.IsSameAddress && (
                    <CardContent className="space-y-3">
                      <Field><FieldLabel>Consignee Name (C2)</FieldLabel><Input value={form.ConsigneeName} onChange={e => updateForm("ConsigneeName", e.target.value)} /></Field>
                      <Field><FieldLabel>Consignee Address (C3)</FieldLabel><Input value={form.ConsigneeAddress} onChange={e => updateForm("ConsigneeAddress", e.target.value)} /></Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field><FieldLabel>GSTIN (C4)</FieldLabel><Input value={form.ConsigneeGSTIN} onChange={e => updateForm("ConsigneeGSTIN", e.target.value)} /></Field>
                        <Field><FieldLabel>PAN No (C7)</FieldLabel><Input value={form.ConsigneePanNo} onChange={e => updateForm("ConsigneePanNo", e.target.value)} /></Field>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field><FieldLabel>State (C5)</FieldLabel><Input value={form.ConsigneeState} onChange={e => updateForm("ConsigneeState", e.target.value)} /></Field>
                        <Field><FieldLabel>State Code (C6)</FieldLabel><StateCodeSelect value={form.ConsigneeStateCode} onChange={v => updateForm("ConsigneeStateCode", v)} /></Field>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("header")} size="lg">← Back: Header</Button>
                  <Button onClick={() => setActiveSection("lineitems")} size="lg">Next: Items →</Button>
                </div>
              </div>
            )}

            {/* SECTION: LINE ITEMS */}
            {activeSection === "lineitems" && (
              <div className="mx-4 lg:mx-6 space-y-4">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                    <CardTitle className="text-base">Line Items (G1-G17)</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      <IconPlus className="mr-1 h-3 w-3" /> Add Item
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {lineItems.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              <TableHead className="w-[180px]">Product (G1)</TableHead>
                              <TableHead>Description (G2)</TableHead>
                              <TableHead className="w-[80px]">HSN/SAC (G3)</TableHead>
                              <TableHead className="w-[60px]">UOM (G4)</TableHead>
                              <TableHead className="w-[60px]">Qty (G5)</TableHead>
                              <TableHead className="w-[80px]">Rate ₹ (G6)</TableHead>
                              <TableHead className="w-[60px]">Disc% (G8)</TableHead>
                              <TableHead className="w-[90px]">Taxable (G10)</TableHead>
                              {!isInterState ? (
                                <>
                                  <TableHead className="w-[65px]">CGST% (G11)</TableHead>
                                  <TableHead className="w-[65px]">SGST% (G13)</TableHead>
                                </>
                              ) : (
                                <TableHead className="w-[65px]">IGST% (G15)</TableHead>
                              )}
                              <TableHead className="w-[90px] text-right">Total ₹ (G17)</TableHead>
                              <TableHead className="w-[40px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lineItems.map((item, idx) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium text-xs">{idx + 1}.</TableCell>
                                <TableCell>
                                  <Select value={item.ProductName} onValueChange={v => selectProduct(item.id, v)}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      {products.map(p => <SelectItem key={p.ProductID} value={p.ProductName}>{p.ProductName}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input className="h-8 text-xs" value={item.Description} onChange={e => updateLineItem(item.id, "Description", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <Input className="h-8 text-xs" value={item.HSNACS} onChange={e => updateLineItem(item.id, "HSNACS", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <Input className="h-8 text-xs" value={item.UOM} onChange={e => updateLineItem(item.id, "UOM", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" className="h-8 text-xs" value={item.Qty} onChange={e => updateLineItem(item.id, "Qty", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" className="h-8 text-xs" value={item.Rate} onChange={e => updateLineItem(item.id, "Rate", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" className="h-8 text-xs" value={item.Discount} onChange={e => updateLineItem(item.id, "Discount", e.target.value)} />
                                </TableCell>
                                <TableCell className="text-right text-xs font-medium">{formatINR(item.TaxableValue)}</TableCell>
                                {!isInterState ? (
                                  <>
                                    <TableCell>
                                      <Input type="number" className="h-8 text-xs" value={item.CGSTRate} onChange={e => updateLineItem(item.id, "CGSTRate", e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                      <Input type="number" className="h-8 text-xs" value={item.SGSTRate} onChange={e => updateLineItem(item.id, "SGSTRate", e.target.value)} />
                                    </TableCell>
                                  </>
                                ) : (
                                  <TableCell>
                                    <Input type="number" className="h-8 text-xs" value={item.IGSTRate} onChange={e => updateLineItem(item.id, "IGSTRate", e.target.value)} />
                                  </TableCell>
                                )}
                                <TableCell className="text-right text-xs font-semibold">{formatINR(item.TotalAmount)}</TableCell>
                                <TableCell>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLineItem(item.id)}>
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No line items yet. Click &quot;Add Item&quot; to begin.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("receiver")} size="lg">← Back: Receiver</Button>
                  <Button onClick={() => setActiveSection("summary")} size="lg">Next: Summary →</Button>
                </div>
              </div>
            )}

            {/* SECTION: SUMMARY */}
            {activeSection === "summary" && (
              <div className="mx-4 lg:mx-6 space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Tax & Total Summary (F1-F14)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Amt Before Tax (F1):</span>
                      <span className="font-medium">{formatINR(totals.beforeTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Packing Charge (F2):</span>
                      <span>{formatINR(totals.packing)}</span>
                    </div>
                    {totals.pcCgst > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground pl-4">
                        <span>PC CGST (F4):</span><span>{formatINR(totals.pcCgst)}</span>
                      </div>
                    )}
                    {totals.pcSgst > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground pl-4">
                        <span>PC SGST:</span><span>{formatINR(totals.pcSgst)}</span>
                      </div>
                    )}
                    {totals.pcIgst > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground pl-4">
                        <span>PC IGST (F4):</span><span>{formatINR(totals.pcIgst)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t pt-1">
                      <span>CGST Total (F5):</span><span>{formatINR(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SGST Total (F6):</span><span>{formatINR(totals.sgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IGST Total (F7):</span><span>{formatINR(totals.igst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total GST Tax (F8):</span>
                      <span className="font-medium">{formatINR(totals.totalGST)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Amt After Tax (F10):</span>
                      <span>{formatINR(totals.afterTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Round Off (F11):</span>
                      <span>{totals.roundOff.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-xl font-bold">
                      <span>Grand Total (F12):</span>
                      <span>{formatINR(totals.grandTotal)}</span>
                    </div>
                    <div className="rounded bg-muted p-2 text-xs">
                      <span className="font-semibold">Total In Words (F13):</span> {totalInWords}
                    </div>
                    <div className="rounded bg-muted p-2 text-xs">
                      <span className="font-semibold">Tax In Words (F14):</span> {taxInWords}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("lineitems")} size="lg">← Back: Items</Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !form.PartyID || lineItems.length === 0}
                    size="lg"
                  >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {loading ? "Saving…" : "Save Invoice"}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
