import type { AttendanceRecord, AttendanceStatus } from "@/data/types"
import { toISODate } from "./format"

export const STATUS_META: Record<
  AttendanceStatus,
  { label: string; dot: string; cell: string }
> = {
  present: {
    label: "Present",
    dot: "bg-success",
    cell: "bg-success/15 text-success ring-success/30 dark:bg-success/15",
  },
  absent: {
    label: "Absent",
    dot: "bg-destructive",
    cell: "bg-destructive/15 text-destructive ring-destructive/30 dark:bg-destructive/15",
  },
  half_day: {
    label: "Half Day",
    dot: "bg-warning",
    cell: "bg-warning/15 text-warning ring-warning/30 dark:bg-warning/15",
  },
  late: {
    label: "Late",
    dot: "bg-warning",
    cell: "bg-orange-400/15 text-orange-500 ring-orange-400/30 dark:text-orange-300",
  },
  leave: {
    label: "Leave",
    dot: "bg-info",
    cell: "bg-info/15 text-info ring-info/30 dark:bg-info/15",
  },
}

export function monthlyCounts(records: AttendanceRecord[], year: number, month: number) {
  const counts: Record<AttendanceStatus, number> = {
    present: 0,
    absent: 0,
    half_day: 0,
    leave: 0,
    late: 0,
  }
  for (const r of records) {
    const d = new Date(r.date + "T00:00:00")
    if (d.getFullYear() === year && d.getMonth() === month) {
      counts[r.status] = (counts[r.status] ?? 0) + 1
    }
  }
  return counts
}

export interface CalendarDay {
  date: Date
  dateKey: string
  dayOfMonth: number
  inMonth: boolean
  isWeekend: boolean
  isToday: boolean
  record?: AttendanceRecord
}

export function getMonthGrid(
  year: number,
  month: number,
  records: AttendanceRecord[]
): CalendarDay[] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay()
  const today = new Date()
  const todayKey = toISODate(today)
  const recordMap = new Map(records.map((r) => [r.date, r]))

  const cells: CalendarDay[] = []
  for (let i = 0; i < leading; i++) {
    const date = new Date(year, month, i - leading + 1)
    cells.push({
      date,
      dateKey: toISODate(date),
      dayOfMonth: date.getDate(),
      inMonth: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: false,
    })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = toISODate(date)
    cells.push({
      date,
      dateKey: key,
      dayOfMonth: d,
      inMonth: true,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: key === todayKey,
      record: recordMap.get(key),
    })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    cells.push({
      date: next,
      dateKey: toISODate(next),
      dayOfMonth: next.getDate(),
      inMonth: false,
      isWeekend: next.getDay() === 0 || next.getDay() === 6,
      isToday: false,
    })
  }
  return cells
}

export function workingDaysUpTo(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  let count = 0
  while (d <= today) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

export function attendanceRate(records: AttendanceRecord[], year: number, month: number): number {
  const counts = monthlyCounts(records, year, month)
  const attended = counts.present + counts.late
  const total = workingDaysUpTo(new Date(year, month, 1))
  const present = Math.min(
    attended,
    new Date().getMonth() === month && new Date().getFullYear() === year
      ? total
      : new Date(year, month + 1, 0).getDate()
  )
  return Math.round((present / Math.max(1, total)) * 100)
}
