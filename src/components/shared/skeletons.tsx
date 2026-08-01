import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="size-11 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-2.5 w-32" />
    </div>
  )
}

export function ChartSkeleton({ height = 260, className }: { height?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-card", className)}>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex items-end gap-2 px-5 py-6" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + ((i * 37) % 60)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="space-y-0">
        <div className="bg-muted/40 flex gap-6 border-b px-5 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b px-5 py-3.5">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="ml-auto h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageLoader({
  variant = "dashboard",
}: {
  variant?: "dashboard" | "list" | "detail"
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      {variant === "dashboard" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <TableSkeleton />
        </>
      )}
      {variant === "list" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={8} />
        </>
      )}
      {variant === "detail" && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Skeleton className="h-72 rounded-xl" />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </>
      )}
    </div>
  )
}
