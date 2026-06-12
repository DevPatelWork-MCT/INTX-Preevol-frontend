"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { usePartyApi } from "@/hooks/usePartyApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { IconSearch, IconDownload } from "@tabler/icons-react"

export default function SalesReportPage() {
  const { listInvoices } = useInvoiceApi()
  const { listParties } = usePartyApi()
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [parties, setParties] = React.useState<any[]>([])
  const [fromDate, setFromDate] = React.useState("")
  const [toDate, setToDate] = React.useState("")
  const [partyFilter, setPartyFilter] = React.useState("")

  const fetchData = React.useCallback(async () => {
    try {
      const [invRes, partyRes] = await Promise.all([listInvoices(), listParties()])
      setInvoices(invRes?.data || [])
      setParties(partyRes?.data || [])
    } catch {}
  }, [listInvoices, listParties])

  React.useEffect(() => { fetchData() }, [fetchData])

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(inv => {
      if (partyFilter && String(inv.PartyID) !== partyFilter) return false
      if (fromDate && inv.InvoiceDate && new Date(inv.InvoiceDate) < new Date(fromDate)) return false
      if (toDate && inv.InvoiceDate && new Date(inv.InvoiceDate) > new Date(toDate)) return false
      return true
    })
  }, [invoices, fromDate, toDate, partyFilter])

  const totalAmount = filteredInvoices.reduce((s, i) => s + Number(i.GrandTotalAmount || 0), 0)
  const totalTax = filteredInvoices.reduce((s, i) => s + Number(i.TotalGSTTax || 0), 0)

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Sales Report</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4">
        <Field>
          <FieldLabel>From Date</FieldLabel>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>To Date</FieldLabel>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>Party</FieldLabel>
          <Select value={partyFilter} onValueChange={setPartyFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All parties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All parties</SelectItem>
              {parties.map((p) => <SelectItem key={p.PartyID} value={String(p.PartyID)}>{p.PartyName}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Button onClick={fetchData}><IconSearch className="mr-2 h-4 w-4" /> Get Data</Button>
        <Button variant="outline" onClick={() => {
          const csv = filteredInvoices.map(i => `${i.InvoiceID},${i.InvoiceNo || ""},${i.InvoiceDate || ""},${i.ReceiverName || ""},${i.InvoiceType || ""},${i.GrandTotalAmount || 0}`).join("\n")
          const blob = new Blob([`ID,Invoice No,Date,Party,Type,Amount\n${csv}`], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a"); a.href = url; a.download = "sales-report.csv"; a.click()
        }}><IconDownload className="mr-2 h-4 w-4" /> Export</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-sm text-muted-foreground">Total Invoices</div>
          <div className="text-2xl font-bold">{filteredInvoices.length}</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-sm text-muted-foreground">Total Tax</div>
          <div className="text-2xl font-bold">{totalTax.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="text-2xl font-bold">{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Report Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Before Tax</TableHead>
            <TableHead className="text-right">CGST</TableHead>
            <TableHead className="text-right">SGST</TableHead>
            <TableHead className="text-right">IGST</TableHead>
            <TableHead className="text-right">Total Tax</TableHead>
            <TableHead className="text-right">Grand Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No invoices found for the selected filters</TableCell></TableRow>
          ) : filteredInvoices.map((inv) => (
            <TableRow key={inv.InvoiceID}>
              <TableCell>{inv.InvoiceNo || inv.InvoiceID}</TableCell>
              <TableCell>{inv.InvoiceDate ? new Date(inv.InvoiceDate).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{inv.ReceiverName || "-"}</TableCell>
              <TableCell>{inv.InvoiceType || "-"}</TableCell>
              <TableCell className="text-right">{inv.TotalAmtBeforeTax ? Number(inv.TotalAmtBeforeTax).toFixed(2) : "-"}</TableCell>
              <TableCell className="text-right">{inv.CGST ? Number(inv.CGST).toFixed(2) : "-"}</TableCell>
              <TableCell className="text-right">{inv.SGST ? Number(inv.SGST).toFixed(2) : "-"}</TableCell>
              <TableCell className="text-right">{inv.IGST ? Number(inv.IGST).toFixed(2) : "-"}</TableCell>
              <TableCell className="text-right">{inv.TotalGSTTax ? Number(inv.TotalGSTTax).toFixed(2) : "-"}</TableCell>
              <TableCell className="text-right font-medium">{inv.GrandTotalAmount ? Number(inv.GrandTotalAmount).toFixed(2) : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </ProtectedLayout>
  )
}
