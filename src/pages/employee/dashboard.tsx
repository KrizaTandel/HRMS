import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Cake,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  FileDown,
  LogIn,
  LogOut,
  Megaphone,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { QuickActions } from "@/components/shared/quick-actions"
import { MinimalTimeline } from "@/components/shared/minimal-timeline"
import { LeaveFormDialog } from "@/components/shared/leave-form-dialog"
import { PageLoader } from "@/components/shared/skeletons"
import { AreaTrend, ChartCard, LegendItem } from "@/components/shared/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { formatCurrency, formatDate, formatTime, greeting, toISODate } from "@/lib/format"
import { attendanceRate } from "@/lib/attendance"
import { getLeaveBalances } from "@/data/mockData"
import { getNextHoliday, getUpcomingBirthdays, daysUntil } from "@/lib/events"

export function EmployeeDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    employees,
    notifications,
    getEmployee,
    getEmployeeAttendance,
    getEmployeeLeaves,
    getEmployeePayroll,
    checkIn,
    checkOut,
    todayRecord,
    activities,
  } = useData()
  const loading = useDelayedLoading(650)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const employee = user ? getEmployee(user.id) : undefined
  const attendance = user ? getEmployeeAttendance(user.id) : []
  const leaves = user ? getEmployeeLeaves(user.id) : []
  const payrollRecs = user ? getEmployeePayroll(user.id) : []

  const balances = user ? getLeaveBalances(user.id) : null
  const today = user ? todayRecord(user.id) : undefined
  const pendingLeaves = leaves.filter((l) => l.status === "pending")
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const currentPayroll = payrollRecs.find((p) => p.month === currentMonthKey)

  const rate = user ? attendanceRate(attendance, now.getFullYear(), now.getMonth()) : 0
  const totalRemaining = balances
    ? balances.remaining.paid + balances.remaining.sick + balances.remaining.casual
    : 0

  const weeklyData = useMemo(() => {
    const days: { name: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const key = toISODate(d)
      const rec = attendance.find((a) => a.date === key)
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        hours: rec?.workingHours ?? 0,
      })
    }
    return days
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance])

  const upcomingHoliday = getNextHoliday(now)
  const upcomingBirthdays = getUpcomingBirthdays(employees, 30, now)
  const announcement = notifications[0]

  const handleCheckIn = () => {
    if (!user) return
    if (today?.checkIn) {
      toast.info("Already checked in", { description: `You clocked in at ${formatTime(today.checkIn)}.` })
      return
    }
    checkIn(user.id)
    toast.success("Checked in", { description: "Your work day has started. Have a great day!" })
  }

  const handleCheckOut = () => {
    if (!user) return
    if (!today?.checkIn) {
      toast.warning("Not checked in", { description: "Clock in before checking out." })
      return
    }
    if (today.checkOut) {
      toast.info("Already checked out", { description: `You clocked out at ${formatTime(today.checkOut)}.` })
      return
    }
    checkOut(user.id)
    toast.success("Checked out", { description: "Your work day has ended. See you tomorrow!" })
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 text-white shadow-lg sm:p-9">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="bg-primary/25 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" ring className="ring-white/25" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/75">
              {greeting()}, {user?.firstName}
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
              {employee?.firstName} {employee?.lastName}
            </h1>
            <p className="mt-0.5 text-sm text-white/70">
              {employee?.designation} · {employee?.department}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-white/75">
              <span>
                {formatDate(now, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="bg-white/10 rounded-full px-2.5 py-0.5 font-medium text-white/90">
                {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance"
          value={rate}
          suffix="%"
          icon={CalendarCheck}
          tone="success"
          description="This month"
        />
        <StatCard
          label="Leaves Remaining"
          value={totalRemaining}
          icon={CalendarDays}
          tone="info"
          description={`${balances?.remaining.paid ?? 0} paid · ${balances?.remaining.sick ?? 0} sick`}
        />
        <StatCard
          label="Pending Leave Requests"
          value={pendingLeaves.length}
          icon={CalendarClock}
          tone="warning"
          description="Awaiting approval"
        />
        <StatCard
          label="Salary (This Month)"
          value={currentPayroll?.net ?? 0}
          icon={Wallet}
          tone="primary"
          format={(n) => formatCurrency(n)}
          description={currentMonthKey}
        />
      </section>

      <section>
        <QuickActions
          className="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          items={[
            {
              label: "Check In",
              description: today?.checkIn ? `At ${formatTime(today.checkIn)}` : "Start work day",
              icon: LogIn,
              tone: "success",
              disabled: !!today?.checkIn,
              onClick: handleCheckIn,
            },
            {
              label: "Check Out",
              description: today?.checkOut ? `At ${formatTime(today.checkOut)}` : "End work day",
              icon: LogOut,
              tone: "danger",
              disabled: !today?.checkIn || !!today?.checkOut,
              onClick: handleCheckOut,
            },
            {
              label: "Apply Leave",
              description: "Request time off",
              icon: CalendarClock,
              tone: "info",
              onClick: () => setLeaveOpen(true),
            },
            {
              label: "View Attendance",
              description: "See your records",
              icon: CalendarCheck,
              tone: "primary",
              onClick: () => navigate("/employee/attendance"),
            },
            {
              label: "Download Payslip",
              description: `${currentMonthKey} payslip`,
              icon: FileDown,
              tone: "secondary",
              onClick: () => {
                toast.success("Payslip downloaded", {
                  description: "Your payslip PDF has been generated.",
                })
                navigate("/employee/payroll")
              },
            },
          ]}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Attendance Overview"
          subtitle="Hours logged · last 7 working days"
          action={<LegendItem color="var(--chart-1)" label="Hours" />}
          className="lg:col-span-2"
        >
          <AreaTrend
            data={weeklyData}
            series={[{ key: "hours", name: "Hours", color: "var(--chart-1)" }]}
            height={260}
            valueFormat={(v) => `${v}h`}
          />
        </ChartCard>

        <Card className="gap-0 p-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="space-y-4">
              {upcomingHoliday && (
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{upcomingHoliday.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(upcomingHoliday.date)} ·{" "}
                      {daysUntil(upcomingHoliday.date) === 0
                        ? "Today"
                        : `in ${daysUntil(upcomingHoliday.date)} day${daysUntil(upcomingHoliday.date) === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>
              )}

              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((b) => (
                  <div key={b.employee.id} className="flex items-start gap-3">
                    <span className="bg-rose-500/10 text-rose-500 flex size-9 shrink-0 items-center justify-center rounded-xl">
                      <Cake className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {b.employee.firstName} {b.employee.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(b.date, { month: "short", day: "numeric" })} · turning {b.age + 1}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3">
                  <span className="bg-rose-500/10 text-rose-500 flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <Cake className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">No birthdays this month</p>
                    <p className="text-muted-foreground text-xs">Check back soon.</p>
                  </div>
                </div>
              )}

              {announcement && (
                <div className="flex items-start gap-3">
                  <span className="bg-amber-500/10 text-amber-500 flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <Megaphone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{announcement.title}</p>
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {announcement.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="gap-0 p-0">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/employee/profile")}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <MinimalTimeline activities={activities} limit={5} />
        </CardContent>
      </Card>

      <LeaveFormDialog open={leaveOpen} onOpenChange={setLeaveOpen} />
    </div>
  )
}
