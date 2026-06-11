"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  IconDotsVertical,
  IconLayoutColumns,
  IconChevronDown,
  IconPlus,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconBuildingBank,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"

// ── Bank row type ─────────────────────────────────────────────────
export interface BankRow {
  BankID: number
  CompanyID: number | null
  BankName: string | null
  AccountNo: string | null
  IFSCCode: string | null
  SwiftCode: string | null
  Company: string | null
  createdAt: string | null
  updatedAt: string | null
}

// ── Pagination info ───────────────────────────────────────────────
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ── Column definitions ────────────────────────────────────────────
const baseColumns: ColumnDef<BankRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "BankName",
    header: "Bank Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconBuildingBank className="h-4 w-4" />
        </div>
        <span className="font-medium">{row.original.BankName ?? "—"}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "AccountNo",
    header: "Account No",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.AccountNo ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "IFSCCode",
    header: "IFSC Code",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.IFSCCode ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "SwiftCode",
    header: "SWIFT Code",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.SwiftCode ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "Company",
    header: "Company",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.Company ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </span>
    ),
  },
]

// ── Component props ───────────────────────────────────────────────
interface BankDataTableProps {
  data: BankRow[]
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearchChange: (search: string) => void
  onDelete?: (id: number) => Promise<void>
  onEdit?: (row: BankRow) => void
}

// ── Main component ────────────────────────────────────────────────
export function BankDataTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onDelete,
  onEdit,
}: BankDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [searchValue, setSearchValue] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => onSearchChange(searchValue), 300)
    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])

  const columns = React.useMemo(
    () => buildColumnsWithActions(onDelete, onEdit),
    [onDelete, onEdit]
  )

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: pagination.totalPages,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const current = { pageIndex: pagination.page - 1, pageSize: pagination.limit }
      const newState = typeof updater === "function" ? updater(current) : updater
      if (newState.pageIndex !== pagination.page - 1) {
        onPageChange(newState.pageIndex + 1)
      }
      if (newState.pageSize !== pagination.limit) {
        onPageSizeChange(newState.pageSize)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2 lg:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search by bank name, IFSC, account…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-3"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <IconLayoutColumns className="h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
                <IconChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" asChild>
            <a href="/masters/bank/create" className="gap-1">
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Bank</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <IconBuildingBank className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">No banks found</p>
                      <p className="text-xs">
                        {searchValue ? "Try a different search term" : "Get started by adding your first bank"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {pagination.total} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-4 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows</Label>
              <Select
                value={`${pagination.limit}`}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger size="sm" className="w-[70px]" id="rows-per-page">
                  <SelectValue placeholder={pagination.limit} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[5, 10, 20, 30, 50, 100].map((s) => (
                      <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium tabular-nums">
              Page {pagination.page} of {pagination.totalPages || 1}
              <span className="text-muted-foreground ml-1.5 text-xs">({pagination.total})</span>
            </div>
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(1)} disabled={pagination.page <= 1}>
                <span className="sr-only">First page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" size="icon" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                <span className="sr-only">Previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" size="icon" onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                <span className="sr-only">Next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" size="icon" onClick={() => onPageChange(pagination.totalPages)} disabled={pagination.page >= pagination.totalPages}>
                <span className="sr-only">Last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildColumnsWithActions(
  onDelete?: (id: number) => Promise<void>,
  onEdit?: (row: BankRow) => void,
): ColumnDef<BankRow>[] {
  return [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted" size="icon">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit?.(item)} className="gap-2">
                <IconPencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2"
                onClick={async () => {
                  if (onDelete) {
                    toast.promise(onDelete(item.BankID), {
                      loading: `Deleting ${item.BankName}…`,
                      success: "Deleted",
                      error: "Failed to delete",
                    })
                  }
                }}
              >
                <IconTrash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
