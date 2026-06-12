"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useCategoryApi } from "@/hooks/useCategoryApi"
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
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react"

export default function SubCategoryPage() {
  const { listCategories, listSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, loading } = useCategoryApi()
  const [categories, setCategories] = React.useState<any[]>([])
  const [subCategories, setSubCategories] = React.useState<any[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [formName, setFormName] = React.useState("")
  const [formCategoryId, setFormCategoryId] = React.useState("")

  const fetchData = React.useCallback(async () => {
    try {
      const [catRes, subRes] = await Promise.all([listCategories(), listSubCategories()])
      setCategories(catRes?.data || [])
      setSubCategories(subRes?.data || [])
    } catch {}
  }, [listCategories, listSubCategories])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!formName.trim() || !formCategoryId) return
    try {
      if (editingId) {
        await updateSubCategory(String(editingId), { SubCategoryName: formName, CategoryID: Number(formCategoryId) })
      } else {
        await createSubCategory({ SubCategoryName: formName, CategoryID: Number(formCategoryId) })
      }
      setDialogOpen(false)
      setFormName("")
      setFormCategoryId("")
      setEditingId(null)
      fetchData()
    } catch {}
  }

  const handleEdit = (sub: any) => {
    setEditingId(sub.SubCategoryID)
    setFormName(sub.SubCategoryName)
    setFormCategoryId(String(sub.CategoryID))
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this sub category?")) return
    try {
      await deleteSubCategory(String(id))
      fetchData()
    } catch {}
  }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sub Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setFormName(""); setFormCategoryId(""); setEditingId(null) } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormName(""); setFormCategoryId(""); setEditingId(null) }}>
              <IconPlus className="mr-2 h-4 w-4" /> Add Sub Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Sub Category</DialogTitle></DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Sub Category Name</FieldLabel>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter sub category name" />
              </Field>
              <Button onClick={handleSave} disabled={loading || !formName.trim() || !formCategoryId}>
                {editingId ? "Update" : "Save"}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category Name</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subCategories.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sub categories found</TableCell></TableRow>
          ) : subCategories.map((sub) => (
            <TableRow key={sub.SubCategoryID}>
              <TableCell>{sub.SubCategoryID}</TableCell>
              <TableCell>{categories.find(c => c.CategoryID === sub.CategoryID)?.CategoryName || sub.CategoryID}</TableCell>
              <TableCell>{sub.SubCategoryName}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(sub)}><IconEdit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(sub.SubCategoryID)}><IconTrash className="h-4 w-4" /></Button>
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
