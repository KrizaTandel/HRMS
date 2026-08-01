import { useMemo } from "react"
import { BarChart3, FileBarChart, FileDown, FileSpreadsheet, Printer } from "lucide-react"
import { toast } from "sonner"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import {
  AreaTrend,
  BarTrend,
  ChartCard,
  DonutChart,
  LegendItem,
} from "@/components/shared/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, monthKey } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import { monthlyCounts } from "@/lib/attendance"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function AdminReportsPage() {
  const {
    employees,
    departments,
    attendance,
    leaves,
    payrollRecords,
  } = useData()
  const loading = useDelayedLoading(600)

  const headcountData = useMemo(
    () =>
      departments.map((d) => ({
        name: d.name,
        value: d.employeeCount,
        color: d.color,
      })),
    [departments]
  )

  const payrollTrend = useMemo(() => {
    const rows: { name: string; net: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const total = payrollRecords.filter((p) => p.month === key).reduce((s, p) => s + p.net, 0)
      rows.push({ name: MONTHS[d.getMonth()], net: total })
    }
    return rows
  }, [payrollRecords])

  const attendanceRateTrend = useMemo(() => {
    const rows: { name: string; rate: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const records = attendance.filter((a) => {
        const ad = new Date(a.date + "T00:00:00")
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth()
      })
      const counts = monthlyCounts(records, d.getFullYear(), d.getMonth())
      const present = counts.present + counts.late
      const total = records.length || 1
      rows.push({ name: MONTHS[d.getMonth()], rate: Math.round((present / total) * 100) })
    }
    return rows
  }, [attendance])

  const leaveByType = useMemo(() => {
    const types = [
      { key: "paid", name: "Paid", color: "var(--chart-1)" },
      { key: "sick", name: "Sick", color: "var(--chart-2)" },
      { key: "casual", name: "Casual", color: "var(--chart-3)" },
      { key: "unpaid", name: "Unpaid", color: "var(--chart-5)" },
    ]
    const approved = leaves.filter((l) => l.status === "approved")
    return {
      data: types.map((t) => ({
        name: t.name,
        value: approved.filter((l) => l.type === t.key).length,
        color: t.color,
      })),
      total: approved.length,
    }
  }, [leaves])

  const exportReport = (type: string) => {
    downloadCsv(
      `${type}-report.csv`,
      ["Name", "Department", "Designation", "Email", "Net Salary"],
      employees.map((e) => [
        `${e.firstName} ${e.lastName}`,
        e.department,
        e.designation,
        e.email,
        e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions,
      ])
    )
    toast.success(`${type} report exported`, { description: "Your CSV is ready to download." })
  }

  if (loading) return <PageLoader variant="dashboard" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Deep-dive into workforce analytics and export reports for stakeholders."
        breadcrumbs={[{ label: "Management" }, { label: "Reports" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportReport("employees")}>
              <FileSpreadsheet className="size-4" />
              Employees CSV
            </Button>
            <Button variant="outline" onClick={() => exportReport("payroll")}>
              <FileDown className="size-4" />
              Payroll CSV
            </Button>
            <Button onClick={() => toast.success("Report bundle ready", { description: "PDF report generated for stakeholders." })}>
              <Printer className="size-4" />
              Print Report
            </Button>
          </div>
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Headcount"
          value={employees.length}
          icon={BarChart3}
          tone="primary"
          description={`${departments.length} departments`}
        />
        <StatCard
          label="Avg Attendance"
          value={attendanceRateTrend[attendanceRateTrend.length - 1]?.rate ?? 0}
          suffix="%"
          icon={FileBarChart}
          tone="success"
          description="Last month"
        />
        <StatCard
          label="Leaves Approved"
          value={leaveByType.total}
          icon={FileBarChart}
          tone="info"
          description="All time"
        />
        <StatCard
          label="Monthly Payroll"
          value={payrollTrend[payrollTrend.length - 1]?.net ?? 0}
          icon={FileBarChart}
          tone="secondary"
          format={(n) => formatCurrency(n, true)}
          description={monthKey()}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Payroll Trend"
          subtitle="Total net payroll · last 6 months"
          action={<LegendItem color="var(--chart-1)" label="Net ($)" />}
        >
          <AreaTrend
            data={payrollTrend}
            series={[{ key: "net", name: "Net Payroll", color: "var(--chart-1)" }]}
            height={250}
            valueFormat={(v) => formatCurrency(v, true)}
          />
        </ChartCard>
        <ChartCard
          title="Attendance Rate"
          subtitle="Company-wide attendance · last 6 months"
          action={<LegendItem color="var(--chart-2)" label="Rate (%)" />}
        >
          <AreaTrend
            data={attendanceRateTrend}
            series={[{ key: "rate", name: "Attendance %", color: "var(--chart-2)" }]}
            height={250}
            valueFormat={(v) => `${v}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Headcount by Department"
          subtitle="Employee distribution across teams"
          className="gap-0 p-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-1/2">
              <DonutChart
                data={headcountData}
                height={230}
                centerValue={String(employees.length)}
                centerLabel="Employees"
              />
            </div>
            <div className="flex-1 space-y-2.5">
              {headcountData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-2.5 rounded-[4px]" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Leave Utilization"
          subtitle="Approved leaves by type"
          className="gap-0 p-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-1/2">
              <DonutChart
                data={leaveByType.data}
                height={230}
                centerValue={String(leaveByType.total)}
                centerLabel="Leaves"
              />
            </div>
            <div className="flex-1 space-y-2.5">
              {leaveByType.data.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-2.5 rounded-[4px]" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <Card className="gap-0 p-0">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-sm font-semibold">Company Snapshot</CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportReport("snapshot")}>
            <FileDown className="size-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total headcount", value: String(employees.length) },
            { label: "Attrition rate", value: "4.2%" },
            { label: "Avg tenure", value: "2.8 yrs" },
            { label: "Women in workforce", value: `${Math.round((employees.filter((e) => e.gender === "Female").length / employees.length) * 100)}%` },
            { label: "Remote employees", value: "38%" },
            { label: "Open roles", value: "6" },
            { label: "Avg salary", value: formatCurrency(employees.reduce((s, e) => s + e.salary.basic, 0) / employees.length) },
            { label: "Overtime hours", value: "142h" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-muted-foreground text-[11px] font-medium">{item.label}</p>
              <p className="mt-1 text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
