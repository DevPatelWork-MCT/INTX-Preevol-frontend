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
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react"

interface CategoryItem {
  CategoryID: number
  CategoryName: string
}

export default function CategoryPage() {
  const { listCategories, createCategory, updateCategory, deleteCategory, loading } = useCategoryApi()
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [formName, setFormName] = React.useState("")
  const [initialized, setInitialized] = React.useState(false)

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await listCategories()
      setCategories(res?.data || [])
    } catch {}
  }, [listCategories])

  if (!initialized) {
    setInitialized(true)
    fetchCategories()
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    try {
      if (editingId) {
        await updateCategory(String(editingId), { CategoryName: formName })
      } else {
        await createCategory({ CategoryName: formName })
      }
      setDialogOpen(false)
      setFormName("")
      setEditingId(null)
      fetchCategories()
    } catch {}
  }

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.CategoryID)
    setFormName(cat.CategoryName)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return
    try {
      await deleteCategory(String(id))
      fetchCategories()
    } catch {}
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setFormName(""); setEditingId(null) } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormName(""); setEditingId(null) }}>
              <IconPlus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Category Name</FieldLabel>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter category name" />
              </Field>
              <Button onClick={handleSave} disabled={loading || !formName.trim()}>
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
            <TableHead>Category Name</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No categories found</TableCell></TableRow>
          ) : categories.map((cat) => (
            <TableRow key={cat.CategoryID}>
              <TableCell>{cat.CategoryID}</TableCell>
              <TableCell>{cat.CategoryName}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cat)}><IconEdit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.CategoryID)}><IconTrash className="h-4 w-4" /></Button>
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
