import { useMemo, useState } from "react"
import { Banknote, Download, ReceiptText, TrendingUp, Wallet } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { AreaTrend, ChartCard, LegendItem } from "@/components/shared/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function EmployeePayrollPage() {
  const { user } = useAuth()
  const { getEmployeePayroll, getEmployee } = useData()
  const loading = useDelayedLoading(600)
  const [downloading, setDownloading] = useState(false)

  const employee = user ? getEmployee(user.id) : undefined
  const records = user ? getEmployeePayroll(user.id) : []
  const sorted = useMemo(() => [...records].sort((a, b) => b.month.localeCompare(a.month)), [records])
  const latest = sorted[0]
  const previous = sorted[1]

  const trend = useMemo(
    () =>
      [...records]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((p) => {
          const [, m] = p.month.split("-")
          return { name: MONTH_NAMES[Number(m) - 1], net: p.net }
        }),
    [records]
  )

  const annualEarnings = records.reduce((sum, r) => sum + r.net, 0)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      toast.success("Payslip downloaded", {
        description: `${latest?.month} payslip saved to your downloads.`,
      })
    }, 1200)
  }

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payroll"
        description="Review your salary structure, download payslips and view payment history."
        breadcrumbs={[{ label: "Workplace" }, { label: "Payroll" }]}
        actions={
          <Button onClick={handleDownload} disabled={!latest || downloading}>
            <Download className="size-4" />
            {downloading ? "Preparing..." : "Download Payslip"}
          </Button>
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Net Salary"
          value={latest?.net ?? 0}
          icon={Wallet}
          tone="primary"
          format={(n) => formatCurrency(n)}
          description={latest ? MONTH_NAMES[Number(latest.month.split("-")[1]) - 1] : "—"}
        />
        <StatCard
          label="Gross Pay"
          value={(latest?.basic ?? 0) + (latest?.allowances ?? 0) + (latest?.bonus ?? 0)}
          icon={Banknote}
          tone="secondary"
          format={(n) => formatCurrency(n)}
          description="Before deductions"
        />
        <StatCard
          label="Total Deductions"
          value={(latest?.tax ?? 0) + (latest?.deductions ?? 0)}
          icon={ReceiptText}
          tone="danger"
          format={(n) => formatCurrency(n)}
          description="Tax + deductions"
        />
        <StatCard
          label="Annual Earnings"
          value={annualEarnings}
          icon={TrendingUp}
          tone="success"
          format={(n) => formatCurrency(n)}
          description="Last 6 months"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 overflow-hidden p-0 lg:col-span-2">
          <div className="bg-gradient-to-br from-primary via-indigo-600 to-secondary p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/80">Latest Payslip</p>
                <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  {latest ? formatCurrency(latest.net) : "—"}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  {latest ? `${MONTH_NAMES[Number(latest.month.split("-")[1]) - 1]} ${latest.month.split("-")[0]}` : ""} · Net pay
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Paid to</p>
                <p className="mt-1 font-semibold">{employee?.firstName} {employee?.lastName}</p>
                <p className="text-xs text-white/70">{employee?.id}</p>
                <p className="mt-2">
                  {latest && <StatusBadge status={latest.status} />}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="mt-6 bg-white text-primary hover:bg-white/90"
              disabled={downloading}
            >
              <Download className="size-4" />
              {downloading ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
          <CardContent className="px-5 py-4">
            {latest && (
              <div className="grid gap-x-8 sm:grid-cols-2">
                <div className="divide-y">
                  <Row label="Basic Salary" value={formatCurrency(latest.basic)} />
                  <Row label="Allowances" value={formatCurrency(latest.allowances)} />
                  <Row label="Bonus" value={formatCurrency(latest.bonus)} />
                </div>
                <div className="divide-y">
                  <Row label="Income Tax" value={`-${formatCurrency(latest.tax)}`} negative />
                  <Row label="Other Deductions" value={`-${formatCurrency(latest.deductions)}`} negative />
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-semibold">Net Salary</span>
                    <span className="text-primary text-base font-bold">{formatCurrency(latest.net)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ChartCard
          title="Salary Trend"
          subtitle="Net pay · last 6 months"
          className="gap-0 p-0"
          action={<LegendItem color="var(--chart-1)" label="Net" />}
        >
          <AreaTrend
            data={trend}
            series={[{ key: "net", name: "Net Salary", color: "var(--chart-1)" }]}
            height={240}
            valueFormat={(v) => formatCurrency(v)}
          />
        </ChartCard>
      </div>

      <Card className="gap-0 p-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-sm font-semibold">Salary History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            className="p-4"
            data={sorted}
            keyExtractor={(p) => p.id}
            pageSize={6}
            searchIndex={(p) => `${p.month} ${p.status}`}
            onExport={() =>
              downloadCsv(
                "salary-history.csv",
                ["Month", "Basic", "Allowances", "Bonus", "Tax", "Deductions", "Net", "Status"],
                sorted.map((p) => [
                  p.month,
                  p.basic,
                  p.allowances,
                  p.bonus,
                  p.tax,
                  p.deductions,
                  p.net,
                  p.status,
                ])
              )
            }
            columns={[
              {
                key: "month",
                header: "Month",
                sortable: true,
                sortValue: (p) => p.month,
                render: (p) => (
                  <span className="font-semibold">
                    {MONTH_NAMES[Number(p.month.split("-")[1]) - 1]} {p.month.split("-")[0]}
                  </span>
                ),
              },
              {
                key: "basic",
                header: "Basic",
                align: "right",
                render: (p) => formatCurrency(p.basic),
              },
              {
                key: "allowances",
                header: "Allowances",
                align: "right",
                render: (p) => formatCurrency(p.allowances),
              },
              {
                key: "bonus",
                header: "Bonus",
                align: "right",
                render: (p) => formatCurrency(p.bonus),
              },
              {
                key: "deductions",
                header: "Deductions",
                align: "right",
                render: (p) => <span className="text-destructive">-{formatCurrency(p.tax + p.deductions)}</span>,
              },
              {
                key: "net",
                header: "Net Pay",
                align: "right",
                sortable: true,
                sortValue: (p) => p.net,
                render: (p) => <span className="font-bold">{formatCurrency(p.net)}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (p) => <StatusBadge status={p.status} />,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={negative ? "text-destructive text-sm font-medium" : "text-sm font-medium"}>
        {value}
      </span>
    </div>
  )
}
