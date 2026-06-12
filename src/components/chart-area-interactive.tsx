"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useInvoiceApi } from "@/hooks/useInvoiceApi"
import { formatINRShort } from "@/lib/currency"

export const description = "An interactive area chart"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
  purchase: {
    label: "Purchase",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const { listInvoices } = useInvoiceApi()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<{ date: string; sales: number; purchase: number }[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await listInvoices()
        const invoices = res?.data || []

        // Group invoices by date
        const dailyTotals: Record<string, { sales: number; purchase: number }> = {}
        const now = new Date()
        const daysBack = 90

        // Initialize last 90 days with zeros
        for (let i = daysBack; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split("T")[0]
          dailyTotals[key] = { sales: 0, purchase: 0 }
        }

        // Aggregate invoice amounts by date
        for (const inv of invoices) {
          if (!inv.InvoiceDate) continue
          const dateKey = new Date(inv.InvoiceDate).toISOString().split("T")[0]
          const amount = Number(inv.GrandTotalAmount || 0)
          if (dailyTotals[dateKey]) {
            if (inv.InvoiceType === "Purchase Order" || inv.InvoiceType === "Purchase") {
              dailyTotals[dateKey].purchase += amount
            } else {
              dailyTotals[dateKey].sales += amount
            }
          }
        }

        const data = Object.entries(dailyTotals)
          .map(([date, totals]) => ({ date, ...totals }))
          .sort((a, b) => a.date.localeCompare(b.date))

        setChartData(data)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    fetchChartData()
  }, [listInvoices])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Invoice revenue over time
          </span>
          <span className="@[540px]/card:hidden">Revenue trend</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Loading chart data…
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-purchase)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-purchase)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    formatter={(value: number, name: string) => (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{name === "sales" ? "Sales" : "Purchase"}</span>
                        <span className="font-semibold">{formatINRShort(value)}</span>
                      </div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="sales" type="natural" fill="url(#fillSales)" stroke="var(--color-sales)" stackId="a" />
              <Area dataKey="purchase" type="natural" fill="url(#fillPurchase)" stroke="var(--color-purchase)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
