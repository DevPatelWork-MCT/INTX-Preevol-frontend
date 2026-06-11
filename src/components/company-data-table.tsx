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
import Link from "next/link"

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
  IconCalendarPlus,
  IconBuilding,
  IconCalendar,
} from "@tabler/icons-react"

// ── Latest financial year attached to each company row ────────────
export interface LatestFinancialYear {
  FinancialYear: string
  StartDate: string
  EndDate: string
}

// ── Company row type ──────────────────────────────────────────────
export interface CompanyRow {
  CompanyID: number
  Name: string
  Address: string | null
  GSTIN: string | null
  PANNo: string | null
  Phone1: string | null
  Phone2: string | null
  state: string | null
  Statecode: number | null
  EmailID1: string | null
  EmailID2: string | null
  Website: string | null
  VATno: number | null
  CSTNo: number | null
  ECCNo: string | null
  IECCode: string | null
  SupplyFrom: string | null
  Loc: string | null
  Pin: string | null
  createdAt: string | null
  updatedAt: string | null
  latestFinancialYear: LatestFinancialYear | null
}

// ── Pagination info returned by backend ───────────────────────────
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ── Column definitions (actions injected via callback) ────────────
const baseColumns: ColumnDef<CompanyRow>[] = [
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
    accessorKey: "Name",
    header: "Company Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconBuilding className="h-4 w-4" />
        </div>
        <Link
          href={`/masters/company/${row.original.CompanyID}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.Name}
        </Link>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "latestFinancialYear",
    header: "Financial Year",
    cell: ({ row }) => {
      const fy = row.original.latestFinancialYear
      if (!fy) {
        return (
          <span className="text-xs text-muted-foreground italic">
            No FY set
          </span>
        )
      }
      const start = new Date(fy.StartDate)
      const end = new Date(fy.EndDate)
      const now = new Date()
      const isActive = now >= start && now <= end
      return (
        <div className="flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {fy.FinancialYear}
          </Badge>
          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" title="Active" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "GSTIN",
    header: "GSTIN",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.GSTIN ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "PANNo",
    header: "PAN",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.PANNo ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.state ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "Phone1",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.Phone1 ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "EmailID1",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[180px] block">
        {row.original.EmailID1 ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "SupplyFrom",
    header: "Supply From",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.SupplyFrom ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "IECCode",
    header: "IEC Code",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.IECCode ?? "—"}
      </span>
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
interface CompanyDataTableProps {
  data: CompanyRow[]
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearchChange: (search: string) => void
  onDelete?: (id: number) => Promise<void>
  onEdit?: (row: CompanyRow) => void
  onAddFinancialYear?: (row: CompanyRow) => void
  onViewFinancialYears?: (row: CompanyRow) => void
}

// ── Main component ────────────────────────────────────────────────
export function CompanyDataTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onDelete,
  onEdit,
  onAddFinancialYear,
  onViewFinancialYears,
}: CompanyDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [searchValue, setSearchValue] = React.useState("")

  // Debounced search: wait 300ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])

  const columns = React.useMemo(
    () =>
      buildColumnsWithActions(onDelete, onEdit, onAddFinancialYear, onViewFinancialYears),
    [onDelete, onEdit, onAddFinancialYear, onViewFinancialYears]
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
      const current = {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      }
      const newState =
        typeof updater === "function" ? updater(current) : updater
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
      <div className="flex flex-col gap-3 px-4 pt-4 lg:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search by name, GSTIN, state…"
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" asChild>
            <a href="/masters/company/create" className="gap-1">
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Company</span>
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <IconBuilding className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">No companies found</p>
                      <p className="text-xs">
                        {searchValue
                          ? "Try a different search term"
                          : "Get started by adding your first company"}
                      </p>
                      {!searchValue && (
                        <Button size="sm" variant="outline" className="mt-1" asChild>
                          <a href="/masters/company/create">
                            <IconPlus className="h-3.5 w-3.5 mr-1" />
                            Add Company
                          </a>
                        </Button>
                      )}
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
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows
              </Label>
              <Select
                value={`${pagination.limit}`}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger size="sm" className="w-[70px]" id="rows-per-page">
                  <SelectValue placeholder={pagination.limit} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-fit items-center justify-center text-sm font-medium tabular-nums">
              Page {pagination.page} of {pagination.totalPages || 1}
              <span className="text-muted-foreground ml-1.5 text-xs">
                ({pagination.total})
              </span>
            </div>

            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={pagination.page <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                size="icon"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                size="icon"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                size="icon"
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper: inject callbacks into action column ───────────────────
function buildColumnsWithActions(
  onDelete?: (id: number) => Promise<void>,
  onEdit?: (row: CompanyRow) => void,
  onAddFinancialYear?: (row: CompanyRow) => void,
  onViewFinancialYears?: (row: CompanyRow) => void,
): ColumnDef<CompanyRow>[] {
  return [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit?.(item)} className="gap-2">
                <IconBuilding className="h-4 w-4" />
                Edit Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewFinancialYears?.(item)} className="gap-2">
                <IconCalendar className="h-4 w-4" />
                View Financial Years
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddFinancialYear?.(item)} className="gap-2">
                <IconCalendarPlus className="h-4 w-4" />
                Add Financial Year
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2"
                onClick={async () => {
                  if (onDelete) {
                    toast.promise(onDelete(item.CompanyID), {
                      loading: `Deleting ${item.Name}…`,
                      success: "Deleted",
                      error: "Failed to delete",
                    })
                  } else {
                    toast.error("Delete not connected")
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
