import { useMemo, useState } from "react"
import { Banknote, FileDown, ReceiptText, Users, Wallet, Pencil, Zap } from "lucide-react"
import { toast } from "sonner"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { BarTrend, ChartCard, LegendItem } from "@/components/shared/charts"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, monthKey } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import type { Employee } from "@/data/types"

export function AdminPayrollPage() {
  const {
    employees,
    payrollRecords,
    departments,
    updateEmployee,
    generatePayroll,
  } = useData()
  const loading = useDelayedLoading(600)
  const [deptFilter, setDeptFilter] = useState("all")
  const [editing, setEditing] = useState<Employee | null>(null)

  const month = monthKey()
  const monthRecords = useMemo(
    () => payrollRecords.filter((p) => p.month === month),
    [payrollRecords, month]
  )

  const stats = useMemo(() => {
    const total = monthRecords.reduce((s, p) => s + p.net, 0)
    const deductions = monthRecords.reduce((s, p) => s + p.tax + p.deductions, 0)
    const avg = monthRecords.length ? total / monthRecords.length : 0
    return { total, deductions, avg, count: monthRecords.length }
  }, [monthRecords])

  const deptSummary = useMemo(
    () =>
      departments.map((d) => {
        const net = monthRecords
          .filter((p) => employees.find((e) => e.id === p.employeeId)?.department === d.name)
          .reduce((s, p) => s + p.net, 0)
        return { name: d.name.split(" ")[0], value: Math.round(net / 1000) }
      }),
    [departments, monthRecords, employees]
  )

  const filtered = useMemo(() => {
    if (deptFilter === "all") return employees
    return employees.filter((e) => e.department === deptFilter)
  }, [employees, deptFilter])

  const handleGenerate = () => {
    generatePayroll()
    toast.success("Payroll generated", {
      description: `${employees.length} payslips generated for ${month}.`,
    })
  }

  const handleIndividualPayslip = (emp: Employee) => {
    toast.success("Payslip generated", {
      description: `${emp.firstName} ${emp.lastName}'s payslip for ${month} is ready.`,
    })
  }

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Manage salaries, generate payslips and review the monthly payroll."
        breadcrumbs={[{ label: "Management" }, { label: "Payroll" }]}
        actions={
          <Button onClick={handleGenerate}>
            <Zap className="size-4" />
            Generate Payroll
          </Button>
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Monthly Payroll"
          value={stats.total}
          icon={Wallet}
          tone="primary"
          format={(n) => formatCurrency(n, true)}
          description={month}
        />
        <StatCard
          label="Average Salary"
          value={stats.avg}
          icon={Banknote}
          tone="secondary"
          format={(n) => formatCurrency(n)}
          description="Net per employee"
        />
        <StatCard
          label="Employees Paid"
          value={stats.count}
          icon={Users}
          tone="success"
          suffix={`/ ${employees.length}`}
          description="This month"
        />
        <StatCard
          label="Total Deductions"
          value={stats.deductions}
          icon={ReceiptText}
          tone="warning"
          format={(n) => formatCurrency(n, true)}
          description="Tax + other"
        />
      </section>

      <ChartCard
        title="Payroll by Department"
        subtitle="Net payroll (thousands USD) per department"
        action={<LegendItem color="var(--chart-2)" label="Net ($K)" />}
      >
        <BarTrend
          data={deptSummary}
          xKey="name"
          series={[{ key: "value", name: "Net ($K)", color: "var(--chart-2)" }]}
          height={240}
        />
      </ChartCard>

      <div className="flex flex-wrap gap-2">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.name} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<Employee>
        data={filtered}
        keyExtractor={(e) => e.id}
        pageSize={10}
        searchIndex={(e) => `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.id}`}
        onExport={() =>
          downloadCsv(
            `payroll-${month}.csv`,
            ["ID", "Name", "Department", "Basic", "Allowances", "Bonus", "Tax", "Deductions", "Net", "Status"],
            filtered.map((e) => {
              const rec = monthRecords.find((p) => p.employeeId === e.id)
              return [
                e.id,
                `${e.firstName} ${e.lastName}`,
                e.department,
                e.salary.basic,
                e.salary.allowances,
                e.salary.bonus,
                e.salary.tax,
                e.salary.deductions,
                rec?.net ?? e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions,
                rec?.status ?? "draft",
              ]
            })
          )
        }
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
                  <p className="font-medium">{e.firstName} {e.lastName}</p>
                  <p className="text-muted-foreground text-xs">{e.department}</p>
                </div>
              </div>
            ),
          },
          {
            key: "basic",
            header: "Basic",
            align: "right",
            sortable: true,
            sortValue: (e) => e.salary.basic,
            render: (e) => formatCurrency(e.salary.basic),
          },
          {
            key: "allowances",
            header: "Allowances",
            align: "right",
            render: (e) => formatCurrency(e.salary.allowances),
          },
          {
            key: "bonus",
            header: "Bonus",
            align: "right",
            render: (e) => formatCurrency(e.salary.bonus),
          },
          {
            key: "deductions",
            header: "Deductions",
            align: "right",
            render: (e) => (
              <span className="text-destructive">
                -{formatCurrency(e.salary.tax + e.salary.deductions)}
              </span>
            ),
          },
          {
            key: "net",
            header: "Net Pay",
            align: "right",
            sortable: true,
            sortValue: (e) =>
              e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions,
            render: (e) => (
              <span className="font-bold">
                {formatCurrency(e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (e) => {
              const rec = monthRecords.find((p) => p.employeeId === e.id)
              return <StatusBadge status={rec?.status ?? "draft"} />
            },
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (e) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => handleIndividualPayslip(e)} aria-label={`Generate payslip for ${e.firstName}`}>
                  <FileDown className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(e)} aria-label={`Edit salary for ${e.firstName}`}>
                  <Pencil className="size-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <SalaryEditDialog
        employee={editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null)
        }}
        onSave={(salary) => {
          if (!editing) return
          updateEmployee(editing.id, { salary })
          toast.success("Salary updated", {
            description: `${editing.firstName} ${editing.lastName}'s salary structure has been updated.`,
          })
          setEditing(null)
        }}
      />
    </div>
  )
}

function SalaryEditDialog({
  employee,
  onOpenChange,
  onSave,
}: {
  employee: Employee | null
  onOpenChange: (o: boolean) => void
  onSave: (salary: Employee["salary"]) => void
}) {
  const [form, setForm] = useState({ basic: "0", allowances: "0", bonus: "0", tax: "0", deductions: "0" })
  const open = !!employee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={() => {
          if (employee) {
            setForm({
              basic: String(employee.salary.basic),
              allowances: String(employee.salary.allowances),
              bonus: String(employee.salary.bonus),
              tax: String(employee.salary.tax),
              deductions: String(employee.salary.deductions),
            })
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Salary Structure</DialogTitle>
          <DialogDescription>
            {employee?.firstName} {employee?.lastName} · {employee?.designation}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Basic Salary</Label>
            <Input type="number" value={form.basic} onChange={(e) => setForm((f) => ({ ...f, basic: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Allowances</Label>
            <Input type="number" value={form.allowances} onChange={(e) => setForm((f) => ({ ...f, allowances: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Bonus</Label>
            <Input type="number" value={form.bonus} onChange={(e) => setForm((f) => ({ ...f, bonus: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Tax</Label>
            <Input type="number" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Other Deductions</Label>
            <Input type="number" value={form.deductions} onChange={(e) => setForm((f) => ({ ...f, deductions: e.target.value }))} />
          </div>
          <div className="bg-muted/50 flex items-center justify-between rounded-xl px-4 py-3 sm:col-span-2">
            <span className="text-sm font-medium">Net Salary</span>
            <span className="text-primary text-base font-bold">
              {formatCurrency(
                Math.max(0, [form.basic, form.allowances, form.bonus].reduce((s, v) => s + (Number(v) || 0), 0) - (Number(form.tax) || 0) - (Number(form.deductions) || 0))
              )}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                basic: Number(form.basic) || 0,
                allowances: Number(form.allowances) || 0,
                bonus: Number(form.bonus) || 0,
                tax: Number(form.tax) || 0,
                deductions: Number(form.deductions) || 0,
              })
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
