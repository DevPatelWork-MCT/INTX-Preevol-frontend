"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { usePurchaseOrderApi } from "@/hooks/usePurchaseOrderApi"
import { useVendorApi } from "@/hooks/useVendorApi"
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
import { IconPlus, IconTrash, IconSearch } from "@tabler/icons-react"

export default function PurchaseOrderPage() {
  const { listPurchaseOrders, createPurchaseOrder, deletePurchaseOrder, loading } = usePurchaseOrderApi()
  const { listVendors } = useVendorApi()
  const { listProducts } = useProductApi()
  const [orders, setOrders] = React.useState<any[]>([])
  const [vendors, setVendors] = React.useState<any[]>([])
  const [products, setProducts] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [vendorId, setVendorId] = React.useState("")
  const [consignorName, setConsignorName] = React.useState("")
  const [consignorAddress, setConsignorAddress] = React.useState("")
  const [consignorGSTIN, setConsignorGSTIN] = React.useState("")
  const [consignorState, setConsignorState] = React.useState("")
  const [consignorStateCode, setConsignorStateCode] = React.useState("")
  const [deliverySchedule, setDeliverySchedule] = React.useState("")
  const [quotRef, setQuotRef] = React.useState("")
  const [paymentDays, setPaymentDays] = React.useState("")
  const [lineItems, setLineItems] = React.useState<any[]>([])

  const fetchData = React.useCallback(async () => {
    try {
      const [oRes, vRes, pRes] = await Promise.all([listPurchaseOrders(), listVendors(), listProducts()])
      setOrders(oRes?.data || [])
      setVendors(vRes?.data || [])
      setProducts(pRes?.data || [])
    } catch {}
  }, [listPurchaseOrders, listVendors, listProducts])

  React.useEffect(() => { fetchData() }, [fetchData])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(o =>
      (o.PO || "").toLowerCase().includes(q) ||
      (o.ConsignorName || "").toLowerCase().includes(q) ||
      String(o.PurchaseOrderID).includes(q)
    )
  }, [orders, search])

  const addLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), ProductName: "", Qty: 1, Rate: 0, Amount: 0, CGSTRate: 0, SGSTRate: 0, IGSTRate: 0, CGSTAmt: 0, SGSTAmt: 0, IGSTAmt: 0, TotalAmount: 0 }])
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      const qty = Number(updated.Qty) || 0
      const rate = Number(updated.Rate) || 0
      updated.Amount = qty * rate
      updated.CGSTAmt = (updated.Amount * Number(updated.CGSTRate)) / 100
      updated.SGSTAmt = (updated.Amount * Number(updated.SGSTRate)) / 100
      updated.IGSTAmt = (updated.Amount * Number(updated.IGSTRate)) / 100
      updated.TotalAmount = updated.Amount + updated.CGSTAmt + updated.SGSTAmt + updated.IGSTAmt
      return updated
    }))
  }

  const removeLineItem = (id: string) => setLineItems(lineItems.filter(i => i.id !== id))

  const totals = React.useMemo(() => {
    const beforeTax = lineItems.reduce((s, i) => s + i.Amount, 0)
    const cgst = lineItems.reduce((s, i) => s + i.CGSTAmt, 0)
    const sgst = lineItems.reduce((s, i) => s + i.SGSTAmt, 0)
    const igst = lineItems.reduce((s, i) => s + i.IGSTAmt, 0)
    return { beforeTax, cgst, sgst, igst, grandTotal: beforeTax + cgst + sgst + igst }
  }, [lineItems])

  const handleVendorChange = (id: string) => {
    setVendorId(id)
    const v = vendors.find(v => String(v.VendorID) === id)
    if (v) {
      setConsignorName(v.VendorName); setConsignorAddress(v.Address || "")
      setConsignorGSTIN(v.GSTIN || ""); setConsignorState(v.State || "")
      setConsignorStateCode(v.StateCode ? String(v.StateCode) : "")
    }
  }

  const handleSave = async () => {
    if (!vendorId || lineItems.length === 0) return
    try {
      await createPurchaseOrder({
        VendorID: Number(vendorId), ConsignorName: consignorName, ConsignorAddress: consignorAddress,
        ConsignorGSTIN: consignorGSTIN, ConsignorState: consignorState, ConsignorStateCode: consignorStateCode,
        DeliverySchedule: deliverySchedule, QuotRef: quotRef, PaymentDays: paymentDays,
        TotalAmtBeforeTax: totals.beforeTax, CGST: totals.cgst, SGST: totals.sgst, IGST: totals.igst,
        TotalGSTTax: totals.cgst + totals.sgst + totals.igst,
        TotalAmtAfterTax: totals.beforeTax + totals.cgst + totals.sgst + totals.igst,
        GrandTotalAmount: totals.grandTotal,
        lineItems: lineItems.map(i => ({ ProductName: i.ProductName, Qty: i.Qty, Rate: i.Rate, Amount: i.Amount, CGSTRate: i.CGSTRate, CGSTAmt: i.CGSTAmt, SGSTRate: i.SGSTRate, SGSTAmt: i.SGSTAmt, IGSTRate: i.IGSTRate, IGSTAmt: i.IGSTAmt, TotalAmount: i.TotalAmount })),
      })
      setDialogOpen(false); resetForm(); fetchData()
    } catch {}
  }

  const resetForm = () => {
    setVendorId(""); setConsignorName(""); setConsignorAddress(""); setConsignorGSTIN("")
    setConsignorState(""); setConsignorStateCode(""); setDeliverySchedule(""); setQuotRef("")
    setPaymentDays(""); setLineItems([])
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this purchase order?")) return
    try { await deletePurchaseOrder(String(id)); fetchData() } catch {}
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><IconPlus className="mr-2 h-4 w-4" /> New PO</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel>Vendor *</FieldLabel>
                  <Select value={vendorId} onValueChange={handleVendorChange}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>{vendors.map((v) => <SelectItem key={v.VendorID} value={String(v.VendorID)}>{v.VendorName}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold">Supplier Details</h3>
                  <Field><FieldLabel>Name</FieldLabel><Input value={consignorName} onChange={(e) => setConsignorName(e.target.value)} /></Field>
                  <Field><FieldLabel>Address</FieldLabel><Input value={consignorAddress} onChange={(e) => setConsignorAddress(e.target.value)} /></Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field><FieldLabel>GSTIN</FieldLabel><Input value={consignorGSTIN} onChange={(e) => setConsignorGSTIN(e.target.value)} /></Field>
                    <Field><FieldLabel>State</FieldLabel><Input value={consignorState} onChange={(e) => setConsignorState(e.target.value)} /></Field>
                    <Field><FieldLabel>State Code</FieldLabel><Input value={consignorStateCode} onChange={(e) => setConsignorStateCode(e.target.value)} /></Field>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field><FieldLabel>Delivery Schedule</FieldLabel><Input value={deliverySchedule} onChange={(e) => setDeliverySchedule(e.target.value)} /></Field>
                  <Field><FieldLabel>Quotation Ref</FieldLabel><Input value={quotRef} onChange={(e) => setQuotRef(e.target.value)} /></Field>
                  <Field><FieldLabel>Payment Days</FieldLabel><Input value={paymentDays} onChange={(e) => setPaymentDays(e.target.value)} /></Field>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Line Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}><IconPlus className="mr-1 h-3 w-3" /> Add</Button>
                  </div>
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-6 gap-2 items-end border-b pb-2">
                      <div className="col-span-2">
                        <FieldLabel>Product</FieldLabel>
                        <Select value={item.ProductName} onValueChange={(v) => updateLineItem(item.id, "ProductName", v)}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{products.map((p) => <SelectItem key={p.ProductID} value={p.ProductName}>{p.ProductName}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><FieldLabel>Qty</FieldLabel><Input type="number" className="h-8" value={item.Qty} onChange={(e) => updateLineItem(item.id, "Qty", e.target.value)} /></div>
                      <div><FieldLabel>Rate</FieldLabel><Input type="number" className="h-8" value={item.Rate} onChange={(e) => updateLineItem(item.id, "Rate", e.target.value)} /></div>
                      <div><FieldLabel>Total</FieldLabel><div className="h-8 flex items-center text-sm font-medium">{item.TotalAmount.toFixed(2)}</div></div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(item.id)}><IconTrash className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{totals.beforeTax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>CGST:</span><span>{totals.cgst.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>SGST:</span><span>{totals.sgst.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>IGST:</span><span>{totals.igst.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2 font-bold"><span>Grand Total:</span><span>{totals.grandTotal.toFixed(2)}</span></div>
                </div>
                <Button onClick={handleSave} disabled={loading || !vendorId || lineItems.length === 0}>Save PO</Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-xs">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search POs…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO ID</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No purchase orders found</TableCell></TableRow>
            ) : filtered.map((o) => (
              <TableRow key={o.PurchaseOrderID}>
                <TableCell>{o.PurchaseOrderID}</TableCell>
                <TableCell>{o.PO || "-"}</TableCell>
                <TableCell>{o.PODate ? new Date(o.PODate).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{o.ConsignorName || "-"}</TableCell>
                <TableCell className="text-right font-medium">{o.GrandTotalAmount ? Number(o.GrandTotalAmount).toFixed(2) : "-"}</TableCell>
                <TableCell><Button variant="destructive" size="sm" onClick={() => handleDelete(o.PurchaseOrderID)}><IconTrash className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedLayout>
  )
}
