import { useMemo, useState } from "react"
import {
  AlarmClock,
  CalendarCheck,
  CalendarX2,
  Clock,
  Moon,
  Pencil,
  Sun,
} from "lucide-react"
import { toast } from "sonner"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
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
import { formatTime, toISODate } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import type { AttendanceRecord, AttendanceStatus } from "@/data/types"

export function AdminAttendancePage() {
  const {
    employees,
    attendance,
    departments,
    getEmployee,
    editAttendance,
  } = useData()
  const loading = useDelayedLoading(600)
  const [deptFilter, setDeptFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState(toISODate(new Date()))
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)

  const dayRecords = useMemo(() => {
    const byEmployee = new Map(
      attendance.filter((a) => a.date === dateFilter).map((a) => [a.employeeId, a])
    )
    const rows = employees.map((emp) => {
      const rec = byEmployee.get(emp.id)
      const isWeekend =
        new Date(dateFilter + "T00:00:00").getDay() === 0 ||
        new Date(dateFilter + "T00:00:00").getDay() === 6
      return {
        emp,
        record: rec,
        isWeekend,
        status: rec?.status ?? (isWeekend ? ("leave" as const) : ("absent" as const)),
      }
    })
    if (deptFilter !== "all") return rows.filter((r) => r.emp.department === deptFilter)
    if (statusFilter !== "all") return rows.filter((r) => r.status === statusFilter)
    return rows
  }, [employees, attendance, dateFilter, deptFilter, statusFilter])

  const stats = useMemo(() => {
    const present = dayRecords.filter((r) => r.status === "present" || r.status === "late").length
    const absent = dayRecords.filter((r) => r.status === "absent").length
    const halfDay = dayRecords.filter((r) => r.status === "half_day").length
    const leave = dayRecords.filter((r) => r.status === "leave").length
    const late = dayRecords.filter((r) => r.status === "late").length
    const hours =
      dayRecords.reduce((s, r) => s + (r.record?.workingHours ?? 0), 0) /
      Math.max(1, present)
    return { present, absent, halfDay, leave, late, hours }
  }, [dayRecords])

  const exportAttendance = () =>
    downloadCsv(
      `attendance-${dateFilter}.csv`,
      ["ID", "Name", "Department", "Date", "Check In", "Check Out", "Hours", "Status"],
      dayRecords.map((r) => [
        r.emp.id,
        `${r.emp.firstName} ${r.emp.lastName}`,
        r.emp.department,
        dateFilter,
        r.record?.checkIn ?? "",
        r.record?.checkOut ?? "",
        r.record?.workingHours?.toFixed(2) ?? "",
        r.status,
      ])
    )

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Monitor daily attendance across the organization and make corrections."
        breadcrumbs={[{ label: "Management" }, { label: "Attendance" }]}
        actions={
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
            aria-label="Filter by date"
          />
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Present" value={stats.present} icon={CalendarCheck} tone="success" description={dateFilter} />
        <StatCard label="Absent" value={stats.absent} icon={CalendarX2} tone="danger" description="Unexcused" />
        <StatCard label="Half Day" value={stats.halfDay} icon={Sun} tone="warning" description="Partial day" />
        <StatCard label="On Leave" value={stats.leave} icon={Moon} tone="info" description="Approved" />
        <StatCard label="Late Arrivals" value={stats.late} icon={AlarmClock} tone="warning" description="After 9:10 AM" />
        <StatCard label="Avg Hours" value={stats.hours} icon={Clock} tone="secondary" format={(n) => `${n.toFixed(1)}h`} description="Per present employee" />
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
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="leave">On Leave</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={dayRecords}
        keyExtractor={(r) => r.emp.id}
        pageSize={10}
        searchIndex={(r) => `${r.emp.firstName} ${r.emp.lastName} ${r.emp.email} ${r.emp.department} ${r.emp.designation}`}
        onExport={exportAttendance}
        columns={[
          {
            key: "name",
            header: "Employee",
            sortable: true,
            sortValue: (r) => `${r.emp.firstName} ${r.emp.lastName}`,
            render: (r) => (
              <div className="flex items-center gap-3">
                <Avatar name={`${r.emp.firstName} ${r.emp.lastName}`} size="sm" />
                <div>
                  <p className="font-medium">{r.emp.firstName} {r.emp.lastName}</p>
                  <p className="text-muted-foreground text-xs">{r.emp.designation}</p>
                </div>
              </div>
            ),
          },
          {
            key: "dept",
            header: "Department",
            render: (r) => (
              <span className="flex items-center gap-1.5 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ background: departments.find((d) => d.name === r.emp.department)?.color }}
                />
                {r.emp.department}
              </span>
            ),
          },
          {
            key: "in",
            header: "Check In",
            render: (r) => <span className="font-medium">{formatTime(r.record?.checkIn ?? null)}</span>,
          },
          {
            key: "out",
            header: "Check Out",
            render: (r) => formatTime(r.record?.checkOut ?? null),
          },
          {
            key: "hours",
            header: "Hours",
            sortable: true,
            sortValue: (r) => r.record?.workingHours ?? 0,
            render: (r) =>
              r.record?.workingHours ? `${r.record.workingHours.toFixed(2)}h` : <span className="text-muted-foreground">—</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (r) => (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(r.record ?? null)}
                aria-label={`Edit ${r.emp.firstName} ${r.emp.lastName} attendance`}
              >
                <Pencil className="size-4" />
              </Button>
            ),
          },
        ]}
      />

      <AttendanceEditDialog
        record={editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null)
        }}
        onSave={(patch) => {
          if (!editing) return
          editAttendance(editing.id, patch)
          const emp = getEmployee(editing.employeeId)
          toast.success("Attendance updated", {
            description: `${emp?.firstName} ${emp?.lastName}'s record has been corrected.`,
          })
          setEditing(null)
        }}
      />
    </div>
  )
}

function AttendanceEditDialog({
  record,
  onOpenChange,
  onSave,
}: {
  record: AttendanceRecord | null
  onOpenChange: (o: boolean) => void
  onSave: (patch: Partial<AttendanceRecord>) => void
}) {
  const { getEmployee } = useData()
  const [status, setStatus] = useState<AttendanceStatus>("present")
  const [checkIn, setCheckIn] = useState("09:00")
  const [checkOut, setCheckOut] = useState("18:00")

  const open = !!record
  const employee = record ? getEmployee(record.employeeId) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={() => {
          if (record) {
            setStatus(record.status)
            setCheckIn(record.checkIn ?? "09:00")
            setCheckOut(record.checkOut ?? "18:00")
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            {employee?.firstName} {employee?.lastName} · {record?.date}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Check In</Label>
            <Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Check Out</Label>
            <Input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                status,
                checkIn: status === "present" || status === "late" || status === "half_day" ? checkIn || null : null,
                checkOut: status === "present" || status === "late" || status === "half_day" ? checkOut || null : null,
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
