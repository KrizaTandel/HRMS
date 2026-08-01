import { useMemo, useState } from "react"
import { FileDown, FileText, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatusBadge } from "@/components/shared/status-badge"
import { AreaTrend, ChartCard, LegendItem } from "@/components/shared/charts"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate, formatTime, toISODate } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import { downloadPdf } from "@/lib/exportPdf"

type RangeKey = "today" | "week" | "month" | "custom"

const RANGE_LABELS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
]

export function EmployeeAttendancePage() {
  const { user } = useAuth()
  const { getEmployeeAttendance, checkIn, checkOut, todayRecord, pushActivity } = useData()
  const loading = useDelayedLoading(600)
  const [range, setRange] = useState<RangeKey>("week")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const attendance = user ? getEmployeeAttendance(user.id) : []
  const today = user ? todayRecord(user.id) : undefined

  const now = new Date()
  const todayKey = toISODate(now)

  const weeklyHours = useMemo(() => {
    const days: { name: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const rec = attendance.find((a) => a.date === toISODate(d))
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        hours: rec?.workingHours ?? 0,
      })
    }
    return days
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance])

  const filtered = useMemo(() => {
    let start = "0000-01-01"
    let end = "9999-12-31"
    if (range === "today") {
      start = todayKey
      end = todayKey
    } else if (range === "week") {
      const s = new Date(now)
      s.setDate(s.getDate() - 6)
      start = toISODate(s)
      end = todayKey
    } else if (range === "month") {
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      end = todayKey
    } else {
      if (from) start = from
      if (to) end = to
    }
    return [...attendance]
      .filter((a) => a.date >= start && a.date <= end)
      .sort((a, b) => b.date.localeCompare(a.date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance, range, from, to])

  const handleCheckIn = () => {
    if (!user) return
    if (today?.checkIn) {
      toast.info("Already checked in", { description: `Clocked in at ${formatTime(today.checkIn)}.` })
      return
    }
    checkIn(user.id)
    pushActivity({ type: "checkin", text: "You checked in", employeeId: user.id })
    toast.success("Checked in", { description: "Attendance marked. Have a productive day!" })
  }

  const handleCheckOut = () => {
    if (!user) return
    if (!today?.checkIn) {
      toast.warning("Not checked in yet", { description: "Clock in before checking out." })
      return
    }
    if (today.checkOut) {
      toast.info("Already checked out", { description: `Clocked out at ${formatTime(today.checkOut)}.` })
      return
    }
    checkOut(user.id)
    toast.success("Checked out", { description: "Thanks for today. See you tomorrow!" })
  }

  const exportCsv = () =>
    downloadCsv(
      `my-attendance-${toISODate(now)}.csv`,
      ["Date", "Check In", "Check Out", "Working Hours", "Status"],
      filtered.map((r) => [
        r.date,
        formatTime(r.checkIn),
        formatTime(r.checkOut),
        r.workingHours.toFixed(2),
        r.status.replace("_", " "),
      ])
    )

  const exportPdf = () =>
    downloadPdf(
      "Attendance Report",
      ["Date", "Check In", "Check Out", "Working Hours", "Status"],
      filtered.map((r) => [
        formatDate(r.date),
        formatTime(r.checkIn),
        formatTime(r.checkOut),
        `${r.workingHours.toFixed(2)}h`,
        r.status.replace("_", " "),
      ]),
      `${user?.firstName} ${user?.lastName} · ${filtered.length} record(s)`
    )

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance"
        description="Track your daily check-ins, working hours and attendance history."
        breadcrumbs={[{ label: "Workplace" }, { label: "Attendance" }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCheckIn} disabled={!!today?.checkIn}>
              <LogIn className="size-4" />
              Check In
            </Button>
            <Button
              variant="outline"
              onClick={handleCheckOut}
              disabled={!today?.checkIn || !!today?.checkOut}
            >
              <LogOut className="size-4" />
              Check Out
            </Button>
          </div>
        }
      />

      <Card className="relative overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary to-secondary absolute inset-0 opacity-90" />
        <div className="relative flex flex-col gap-6 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-medium text-white/80">Today's Attendance</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative flex size-3">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                    today?.checkOut ? "bg-slate-300" : today?.checkIn ? "bg-green-300" : "bg-amber-300"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-3 rounded-full",
                    today?.checkOut ? "bg-slate-200" : today?.checkIn ? "bg-green-300" : "bg-amber-300"
                  )}
                />
              </span>
              <h3 className="text-xl font-bold">
                {today?.checkOut
                  ? "Day complete — great work!"
                  : today?.checkIn
                    ? "You are checked in"
                    : "Ready to start your day"}
              </h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-white/15 text-white hover:bg-white/15">
                Check In: {formatTime(today?.checkIn ?? null)}
              </Badge>
              <Badge className="bg-white/15 text-white hover:bg-white/15">
                Check Out: {formatTime(today?.checkOut ?? null)}
              </Badge>
              <Badge className="bg-white/15 text-white hover:bg-white/15">
                Hours: {today?.workingHours ? `${today.workingHours.toFixed(2)}h` : "0.00h"}
              </Badge>
              {today && <StatusBadge status={today.status} />}
            </div>
          </div>
          <div className="shrink-0">
            <div className="text-right">
              <p className="text-sm text-white/80">{formatDate(now, { weekday: "long" })}</p>
              <p className="text-3xl font-bold tracking-tight">
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ChartCard
        title="Weekly Attendance"
        subtitle="Working hours · last 7 working days"
        action={<LegendItem color="var(--chart-1)" label="Hours" />}
      >
        <AreaTrend
          data={weeklyHours}
          series={[{ key: "hours", name: "Hours", color: "var(--chart-1)" }]}
          height={240}
          valueFormat={(v) => `${v}h`}
        />
      </ChartCard>

      <Card className="gap-0 p-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-sm font-semibold">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
                {RANGE_LABELS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRange(r.key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      range === r.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {range === "custom" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-8 w-[140px] text-xs"
                    aria-label="From date"
                  />
                  <span className="text-muted-foreground text-xs">→</span>
                  <Input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-8 w-[140px] text-xs"
                    aria-label="To date"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportPdf}>
                <FileText className="size-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <FileDown className="size-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <DataTable
            data={filtered}
            keyExtractor={(r) => r.id}
            pageSize={10}
            searchable={false}
            emptyMessage="No records found"
            emptyDescription="No attendance records match the selected period."
            columns={[
              {
                key: "date",
                header: "Date",
                sortable: true,
                sortValue: (r) => r.date,
                render: (r) => formatDate(r.date, { weekday: "short", month: "short", day: "numeric" }),
              },
              {
                key: "in",
                header: "Check In",
                sortable: true,
                sortValue: (r) => r.checkIn ?? "",
                render: (r) => formatTime(r.checkIn),
              },
              {
                key: "out",
                header: "Check Out",
                render: (r) => formatTime(r.checkOut),
              },
              {
                key: "hours",
                header: "Working Hours",
                sortable: true,
                sortValue: (r) => r.workingHours,
                render: (r) => <span className="font-medium">{r.workingHours.toFixed(2)}h</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (r) => <StatusBadge status={r.status} />,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
