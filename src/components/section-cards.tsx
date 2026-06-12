"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconTrendingUp, IconReceipt, IconShoppingCart, IconUsers, IconBox } from "@tabler/icons-react"
import { formatINR, formatINRShort } from "@/lib/currency"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { usePartyApi } from "@/hooks/usePartyApi"
import { usePurchaseOrderApi } from "@/hooks/usePurchaseOrderApi"
import { useGoodsApi } from "@/hooks/useGoodsApi"

export function SectionCards() {
  const { listInvoices } = useInvoiceApi()
  const { listParties } = usePartyApi()
  const { listPurchaseOrders } = usePurchaseOrderApi()
  const { listGoods } = useGoodsApi()

  const [totalRevenue, setTotalRevenue] = React.useState(0)
  const [invoiceCount, setInvoiceCount] = React.useState(0)
  const [partyCount, setPartyCount] = React.useState(0)
  const [poCount, setPoCount] = React.useState(0)
  const [stockValue, setStockValue] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [invRes, partyRes, poRes, goodsRes] = await Promise.all([
          listInvoices(),
          listParties(),
          listPurchaseOrders(),
          listGoods(),
        ])
        const invoices = invRes?.data || []
        const parties = partyRes?.data || []
        const pos = poRes?.data || []
        const goods = goodsRes?.data || []
        const revenue = invoices.reduce((sum: number, inv: any) => sum + Number(inv.GrandTotalAmount || 0), 0)
        const stockVal = goods.reduce((sum: number, g: any) => sum + Number(g.ClosingStockVal || 0), 0)
        setTotalRevenue(revenue)
        setInvoiceCount(invoices.length)
        setPartyCount(parties.length)
        setPoCount(pos.length)
        setStockValue(stockVal)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    fetchData()
  }, [listInvoices, listParties, listPurchaseOrders, listGoods])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-4 w-24 bg-muted rounded" /><div className="h-8 w-32 bg-muted rounded mt-2" /></CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatINRShort(totalRevenue)}</CardTitle>
          <CardAction><Badge variant="outline"><IconTrendingUp />{invoiceCount} invoices</Badge></CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium"><IconReceipt className="size-4" />{formatINR(totalRevenue)} total billed</div>
          <div className="text-muted-foreground">From {invoiceCount} sales invoices</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{partyCount}</CardTitle>
          <CardAction><Badge variant="outline"><IconTrendingUp />Active</Badge></CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium"><IconUsers className="size-4" />Registered parties</div>
          <div className="text-muted-foreground">Customer &amp; vendor masters</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Purchase Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{poCount}</CardTitle>
          <CardAction><Badge variant="outline"><IconShoppingCart />Orders</Badge></CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium"><IconShoppingCart className="size-4" />Active POs</div>
          <div className="text-muted-foreground">Purchase orders with vendors</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Stock Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatINRShort(stockValue)}</CardTitle>
          <CardAction><Badge variant="outline"><IconBox />Inventory</Badge></CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium"><IconBox className="size-4" />{formatINR(stockValue)} total value</div>
          <div className="text-muted-foreground">Current inventory valuation</div>
        </CardFooter>
      </Card>
    </div>
  )
}
