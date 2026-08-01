import type { AttendanceRecord } from "@/data/types"
import { cn } from "@/lib/utils"
import { getMonthGrid, STATUS_META } from "@/lib/attendance"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AttendanceCalendar({
  records,
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
}: {
  records: AttendanceRecord[]
  year?: number
  month?: number
}) {
  const grid = getMonthGrid(year, month, records)

  return (
    <TooltipProvider>
      <div>
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-muted-foreground text-center text-[10px] font-semibold tracking-wider uppercase"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((cell) => {
            const meta = cell.record ? STATUS_META[cell.record.status] : null
            return (
              <Tooltip key={cell.dateKey} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-medium transition-all",
                      !cell.inMonth && "opacity-0 pointer-events-none",
                      cell.inMonth && !cell.record && cell.isWeekend && "bg-muted/40 text-muted-foreground/50",
                      cell.inMonth && !cell.record && !cell.isWeekend && "text-muted-foreground hover:bg-muted",
                      cell.inMonth && meta && cn(meta.cell, "shadow-sm"),
                      cell.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    )}
                  >
                    <span className="text-[11px] sm:text-xs">{cell.dayOfMonth}</span>
                    {cell.inMonth && cell.record && (
                      <span className={cn("mt-1 hidden size-1.5 rounded-full sm:block", meta?.dot)} />
                    )}
                  </div>
                </TooltipTrigger>
                {cell.record && (
                  <TooltipContent>
                    {cell.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    — {meta?.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-2 rounded-full", meta.dot)} />
              {meta.label}
            </span>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
