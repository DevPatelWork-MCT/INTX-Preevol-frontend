"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useGoodsApi } from "@/hooks/useGoodsApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react"

export default function GoodsPage() {
  const { listGoods, createGood, updateGood, deleteGood, loading } = useGoodsApi()
  const [goods, setGoods] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState({
    GoodsName: "", Description: "", UOM: "", HSN: "", GSTRate: "",
    AvgPricePerUnit: "", OpeningQTY: "", ReOrderLevel: "", FullGoodsName: "",
  })

  const fetchGoods = React.useCallback(async () => {
    try { const res = await listGoods(); setGoods(res?.data || []) } catch {}
  }, [listGoods])

  React.useEffect(() => { fetchGoods() }, [fetchGoods])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return goods
    const q = search.toLowerCase()
    return goods.filter(g =>
      (g.GoodsName || "").toLowerCase().includes(q) ||
      (g.Description || "").toLowerCase().includes(q) ||
      (g.UOM || "").toLowerCase().includes(q) ||
      (g.HSN || "").toLowerCase().includes(q) ||
      String(g.GoodsID).includes(q)
    )
  }, [goods, search])

  const handleSave = async () => {
    if (!form.GoodsName.trim()) return
    try {
      const payload = { ...form, GSTRate: form.GSTRate ? Number(form.GSTRate) : null, AvgPricePerUnit: form.AvgPricePerUnit ? Number(form.AvgPricePerUnit) : null, OpeningQTY: form.OpeningQTY ? Number(form.OpeningQTY) : null, ReOrderLevel: form.ReOrderLevel ? Number(form.ReOrderLevel) : null }
      if (editingId) { await updateGood(String(editingId), payload) } else { await createGood(payload) }
      setDialogOpen(false); resetForm(); fetchGoods()
    } catch {}
  }

  const resetForm = () => {
    setForm({ GoodsName: "", Description: "", UOM: "", HSN: "", GSTRate: "", AvgPricePerUnit: "", OpeningQTY: "", ReOrderLevel: "", FullGoodsName: "" })
    setEditingId(null)
  }

  const handleEdit = (g: any) => {
    setEditingId(g.GoodsID)
    setForm({ GoodsName: g.GoodsName || "", Description: g.Description || "", UOM: g.UOM || "", HSN: g.HSN || "", GSTRate: g.GSTRate ? String(g.GSTRate) : "", AvgPricePerUnit: g.AvgPricePerUnit ? String(g.AvgPricePerUnit) : "", OpeningQTY: g.OpeningQTY ? String(g.OpeningQTY) : "", ReOrderLevel: g.ReOrderLevel ? String(g.ReOrderLevel) : "", FullGoodsName: g.FullGoodsName || "" })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this goods item?")) return
    try { await deleteGood(String(id)); fetchGoods() } catch {}
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Goods / Inventory</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><IconPlus className="mr-2 h-4 w-4" /> Add Goods</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Goods</DialogTitle></DialogHeader>
              <FieldGroup>
                <Field><FieldLabel>Goods Name *</FieldLabel><Input value={form.GoodsName} onChange={(e) => setForm({ ...form, GoodsName: e.target.value })} /></Field>
                <Field><FieldLabel>Description</FieldLabel><Input value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} /></Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field><FieldLabel>UOM</FieldLabel><Input value={form.UOM} onChange={(e) => setForm({ ...form, UOM: e.target.value })} /></Field>
                  <Field><FieldLabel>HSN</FieldLabel><Input value={form.HSN} onChange={(e) => setForm({ ...form, HSN: e.target.value })} /></Field>
                  <Field><FieldLabel>GST Rate (%)</FieldLabel><Input type="number" value={form.GSTRate} onChange={(e) => setForm({ ...form, GSTRate: e.target.value })} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field><FieldLabel>Avg Price/Unit</FieldLabel><Input type="number" value={form.AvgPricePerUnit} onChange={(e) => setForm({ ...form, AvgPricePerUnit: e.target.value })} /></Field>
                  <Field><FieldLabel>Opening Qty</FieldLabel><Input type="number" value={form.OpeningQTY} onChange={(e) => setForm({ ...form, OpeningQTY: e.target.value })} /></Field>
                  <Field><FieldLabel>Reorder Level</FieldLabel><Input type="number" value={form.ReOrderLevel} onChange={(e) => setForm({ ...form, ReOrderLevel: e.target.value })} /></Field>
                </div>
                <Field><FieldLabel>Full Goods Name</FieldLabel><Input value={form.FullGoodsName} onChange={(e) => setForm({ ...form, FullGoodsName: e.target.value })} /></Field>
                <Button onClick={handleSave} disabled={loading || !form.GoodsName.trim()}>{editingId ? "Update" : "Save"}</Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-xs">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search goods…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Goods Name</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead>GST Rate</TableHead>
              <TableHead>Price/Unit</TableHead>
              <TableHead>Opening Qty</TableHead>
              <TableHead>Closing Qty</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No goods found</TableCell></TableRow>
            ) : filtered.map((g) => (
              <TableRow key={g.GoodsID}>
                <TableCell>{g.GoodsID}</TableCell>
                <TableCell>{g.GoodsName}</TableCell>
                <TableCell>{g.UOM || "-"}</TableCell>
                <TableCell>{g.HSN || "-"}</TableCell>
                <TableCell>{g.GSTRate || "-"}</TableCell>
                <TableCell>{g.AvgPricePerUnit || "-"}</TableCell>
                <TableCell>{g.OpeningQTY || "-"}</TableCell>
                <TableCell>{g.ClosingQTY || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(g)}><IconEdit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(g.GoodsID)}><IconTrash className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedLayout>
  )
}
