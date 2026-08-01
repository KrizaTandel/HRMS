import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  FileDown,
  Mail,
  MailOpen,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useAccountsStore } from "@/lib/accounts"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { MinimalTimeline } from "@/components/shared/minimal-timeline"
import { DataTable } from "@/components/shared/data-table"
import { AddEmployeeDialog } from "@/components/shared/add-employee-dialog"
import { PageLoader } from "@/components/shared/skeletons"
import { AreaTrend, ChartCard, LegendItem } from "@/components/shared/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, greeting, toISODate } from "@/lib/format"
import { attendanceRate } from "@/lib/attendance"
import { getLeaveBalances } from "@/data/mockData"
import type { Employee } from "@/data/types"

interface PendingAction {
  label: string
  description: string
  count: number
  icon: typeof UserCheck
  tone: "primary" | "success" | "warning" | "danger" | "info" | "secondary"
  onClick: () => void
}

function PendingActionRow({ action }: { action: PendingAction }) {
  const TONE_CHIP: Record<PendingAction["tone"], string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }
  return (
    <button
      type="button"
      onClick={action.onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-transparent p-4 text-left transition-colors hover:border-border hover:bg-muted/40"
    >
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TONE_CHIP[action.tone]}`}>
        <action.icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{action.label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{action.description}</p>
      </div>
      <span className="text-xl font-bold tabular-nums">{action.count}</span>
      <ChevronRight className="text-muted-foreground/40 size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  )
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    employees,
    departments,
    attendance,
    leaves,
    payrollRecords,
    activities,
    generatePayroll,
  } = useData()
  const accounts = useAccountsStore()
  const pendingRegistrations = accounts.filter((a) => a.status === "pending-approval").length
  const awaitingVerification = accounts.filter((a) => a.status === "pending-verification").length
  const approvedRegistrations = accounts.filter((a) => a.status === "approved").length
  const rejectedRegistrations = accounts.filter((a) => a.status === "rejected").length
  const loading = useDelayedLoading(650)
  const [addOpen, setAddOpen] = useState(false)

  const todayKey = toISODate(new Date())
  const todayRecords = useMemo(
    () => attendance.filter((a) => a.date === todayKey),
    [attendance, todayKey]
  )
  const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "late").length
  const lateToday = todayRecords.filter((r) => r.status === "late").length
  const pendingLeaves = leaves.filter((l) => l.status === "pending")
  const currentMonth = new Date().toISOString().slice(0, 7)
  const payrollGenerated = payrollRecords
    .filter((p) => p.month === currentMonth)
    .reduce((s, p) => s + p.net, 0)

  const attendanceTrend = useMemo(() => {
    const days: { name: string; present: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const key = toISODate(d)
      const recs = attendance.filter((a) => a.date === key)
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        present: recs.filter((r) => r.status === "present" || r.status === "late").length,
      })
    }
    return days
  }, [attendance])

  const attendanceByEmp = useMemo(() => {
    const map = new Map<string, number>()
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const monthRecs = attendance.filter((a) => a.date.startsWith(prefix))
    for (const emp of employees) {
      map.set(
        emp.id,
        attendanceRate(monthRecs.filter((a) => a.employeeId === emp.id), now.getFullYear(), now.getMonth())
      )
    }
    return map
  }, [employees, attendance])

  const leaveBalanceByEmp = useMemo(() => {
    const map = new Map<string, number>()
    for (const emp of employees) {
      const balances = getLeaveBalances(emp.id)
      map.set(
        emp.id,
        balances.remaining.paid + balances.remaining.sick + balances.remaining.casual
      )
    }
    return map
  }, [employees])

  const isProbation = (emp: Employee) =>
    Date.now() - new Date(emp.joiningDate + "T00:00:00").getTime() < 90 * 86400000

  const pendingActions: PendingAction[] = [
    {
      label: "Pending Leave Requests",
      description: "Review and approve requests",
      count: pendingLeaves.length,
      icon: CalendarClock,
      tone: "warning",
      onClick: () => navigate("/admin/leaves"),
    },
    {
      label: "Pending Employee Registrations",
      description: "Verify new sign-ups",
      count: pendingRegistrations,
      icon: UserCheck,
      tone: "primary",
      onClick: () => navigate("/admin/approvals"),
    },
    {
      label: "Attendance Corrections",
      description: "Late punches to review",
      count: lateToday,
      icon: ClipboardList,
      tone: "info",
      onClick: () => navigate("/admin/attendance"),
    },
  ]

  const handleGeneratePayroll = () => {
    generatePayroll()
    toast.success("Payroll generated", {
      description: `${employees.length} payslips generated for ${currentMonth}.`,
    })
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 text-white shadow-lg sm:p-9">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="bg-primary/25 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl" />
        <div className="bg-secondary/20 pointer-events-none absolute -bottom-24 right-1/4 size-56 rounded-full blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/75">
              {greeting()}, {user?.firstName} · HR Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Operations Overview</h1>
            <p className="mt-1 text-sm text-white/70">
              {formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })} ·{" "}
              {employees.length} employees across {departments.length} departments
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/admin/reports")}>
              <FileBarChart className="size-4" />
              View Reports
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4" />
              Add Employee
            </Button>
          </div>
        </div>
      </section>

      <section className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={employees.length}
          icon={Users}
          tone="primary"
          description="Active workforce"
        />
        <StatCard
          label="Present Today"
          value={presentToday}
          icon={CalendarCheck}
          tone="success"
          suffix={` / ${employees.length}`}
          description="Checked in"
        />
        <StatCard
          label="Pending Leave Requests"
          value={pendingLeaves.length}
          icon={CalendarClock}
          tone="warning"
          description="Awaiting approval"
        />
        <StatCard
          label="Payroll Status"
          value={payrollGenerated}
          icon={Wallet}
          tone="secondary"
          format={(n) => formatCurrency(n, true)}
          description={`${currentMonth} net`}
        />
      </section>

      <section className="stagger grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Pending Approval"
          value={pendingRegistrations}
          icon={UserCheck}
          tone="primary"
          description="Awaiting your review"
        />
        <StatCard
          label="Approved"
          value={approvedRegistrations}
          icon={BadgeCheck}
          tone="success"
          description="Active portal users"
        />
        <StatCard
          label="Rejected"
          value={rejectedRegistrations}
          icon={XCircle}
          tone="danger"
          description="Declined applications"
        />
        <StatCard
          label="Awaiting Verification"
          value={awaitingVerification}
          icon={MailOpen}
          tone="info"
          description="Not yet email-verified"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="gap-0 p-0 lg:col-span-2">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-sm font-semibold">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 p-4 sm:grid-cols-3">
            {pendingActions.map((a) => (
              <PendingActionRow key={a.label} action={a} />
            ))}
          </CardContent>
        </Card>

        <Card className="gap-0 p-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 p-4">
            <Button variant="outline" className="justify-start gap-2.5 font-medium" onClick={() => setAddOpen(true)}>
              <UserPlus className="text-primary size-4" />
              Add Employee
            </Button>
            <Button variant="outline" className="justify-start gap-2.5 font-medium" onClick={() => navigate("/admin/leaves")}>
              <BadgeCheck className="text-warning size-4" />
              Approve Leave
              <span className="text-muted-foreground ml-auto text-xs">{pendingLeaves.length} pending</span>
            </Button>
            <Button variant="outline" className="justify-start gap-2.5 font-medium" onClick={handleGeneratePayroll}>
              <Wallet className="text-secondary size-4" />
              Generate Payroll
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2.5 font-medium"
              onClick={() => {
                toast.success("Reports exported", { description: "Your report bundle is being prepared." })
                navigate("/admin/reports")
              }}
            >
              <FileDown className="text-info size-4" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </section>

      <ChartCard
        title="Employee Attendance Trend"
        subtitle="Present employees · last 7 working days"
        action={<LegendItem color="var(--chart-1)" label="Present" />}
      >
        <AreaTrend
          data={attendanceTrend}
          series={[{ key: "present", name: "Present", color: "var(--chart-1)" }]}
          height={240}
        />
      </ChartCard>

      <DataTable<Employee>
        data={employees}
        keyExtractor={(e) => e.id}
        pageSize={8}
        searchIndex={(e) => `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.designation}`}
        emptyMessage="No employees found"
        emptyDescription="Try adjusting your search or filters."
        onRowClick={(e) => navigate(`/admin/employees/${e.id}`)}
        columns={[
          {
            key: "name",
            header: "Employee",
            sortable: true,
            sortValue: (e) => `${e.firstName} ${e.lastName}`,
            render: (e) => (
              <div className="flex items-center gap-3">
                <Avatar name={`${e.firstName} ${e.lastName}`} size="sm" />
                <div>
                  <p className="font-medium">
                    {e.firstName} {e.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">{e.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "department",
            header: "Department",
            sortable: true,
            sortValue: (e) => e.department,
            render: (e) => (
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: departments.find((d) => d.name === e.department)?.color }}
                />
                {e.department}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (e) =>
              isProbation(e) ? (
                <Badge variant="warning">Probation</Badge>
              ) : (
                <Badge variant="success">Active</Badge>
              ),
          },
          {
            key: "attendance",
            header: "Attendance",
            sortable: true,
            sortValue: (e) => attendanceByEmp.get(e.id) ?? 0,
            render: (e) => (
              <span className="font-medium">{attendanceByEmp.get(e.id) ?? 0}%</span>
            ),
          },
          {
            key: "leaveBalance",
            header: "Leave Balance",
            sortable: true,
            sortValue: (e) => leaveBalanceByEmp.get(e.id) ?? 0,
            render: (e) => (
              <span className="text-muted-foreground text-sm">
                {leaveBalanceByEmp.get(e.id) ?? 0} days
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (e) => (
              <Button size="sm" variant="outline" onClick={(ev) => { ev.stopPropagation(); navigate(`/admin/employees/${e.id}`) }}>
                View
              </Button>
            ),
          },
        ]}
      />

      <Card className="gap-0 p-0">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/reports")}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <MinimalTimeline activities={activities} limit={5} />
        </CardContent>
      </Card>

      <AddEmployeeDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
