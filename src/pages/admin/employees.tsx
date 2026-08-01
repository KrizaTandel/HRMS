import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, TrendingUp, UserPlus, Users, Wallet } from "lucide-react"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AddEmployeeDialog } from "@/components/shared/add-employee-dialog"
import { PageLoader } from "@/components/shared/skeletons"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import { monthKey } from "@/lib/format"
import type { Employee } from "@/data/types"

export function AdminEmployeesPage() {
  const navigate = useNavigate()
  const { employees, departments, payrollRecords } = useData()
  const loading = useDelayedLoading(600)
  const [addOpen, setAddOpen] = useState(false)
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    let rows = employees
    if (deptFilter !== "all") rows = rows.filter((e) => e.department === deptFilter)
    if (statusFilter === "active" || statusFilter === "probation") {
      const isProbation = (e: Employee) =>
        Date.now() - new Date(e.joiningDate + "T00:00:00").getTime() < 90 * 86400000
      rows = rows.filter((e) =>
        statusFilter === "probation" ? isProbation(e) : !isProbation(e)
      )
    }
    return rows
  }, [employees, deptFilter, statusFilter])

  const monthlyPayroll = useMemo(() => {
    const month = monthKey()
    return payrollRecords
      .filter((p) => p.month === month)
      .reduce((s, p) => s + p.net, 0)
  }, [payrollRecords])

  const newHires = employees.filter((e) => Date.now() - new Date(e.joiningDate + "T00:00:00").getTime() < 30 * 86400000).length

  const exportEmployees = () =>
    downloadCsv(
      "employees.csv",
      ["ID", "Name", "Email", "Department", "Designation", "City", "Joining Date", "Net Salary"],
      filtered.map((e) => [
        e.id,
        `${e.firstName} ${e.lastName}`,
        e.email,
        e.department,
        e.designation,
        e.city,
        e.joiningDate,
        e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions,
      ])
    )

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`Manage your workforce of ${employees.length} people across ${departments.length} departments.`}
        breadcrumbs={[{ label: "Management" }, { label: "Employees" }]}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            Add Employee
          </Button>
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Employees" value={employees.length} icon={Users} tone="primary" description="Active workforce" />
        <StatCard label="Departments" value={departments.length} icon={Building2} tone="secondary" description="Across the org" />
        <StatCard label="New Hires" value={newHires} icon={TrendingUp} tone="success" description="Last 30 days" />
        <StatCard label="Monthly Payroll" value={monthlyPayroll} icon={Wallet} tone="warning" format={(n) => formatCurrency(n, true)} description={monthKey()} />
      </section>

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<Employee>
        data={filtered}
        keyExtractor={(e) => e.id}
        pageSize={10}
        searchIndex={(e) => `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.designation} ${e.id}`}
        onExport={exportEmployees}
        exportLabel="Export CSV"
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
                  <p className="font-medium">{e.firstName} {e.lastName}</p>
                  <p className="text-muted-foreground text-xs">{e.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "id",
            header: "ID",
            render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.id}</span>,
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
            key: "designation",
            header: "Designation",
            sortable: true,
            sortValue: (e) => e.designation,
            render: (e) => e.designation,
          },
          {
            key: "joining",
            header: "Joined",
            sortable: true,
            sortValue: (e) => e.joiningDate,
            render: (e) => formatDate(e.joiningDate),
          },
          {
            key: "net",
            header: "Net Salary",
            align: "right",
            sortable: true,
            sortValue: (e) => e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions,
            render: (e) => (
              <span className="font-medium">
                {formatCurrency(e.salary.basic + e.salary.allowances + e.salary.bonus - e.salary.tax - e.salary.deductions)}
              </span>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (e) => (
              <Badge variant={e.role === "admin" ? "secondary" : "muted"}>
                {e.role === "admin" ? "Admin" : "Employee"}
              </Badge>
            ),
          },
          {
            key: "profile",
            header: "Profile",
            render: (e) => (
              <span className="text-xs">
                <span className="font-semibold">{e.profileCompletion}%</span>
                <span className="text-muted-foreground"> complete</span>
              </span>
            ),
          },
        ]}
      />

      <AddEmployeeDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
