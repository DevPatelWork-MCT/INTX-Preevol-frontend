"use client"

import * as React from "react"
import Link from "next/link"
import { ProtectedLayout } from "@/components/protected-layout"
import { useQuotationApi } from "@/hooks/useQuotationApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  IconPlus, IconTrash, IconEye, IconPrinter, IconDownload,
  IconFileInvoice, IconSearch,
} from "@tabler/icons-react"
import { formatINR } from "@/lib/currency"

export default function QuotationPage() {
  const { listQuotations, getQuotation, deleteQuotation, loading } = useQuotationApi()

  const [quotations, setQuotations] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [viewingQuotation, setViewingQuotation] = React.useState<any>(null)

  const fetchData = React.useCallback(async () => {
    try {
      const res = await listQuotations()
      setQuotations(res?.data || [])
    } catch { /* silent */ }
  }, [listQuotations])

  React.useEffect(() => { fetchData() }, [fetchData])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return quotations
    const q = search.toLowerCase()
    return quotations.filter((item: any) =>
      (item.QuotationNo || "").toLowerCase().includes(q) ||
      (item.ReceiverName || "").toLowerCase().includes(q) ||
      (item.ReceiverGSTIN || "").toLowerCase().includes(q)
    )
  }, [quotations, search])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this quotation?")) return
    try { await deleteQuotation(String(id)); fetchData() } catch { /* silent */ }
  }

  const handleView = async (id: number) => {
    try {
      const res = await getQuotation(String(id))
      setViewingQuotation(res?.data || null)
      setViewDialogOpen(true)
    } catch { /* silent */ }
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <IconFileInvoice className="h-5 w-5" /> Quotations
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create and manage customer quotations
                  </p>
                </div>
                <Button asChild>
                  <Link href="/quotation/create">
                    <IconPlus className="mr-2 h-4 w-4" /> New Quotation
                  </Link>
                </Button>
              </CardHeader>
            </Card>

            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <div className="relative w-full sm:max-w-xs">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quotations…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{filtered.length} quotation(s)</p>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead>Quotation No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>GSTIN</TableHead>
                          <TableHead className="text-right">Grand Total</TableHead>
                          <TableHead className="w-[130px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No quotations found. Create your first quotation.
                            </TableCell>
                          </TableRow>
                        ) : filtered.map((q: any) => (
                          <TableRow key={q.QuotationID}>
                            <TableCell className="font-medium">{q.QuotationID}</TableCell>
                            <TableCell className="font-semibold">{q.QuotationNo || "-"}</TableCell>
                            <TableCell>{q.QuotationDate ? new Date(q.QuotationDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell>{q.ValidUntil ? new Date(q.ValidUntil).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell>{q.ReceiverName || "-"}</TableCell>
                            <TableCell className="text-xs">{q.ReceiverGSTIN || "-"}</TableCell>
                            <TableCell className="text-right font-semibold">{formatINR(q.GrandTotalAmount)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(q.QuotationID)} title="View"><IconEye className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Print"><IconPrinter className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Export PDF"><IconDownload className="h-3.5 w-3.5" /></Button>
                                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(q.QuotationID)} title="Delete"><IconTrash className="h-3.5 w-3.5" /></Button>
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Details — {viewingQuotation?.QuotationNo || ""}</DialogTitle>
          </DialogHeader>
          {viewingQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Quotation No:</span> <span className="font-medium">{viewingQuotation.QuotationNo || "-"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewingQuotation.QuotationDate ? new Date(viewingQuotation.QuotationDate).toLocaleDateString("en-IN") : "-"}</span></div>
                <div><span className="text-muted-foreground">Valid Until:</span> <span className="font-medium">{viewingQuotation.ValidUntil ? new Date(viewingQuotation.ValidUntil).toLocaleDateString("en-IN") : "-"}</span></div>
                <div><span className="text-muted-foreground">Party:</span> {viewingQuotation.ReceiverName || "-"}</div>
                <div><span className="text-muted-foreground">GSTIN:</span> {viewingQuotation.ReceiverGSTIN || "-"}</div>
                <div><span className="text-muted-foreground">State:</span> {viewingQuotation.ReceiverState || "-"} ({viewingQuotation.ReceiverStateCode || "-"})</div>
                <div><span className="text-muted-foreground">Transport:</span> {viewingQuotation.TransportationMode || "-"}</div>
                <div><span className="text-muted-foreground">Distance:</span> {viewingQuotation.Distance || "-"} km</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {viewingQuotation.VehicleNo || "-"}</div>
              </div>
              {viewingQuotation.lineItems && viewingQuotation.lineItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Line Items</h4>
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
                      {viewingQuotation.lineItems.map((li: any, idx: number) => (
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
                <div className="flex justify-between"><span>Before Tax:</span><span>{formatINR(viewingQuotation.TotalAmtBeforeTax)}</span></div>
                <div className="flex justify-between"><span>Packing:</span><span>{formatINR(viewingQuotation.PackingCharge)}</span></div>
                <div className="flex justify-between"><span>CGST:</span><span>{formatINR(viewingQuotation.CGST)}</span></div>
                <div className="flex justify-between"><span>SGST:</span><span>{formatINR(viewingQuotation.SGST)}</span></div>
                <div className="flex justify-between"><span>IGST:</span><span>{formatINR(viewingQuotation.IGST)}</span></div>
                <div className="flex justify-between"><span>Total Tax:</span><span>{formatINR(viewingQuotation.TotalGSTTax)}</span></div>
                <div className="flex justify-between border-t pt-1 font-bold text-base"><span>Grand Total:</span><span>{formatINR(viewingQuotation.GrandTotalAmount)}</span></div>
                {viewingQuotation.TotalInWords && <div className="text-xs text-muted-foreground pt-1"><strong>In Words:</strong> {viewingQuotation.TotalInWords}</div>}
              </div>
              {viewingQuotation.Remarks && (
                <div className="rounded bg-muted p-2 text-xs"><span className="font-semibold">Remarks:</span> {viewingQuotation.Remarks}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}
