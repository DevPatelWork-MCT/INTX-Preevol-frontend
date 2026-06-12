"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { apiRequest } from "@/lib/apiClient"
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react"

export default function ModelPage() {
  const [models, setModels] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [formName, setFormName] = React.useState("")

  const fetchModels = React.useCallback(async () => {
    try { const res = await apiRequest<any>("/goods/models", { method: "GET" }); setModels(res?.data || []) } catch { setModels([]) }
  }, [])
  React.useEffect(() => { fetchModels() }, [fetchModels])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return models
    const q = search.toLowerCase()
    return models.filter(m =>
      (m.ModelName || "").toLowerCase().includes(q) ||
      String(m.ModelID).includes(q)
    )
  }, [models, search])

  const handleSave = async () => {
    if (!formName.trim()) return
    try {
      if (editingId) { await apiRequest(`/goods/models/${editingId}`, { method: "PATCH", body: JSON.stringify({ ModelName: formName }) }) }
      else { await apiRequest("/goods/models", { method: "POST", body: JSON.stringify({ ModelName: formName }) }) }
      setDialogOpen(false); setFormName(""); setEditingId(null); fetchModels()
    } catch {}
  }

  const handleEdit = (m: any) => { setEditingId(m.ModelID); setFormName(m.ModelName); setDialogOpen(true) }
  const handleDelete = async (id: number) => { if (!confirm("Delete?")) return; try { await apiRequest(`/goods/models/${id}`, { method: "DELETE" }); fetchModels() } catch {} }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Models</h1>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setFormName(""); setEditingId(null) } }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormName(""); setEditingId(null) }}><IconPlus className="mr-2 h-4 w-4" /> Add Model</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Model</DialogTitle></DialogHeader>
              <FieldGroup>
                <Field><FieldLabel>Model Name</FieldLabel><Input value={formName} onChange={(e) => setFormName(e.target.value)} /></Field>
                <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-xs">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search models…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Model Name</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No models found</TableCell></TableRow>
            ) : filtered.map((m) => (
              <TableRow key={m.ModelID}>
                <TableCell>{m.ModelID}</TableCell>
                <TableCell>{m.ModelName}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(m)}><IconEdit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(m.ModelID)}><IconTrash className="h-4 w-4" /></Button>
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
