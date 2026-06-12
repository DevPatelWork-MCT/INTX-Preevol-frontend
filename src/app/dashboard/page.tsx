"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { CompanySwitcher } from "@/components/company-switcher"
import { useCompany } from "@/contexts/company-context"
import { useUser } from "@/contexts/user-context"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { usePurchaseOrderApi } from "@/hooks/usePurchaseOrderApi"
import { formatINR } from "@/lib/currency"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { IconArrowRight } from "@tabler/icons-react"

function RecentInvoices() {
  const { listInvoices } = useInvoiceApi()
  const [invoices, setInvoices] = React.useState<any[]>([])

  React.useEffect(() => {
    listInvoices().then((res) => {
      setInvoices((res?.data || []).slice(0, 5))
    }).catch(() => {})
  }, [listInvoices])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Invoices</CardTitle>
        <a href="/sales/invoice" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <IconArrowRight className="h-3 w-3" /></a>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Party</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No invoices yet</TableCell></TableRow>
            ) : invoices.map((inv: any) => (
              <TableRow key={inv.InvoiceID}>
                <TableCell className="font-medium">{inv.InvoiceNo || `#${inv.InvoiceID}`}</TableCell>
                <TableCell>{inv.ReceiverName || "-"}</TableCell>
                <TableCell>{inv.InvoiceType || "-"}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(inv.GrandTotalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentPOs() {
  const { listPurchaseOrders } = usePurchaseOrderApi()
  const [pos, setPos] = React.useState<any[]>([])

  React.useEffect(() => {
    listPurchaseOrders().then((res) => {
      setPos((res?.data || []).slice(0, 5))
    }).catch(() => {})
  }, [listPurchaseOrders])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
        <a href="/purchase/orders" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <IconArrowRight className="h-3 w-3" /></a>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>PO Number</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            {pos.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No purchase orders yet</TableCell></TableRow>
            ) : pos.map((p: any) => (
              <TableRow key={p.PurchaseOrderID}>
                <TableCell className="font-medium">{p.PO || `#${p.PurchaseOrderID}`}</TableCell>
                <TableCell>{p.ConsignorName || "-"}</TableCell>
                <TableCell>{p.PODate ? new Date(p.PODate).toLocaleDateString("en-IN") : "-"}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(p.GrandTotalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DashboardContent() {
  const { selectedCompany } = useCompany()
  const { user } = useUser()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{selectedCompany?.Name || "Dashboard"}</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.firstName || "User"} — Here&apos;s your business overview</p>
            </div>
            <CompanySwitcher />
          </div>
          <div className="px-4 lg:px-6"><SectionCards /></div>
          <div className="px-4 lg:px-6"><ChartAreaInteractive /></div>
          <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecentInvoices />
            <RecentPOs />
          </div>
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/sales/invoice" className="rounded-lg border p-4 hover:bg-accent transition-colors"><h3 className="font-semibold">New Invoice</h3><p className="text-sm text-muted-foreground">Create a sales invoice</p></a>
              <a href="/purchase/orders" className="rounded-lg border p-4 hover:bg-accent transition-colors"><h3 className="font-semibold">Purchase Order</h3><p className="text-sm text-muted-foreground">Create a new PO</p></a>
              <a href="/inventory/stock" className="rounded-lg border p-4 hover:bg-accent transition-colors"><h3 className="font-semibold">Stock Entry</h3><p className="text-sm text-muted-foreground">Record stock movement</p></a>
              <a href="/reports/sales" className="rounded-lg border p-4 hover:bg-accent transition-colors"><h3 className="font-semibold">Sales Report</h3><p className="text-sm text-muted-foreground">View sales analytics</p></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  )
}