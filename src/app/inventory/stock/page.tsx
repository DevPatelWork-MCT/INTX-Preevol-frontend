"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useGoodsApi } from "@/hooks/useGoodsApi"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus } from "@tabler/icons-react"

export default function StockPage() {
  const { listGoods, listInventory, createInventory, loading } = useGoodsApi()
  const [goods, setGoods] = React.useState<any[]>([])
  const [inventory, setInventory] = React.useState<any[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ GoodsID: "", InventoryType: "Receipt", Qty: "", PricePerUnit: "", PartyName: "", Remarks: "" })

  const fetchData = React.useCallback(async () => {
    try {
      const [gRes, iRes] = await Promise.all([listGoods(), listInventory()])
      setGoods(gRes?.data || [])
      setInventory(iRes?.data || [])
    } catch {}
  }, [listGoods, listInventory])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!form.GoodsID || !form.Qty) return
    try {
      const qty = Number(form.Qty)
      const price = Number(form.PricePerUnit) || 0
      await createInventory({
        GoodsID: Number(form.GoodsID),
        InventoryType: form.InventoryType,
        Qty: form.InventoryType === "Issue" ? -qty : qty,
        PricePerUnit: price,
        TotalPrice: qty * price,
        PartyName: form.PartyName,
        Remarks: form.Remarks,
        InvDate: new Date(),
      })
      setDialogOpen(false)
      setForm({ GoodsID: "", InventoryType: "Receipt", Qty: "", PricePerUnit: "", PartyName: "", Remarks: "" })
      fetchData()
    } catch {}
  }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><IconPlus className="mr-2 h-4 w-4" /> Record Movement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Stock Movement</DialogTitle></DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Goods *</FieldLabel>
                <Select value={form.GoodsID} onValueChange={(v) => setForm({ ...form, GoodsID: v })}>
                  <SelectTrigger><SelectValue placeholder="Select goods" /></SelectTrigger>
                  <SelectContent>{goods.map((g) => <SelectItem key={g.GoodsID} value={String(g.GoodsID)}>{g.GoodsName}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={form.InventoryType} onValueChange={(v) => setForm({ ...form, InventoryType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Receipt">Receipt (In)</SelectItem><SelectItem value="Issue">Issue (Out)</SelectItem></SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field><FieldLabel>Quantity *</FieldLabel><Input type="number" value={form.Qty} onChange={(e) => setForm({ ...form, Qty: e.target.value })} /></Field>
                <Field><FieldLabel>Price/Unit</FieldLabel><Input type="number" value={form.PricePerUnit} onChange={(e) => setForm({ ...form, PricePerUnit: e.target.value })} /></Field>
              </div>
              <Field><FieldLabel>Party Name</FieldLabel><Input value={form.PartyName} onChange={(e) => setForm({ ...form, PartyName: e.target.value })} /></Field>
              <Field><FieldLabel>Remarks</FieldLabel><Input value={form.Remarks} onChange={(e) => setForm({ ...form, Remarks: e.target.value })} /></Field>
              <Button onClick={handleSave} disabled={loading || !form.GoodsID || !form.Qty}>Save</Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Goods</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price/Unit</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No stock movements recorded</TableCell></TableRow>
          ) : inventory.map((inv) => (
            <TableRow key={inv.InventoryID}>
              <TableCell>{inv.InvDate ? new Date(inv.InvDate).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{goods.find(g => g.GoodsID === inv.GoodsID)?.GoodsName || inv.GoodsID}</TableCell>
              <TableCell>
                <span className={Number(inv.Qty) >= 0 ? "text-green-600" : "text-red-600"}>
                  {Number(inv.Qty) >= 0 ? "Receipt" : "Issue"}
                </span>
              </TableCell>
              <TableCell className="text-right">{inv.Qty}</TableCell>
              <TableCell className="text-right">{inv.PricePerUnit || "-"}</TableCell>
              <TableCell>{inv.PartyName || "-"}</TableCell>
              <TableCell>{inv.Remarks || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </ProtectedLayout>
  )
}
