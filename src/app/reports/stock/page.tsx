"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useGoodsApi } from "@/hooks/useGoodsApi"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { IconDownload } from "@tabler/icons-react"

export default function StockReportPage() {
  const { listGoods } = useGoodsApi()
  const [goods, setGoods] = React.useState<any[]>([])

  const fetchGoods = React.useCallback(async () => {
    try { const res = await listGoods(); setGoods(res?.data || []) } catch {}
  }, [listGoods])

  React.useEffect(() => { fetchGoods() }, [fetchGoods])

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Report</h1>
        <Button variant="outline" onClick={() => {
          const csv = goods.map(g => `${g.GoodsID},${g.GoodsName || ""},${g.UOM || ""},${g.OpeningQTY || 0},${g.ClosingQTY || 0},${g.AvgPricePerUnit || 0},${g.ClosingStockVal || 0}`).join("\n")
          const blob = new Blob([`ID,Name,UOM,Opening Qty,Closing Qty,Price/Unit,Stock Value\n${csv}`], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a"); a.href = url; a.download = "stock-report.csv"; a.click()
        }}><IconDownload className="mr-2 h-4 w-4" /> Export</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Goods Name</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead className="text-right">Opening Qty</TableHead>
            <TableHead className="text-right">Closing Qty</TableHead>
            <TableHead className="text-right">Price/Unit</TableHead>
            <TableHead className="text-right">Stock Value</TableHead>
            <TableHead className="text-right">Reorder Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goods.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No goods found</TableCell></TableRow>
          ) : goods.map((g) => (
            <TableRow key={g.GoodsID}>
              <TableCell>{g.GoodsID}</TableCell>
              <TableCell>{g.GoodsName}</TableCell>
              <TableCell>{g.UOM || "-"}</TableCell>
              <TableCell className="text-right">{g.OpeningQTY || 0}</TableCell>
              <TableCell className="text-right">{g.ClosingQTY || 0}</TableCell>
              <TableCell className="text-right">{g.AvgPricePerUnit || "-"}</TableCell>
              <TableCell className="text-right">{g.ClosingStockVal || "-"}</TableCell>
              <TableCell className="text-right">{g.ReOrderLevel || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </ProtectedLayout>
  )
}
