import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Inbox,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { SearchInput } from "./search-input"

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  sortable?: boolean
  sortValue?: (row: T) => string | number
  render?: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  align?: "left" | "right" | "center"
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  searchable?: boolean
  searchIndex?: (row: T) => string
  pageSize?: number
  toolbar?: ReactNode
  emptyMessage?: string
  emptyDescription?: string
  onExport?: () => void
  exportLabel?: string
  stickyHeader?: boolean
  onRowClick?: (row: T) => void
  dense?: boolean
  className?: string
}

function SortIcon({ state }: { state: "asc" | "desc" | "none" }) {
  if (state === "asc") return <ArrowUp className="text-primary size-3.5" />
  if (state === "desc") return <ArrowDown className="text-primary size-3.5" />
  return <ArrowUpDown className="text-muted-foreground/60 size-3.5" />
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchIndex,
  pageSize = 8,
  toolbar,
  emptyMessage = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  onExport,
  exportLabel = "Export",
  stickyHeader = true,
  onRowClick,
  dense = false,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = data
    if (query && searchIndex) {
      const q = query.toLowerCase()
      rows = rows.filter((row) => searchIndex(row).toLowerCase().includes(q))
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a)
          const bv = col.sortValue!(b)
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv))
          return sortDir === "asc" ? cmp : -cmp
        })
      }
    }
    return rows
  }, [data, query, searchIndex, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(col.key)
      setSortDir("asc")
    }
    setPage(1)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(searchable || toolbar || onExport) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {toolbar}
          </div>
          <div className="flex items-center gap-2">
            {searchable && searchIndex && (
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search records..."
                className="sm:max-w-[220px]"
              />
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
                <FileDown className="size-4" />
                {exportLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card shadow-card",
          dense && "overflow-x-auto"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-11 text-[11px] font-semibold tracking-wider uppercase",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.headerClassName
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={cn(
                        "flex items-center gap-1 transition-colors hover:text-foreground",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {col.header}
                      <SortIcon
                        state={sortKey === col.key ? sortDir : "none"}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
                      <Inbox className="text-muted-foreground size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emptyMessage}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {emptyDescription}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        dense && "py-2",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-muted-foreground text-xs">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = (() => {
                  if (totalPages <= 5) return i + 1
                  if (safePage <= 3) return i + 1
                  if (safePage >= totalPages - 2) return totalPages - 4 + i
                  return safePage - 2 + i
                })()
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "size-8 rounded-lg text-xs font-medium transition-all",
                      pageNum === safePage
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <Button
                variant="outline"
                size="icon-sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
