"use client"

import * as React from "react"
import Link from "next/link"
import { ProtectedLayout } from "@/components/protected-layout"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  IconPlus, IconTrash, IconEye, IconPrinter, IconDownload,
  IconFileInvoice, IconSearch, IconTrendingUp, IconReceipt,
  IconBuilding, IconCalendarCheck, IconCoinRupee,
} from "@tabler/icons-react"
import { formatINR } from "@/lib/currency"

/* ================================================================== */
/*  FINANCIAL YEAR HELPER                                              */
/* ================================================================== */
function getCurrentFinancialYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-based
  // FY starts April 1
  if (month >= 3) {
    return { start: new Date(year, 3, 1), end: new Date(year + 1, 2, 31), label: `${year}-${year + 1}` }
  }
  return { start: new Date(year - 1, 3, 1), end: new Date(year, 2, 31), label: `${year - 1}-${year}` }
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function SalesInvoicePage() {
  const { listInvoices, getInvoice, deleteInvoice, loading } = useInvoiceApi()

  const [invoices, setInvoices] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [viewingInvoice, setViewingInvoice] = React.useState<any>(null)

  const fy = React.useMemo(() => getCurrentFinancialYear(), [])

  React.useEffect(() => {
    let cancelled = false
    listInvoices().then(res => {
      if (!cancelled) setInvoices(res?.data || [])
    }).catch(() => {})
    return () => { cancelled = true }
  }, [listInvoices])

  // Filter by search term
  const filtered = React.useMemo(() => {
    if (!search.trim()) return invoices
    const q = search.toLowerCase()
    return invoices.filter(inv =>
      (inv.InvoiceNo || "").toLowerCase().includes(q) ||
      (inv.ReceiverName || "").toLowerCase().includes(q) ||
      (inv.ReceiverGSTIN || "").toLowerCase().includes(q) ||
      (inv.InvoiceType || "").toLowerCase().includes(q)
    )
  }, [invoices, search])

  // FY-filtered invoices for KPIs
  const fyInvoices = React.useMemo(() => {
    return invoices.filter(inv => {
      if (!inv.InvoiceDate) return false
      const d = new Date(inv.InvoiceDate)
      return d >= fy.start && d <= fy.end
    })
  }, [invoices, fy])

  // KPI calculations
  const kpis = React.useMemo(() => {
    const totalInvoices = fyInvoices.length
    const totalRevenue = fyInvoices.reduce((s, i) => s + Number(i.GrandTotalAmount || 0), 0)
    const totalTax = fyInvoices.reduce((s, i) => s + Number(i.TotalGSTTax || 0), 0)
    const totalBeforeTax = fyInvoices.reduce((s, i) => s + Number(i.TotalAmtBeforeTax || 0), 0)
    const totalCGST = fyInvoices.reduce((s, i) => s + Number(i.CGST || 0), 0)
    const totalSGST = fyInvoices.reduce((s, i) => s + Number(i.SGST || 0), 0)
    const totalIGST = fyInvoices.reduce((s, i) => s + Number(i.IGST || 0), 0)
    const eInvoices = fyInvoices.filter(i => i.IRNNo).length
    const uniqueParties = new Set(fyInvoices.map(i => i.ReceiverName).filter(Boolean)).size
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
    return { totalInvoices, totalRevenue, totalTax, totalBeforeTax, totalCGST, totalSGST, totalIGST, eInvoices, uniqueParties, avgInvoiceValue }
  }, [fyInvoices])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this invoice?")) return
    try {
      await deleteInvoice(String(id))
      const res = await listInvoices()
      setInvoices(res?.data || [])
    } catch { /* silent */ }
  }

  const handleView = async (id: number) => {
    try {
      const res = await getInvoice(String(id))
      setViewingInvoice(res?.data || null)
      setViewDialogOpen(true)
    } catch { /* silent */ }
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
                    <IconFileInvoice className="h-5 w-5" /> Invoices
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    GST-compliant invoice management — FY {fy.label}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/sales/invoice/create">
                    <IconPlus className="mr-2 h-4 w-4" /> New Invoice
                  </Link>
                </Button>
              </CardHeader>
            </Card>

            {/* KPI Cards */}
            <div className="mx-4 lg:mx-6">
              <div className="grid grid-cols-1 gap-4 @sm/main:grid-cols-2 @xl/main:grid-cols-3 @3xl/main:grid-cols-4 @5xl/main:grid-cols-5">
                {/* Total Revenue */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1"><IconCoinRupee className="h-3.5 w-3.5" /> Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{formatINR(kpis.totalRevenue)}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Badge variant="outline" className="gap-1"><IconTrendingUp className="h-3 w-3" />FY {fy.label}</Badge>
                  </CardFooter>
                </Card>

                {/* Total Invoices */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1"><IconReceipt className="h-3.5 w-3.5" /> Total Invoices</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{kpis.totalInvoices}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Badge variant="outline" className="gap-1"><IconCalendarCheck className="h-3 w-3" />{kpis.eInvoices} e-Invoiced</Badge>
                  </CardFooter>
                </Card>

                {/* Total Tax */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1"><IconFileInvoice className="h-3.5 w-3.5" /> Total Tax (GST)</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{formatINR(kpis.totalTax)}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    CGST: {formatINR(kpis.totalCGST)} · SGST: {formatINR(kpis.totalSGST)} · IGST: {formatINR(kpis.totalIGST)}
                  </CardFooter>
                </Card>

                {/* Unique Parties */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1"><IconBuilding className="h-3.5 w-3.5" /> Active Parties</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{kpis.uniqueParties}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    Unique customers billed in FY {fy.label}
                  </CardFooter>
                </Card>

                {/* Avg Invoice Value */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1"><IconTrendingUp className="h-3.5 w-3.5" /> Avg Invoice Value</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{formatINR(kpis.avgInvoiceValue)}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    Before tax: {formatINR(kpis.totalBeforeTax)}
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="mx-4 lg:mx-6">
                <p className="text-muted-foreground text-sm">Loading invoices…</p>
              </div>
            )}

            {/* Data table */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <div className="relative w-full sm:max-w-xs">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by no, party, GSTIN…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{filtered.length} invoice(s)</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>Consignee</TableHead>
                        <TableHead>Challan</TableHead>
                        <TableHead>PO</TableHead>
                        <TableHead>ARN</TableHead>
                        <TableHead>Transport</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Before Tax</TableHead>
                        <TableHead className="text-right">CGST</TableHead>
                        <TableHead className="text-right">SGST</TableHead>
                        <TableHead className="text-right">IGST</TableHead>
                        <TableHead className="text-right">Packing</TableHead>
                        <TableHead className="text-right">Total Tax</TableHead>
                        <TableHead className="text-right">Grand Total</TableHead>
                        <TableHead>IRN</TableHead>
                        <TableHead>EWB</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[130px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={24} className="text-center text-muted-foreground py-8">
                            {loading ? "Loading…" : "No invoices found. Create your first invoice."}
                          </TableCell>
                        </TableRow>
                      ) : filtered.map((inv) => (
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
                          <TableCell>
                            {inv.IRNNo ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">E-Invoice</span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Draft</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(inv.InvoiceID)} title="View">
                                <IconEye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Print">
                                <IconPrinter className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Export PDF">
                                <IconDownload className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(inv.InvoiceID)} title="Delete">
                                <IconTrash className="h-3.5 w-3.5" />
                              </Button>
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
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details — {viewingInvoice?.InvoiceNo || ""}</DialogTitle>
          </DialogHeader>
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
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead><TableHead>Product</TableHead><TableHead>HSN</TableHead>
                        <TableHead>UOM</TableHead><TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Disc</TableHead>
                        <TableHead className="text-right">Taxable</TableHead><TableHead className="text-right">CGST</TableHead>
                        <TableHead className="text-right">SGST</TableHead><TableHead className="text-right">IGST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
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
                <div className="flex justify-between border-t pt-1 font-bold text-base">
                  <span>Grand Total:</span><span>{formatINR(viewingInvoice.GrandTotalAmount)}</span>
                </div>
                {viewingInvoice.TotalInWords && (
                  <div className="text-xs text-muted-foreground pt-1"><strong>In Words:</strong> {viewingInvoice.TotalInWords}</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}
