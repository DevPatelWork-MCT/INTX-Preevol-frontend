"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useProductApi } from "@/hooks/useProductApi"
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

export default function ProductPage() {
  const { listProducts, createProduct, updateProduct, deleteProduct, loading } = useProductApi()
  const { listCategories, listSubCategories } = useCategoryApi()
  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [subCategories, setSubCategories] = React.useState<any[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState({ ProductName: "", CategoryID: "", SubCategoryID: "", UOM: "", HSNNoOrSACNo: "", MachineNo: "", Price: "", IsService: "false", FullProductName: "" })

  const fetchData = React.useCallback(async () => {
    try {
      const [pRes, cRes, scRes] = await Promise.all([listProducts(), listCategories(), listSubCategories()])
      setProducts(pRes?.data || [])
      setCategories(cRes?.data || [])
      setSubCategories(scRes?.data || [])
    } catch {}
  }, [listProducts, listCategories, listSubCategories])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!form.ProductName.trim()) return
    try {
      const payload = {
        ...form,
        CategoryID: form.CategoryID ? Number(form.CategoryID) : null,
        SubCategoryID: form.SubCategoryID ? Number(form.SubCategoryID) : null,
        Price: form.Price ? Number(form.Price) : null,
        IsService: form.IsService === "true",
      }
      if (editingId) {
        await updateProduct(String(editingId), payload)
      } else {
        await createProduct(payload)
      }
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch {}
  }

  const resetForm = () => {
    setForm({ ProductName: "", CategoryID: "", SubCategoryID: "", UOM: "", HSNNoOrSACNo: "", MachineNo: "", Price: "", IsService: "false", FullProductName: "" })
    setEditingId(null)
  }

  const handleEdit = (p: any) => {
    setEditingId(p.ProductID)
    setForm({
      ProductName: p.ProductName || "",
      CategoryID: p.CategoryID ? String(p.CategoryID) : "",
      SubCategoryID: p.SubCategoryID ? String(p.SubCategoryID) : "",
      UOM: p.UOM || "",
      HSNNoOrSACNo: p.HSNNoOrSACNo || "",
      MachineNo: p.MachineNo || "",
      Price: p.Price ? String(p.Price) : "",
      IsService: p.IsService ? "true" : "false",
      FullProductName: p.FullProductName || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return
    try { await deleteProduct(String(id)); fetchData() } catch {}
  }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><IconPlus className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Product Name *</FieldLabel>
                <Input value={form.ProductName} onChange={(e) => setForm({ ...form, ProductName: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={form.CategoryID} onValueChange={(v) => setForm({ ...form, CategoryID: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.CategoryID} value={String(c.CategoryID)}>{c.CategoryName}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Sub Category</FieldLabel>
                <Select value={form.SubCategoryID} onValueChange={(v) => setForm({ ...form, SubCategoryID: v })}>
                  <SelectTrigger><SelectValue placeholder="Select sub category" /></SelectTrigger>
                  <SelectContent>{subCategories.filter(sc => !form.CategoryID || sc.CategoryID === Number(form.CategoryID)).map((sc) => <SelectItem key={sc.SubCategoryID} value={String(sc.SubCategoryID)}>{sc.SubCategoryName}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>UOM</FieldLabel>
                  <Input value={form.UOM} onChange={(e) => setForm({ ...form, UOM: e.target.value })} placeholder="e.g., Nos, Kg" />
                </Field>
                <Field>
                  <FieldLabel>HSN/SAC No</FieldLabel>
                  <Input value={form.HSNNoOrSACNo} onChange={(e) => setForm({ ...form, HSNNoOrSACNo: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Machine No</FieldLabel>
                  <Input value={form.MachineNo} onChange={(e) => setForm({ ...form, MachineNo: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Price</FieldLabel>
                  <Input type="number" value={form.Price} onChange={(e) => setForm({ ...form, Price: e.target.value })} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Is Service</FieldLabel>
                <Select value={form.IsService} onValueChange={(v) => setForm({ ...form, IsService: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Yes</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Full Product Name</FieldLabel>
                <Input value={form.FullProductName} onChange={(e) => setForm({ ...form, FullProductName: e.target.value })} />
              </Field>
              <Button onClick={handleSave} disabled={loading || !form.ProductName.trim()}>{editingId ? "Update" : "Save"}</Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>HSN/SAC</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No products found</TableCell></TableRow>
          ) : products.map((p) => (
            <TableRow key={p.ProductID}>
              <TableCell>{p.ProductID}</TableCell>
              <TableCell>{p.ProductName}</TableCell>
              <TableCell>{categories.find(c => c.CategoryID === p.CategoryID)?.CategoryName || "-"}</TableCell>
              <TableCell>{p.UOM || "-"}</TableCell>
              <TableCell>{p.HSNNoOrSACNo || "-"}</TableCell>
              <TableCell>{p.Price || "-"}</TableCell>
              <TableCell>{p.IsService ? "Yes" : "No"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}><IconEdit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.ProductID)}><IconTrash className="h-4 w-4" /></Button>
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
