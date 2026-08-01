import { useMemo, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  Download,
  FileText,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Siren,
  User,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { AttendanceCalendar } from "@/components/shared/attendance-calendar"
import { AreaTrend, ChartCard } from "@/components/shared/charts"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate, formatTime, toISODate } from "@/lib/format"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import type { Employee } from "@/data/types"
import { downloadCsv } from "@/lib/exportCsv"

function InfoRow({
  label,
  value,
  locked = false,
}: {
  label: string
  value: string
  locked?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-muted-foreground shrink-0 text-[13px]">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-[13px] font-medium">
        {value}
        {locked && (
          <Lock className="text-muted-foreground/50 size-3 shrink-0" aria-label="Locked field" />
        )}
      </span>
    </div>
  )
}

export function ProfileView({ employeeId, fullEdit = false }: { employeeId: string; fullEdit?: boolean }) {
  const { user } = useAuth()
  const {
    getEmployee,
    getEmployeeAttendance,
    getEmployeeLeaves,
    getEmployeePayroll,
    updateProfile,
    employees,
    departments,
  } = useData()
  const employee = getEmployee(employeeId)
  const attendance = getEmployeeAttendance(employeeId)
  const leaves = getEmployeeLeaves(employeeId)
  const payrollRecs = getEmployeePayroll(employeeId)
  const isSelf = user?.id === employeeId
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const canEdit = fullEdit || isSelf

  const salaryTrend = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return [...payrollRecs]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((p) => {
        const [, m] = p.month.split("-")
        return { name: monthNames[Number(m) - 1], net: p.net }
      })
  }, [payrollRecs])

  if (!employee) return null

  const netSalary = payrollRecs.find((p) => p.month === toISODate(new Date()).slice(0, 7))
  const totalDocs = employee.documents.length
  const verifiedDocs = employee.documents.filter((d) => d.verified).length

  return (
    <div className="space-y-6">
      <Card className="relative gap-0 overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary via-indigo-500 to-secondary relative h-32 sm:h-40">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-8 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
        </div>
        <CardContent className="px-6 pt-0 pb-6">
          <div className="relative -mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar
                  name={`${employee.firstName} ${employee.lastName}`}
                  size="xl"
                  className="size-24 text-3xl ring-4 ring-card shadow-xl"
                  image={previewImage}
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditOpen(true)
                      setActiveTab("overview")
                    }}
                    className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                    aria-label="Change photo"
                  >
                    <Camera className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <Badge variant={employee.role === "admin" ? "secondary" : "info"}>
                    {employee.role === "admin" ? "Administrator" : "Employee"}
                  </Badge>
                  <Badge variant="outline" className="font-mono">{employee.id}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {employee.designation} · {employee.department}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {employee.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> {employee.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {employee.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-1">
              <div className="w-40">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Profile</span>
                  <span className="font-semibold">{employee.profileCompletion}%</span>
                </div>
                <Progress value={employee.profileCompletion} className="h-1.5" />
              </div>
              {canEdit && (
                <Button onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  {fullEdit ? "Edit Profile" : "Edit Details"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Joining Date", value: formatDate(employee.joiningDate), icon: CalendarDays },
              { label: "Manager", value: employee.manager, icon: GraduationCap },
              { label: "Department", value: employee.department, icon: Building2 },
              { label: "Net Salary", value: netSalary ? formatCurrency(netSalary.net) : "—", icon: Wallet },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-muted/40 px-3.5 py-3">
                <p className="text-muted-foreground text-[11px] font-medium">{s.label}</p>
                <p className="mt-1 truncate text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 p-1.5">
          {[
            { key: "overview", label: "Overview", icon: User },
            { key: "attendance", label: "Attendance", icon: BadgeCheck },
            { key: "leaves", label: "Leave History", icon: CalendarDays },
            { key: "payroll", label: "Payroll", icon: Wallet },
            { key: "documents", label: "Documents", icon: FileText },
          ].map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
              <t.icon className="size-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-5 py-1">
                <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} locked={!fullEdit} />
                <InfoRow label="Gender" value={employee.gender} locked={!fullEdit} />
                <InfoRow label="Blood Group" value={employee.bloodGroup} locked={!fullEdit} />
                <InfoRow label="Employee ID" value={employee.id} locked />
                <InfoRow label="Joining Date" value={formatDate(employee.joiningDate)} locked={!fullEdit} />
              </CardContent>
            </Card>

            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-5 py-1">
                <InfoRow label="Email" value={employee.email} locked={!fullEdit} />
                <InfoRow label="Phone" value={employee.phone} locked={!fullEdit && !isSelf} />
                <InfoRow label="Address" value={`${employee.address}, ${employee.city}`} locked={!fullEdit && !isSelf} />
                <InfoRow label="Emergency Contact" value={`${employee.emergencyContact.name} (${employee.emergencyContact.relation})`} locked={!fullEdit && !isSelf} />
                <InfoRow label="Emergency Phone" value={employee.emergencyContact.phone || "—"} locked={!fullEdit && !isSelf} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">Employment</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-5 py-1">
                <InfoRow label="Department" value={employee.department} locked={!fullEdit} />
                <InfoRow label="Designation" value={employee.designation} locked={!fullEdit} />
                <InfoRow label="Manager" value={employee.manager} locked={!fullEdit} />
                <InfoRow label="Employment Type" value="Full-time" locked />
              </CardContent>
            </Card>

            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">Salary Structure</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-1">
                <div className="divide-y">
                  <InfoRow label="Basic Salary" value={formatCurrency(employee.salary.basic)} locked={!fullEdit} />
                  <InfoRow label="Allowances" value={formatCurrency(employee.salary.allowances)} locked={!fullEdit} />
                  <InfoRow label="Bonus" value={formatCurrency(employee.salary.bonus)} locked={!fullEdit} />
                  <InfoRow label="Tax" value={`-${formatCurrency(employee.salary.tax)}`} locked={!fullEdit} />
                  <InfoRow label="Deductions" value={`-${formatCurrency(employee.salary.deductions)}`} locked={!fullEdit} />
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-semibold">Net Salary</span>
                  <span className="text-primary text-base font-bold">
                    {formatCurrency(employee.salary.basic + employee.salary.allowances + employee.salary.bonus - employee.salary.tax - employee.salary.deductions)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="animate-fade-in space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <AttendanceCalendar records={attendance} />
              </CardContent>
            </Card>
            <ChartCard title="Hours Trend" subtitle="Daily working hours · last 30 days">
              <AreaTrend
                data={useMemo(() => {
                  const days: { name: string; hours: number }[] = []
                  for (let i = 29; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    if (d.getDay() === 0 || d.getDay() === 6) continue
                    const rec = attendance.find((a) => a.date === toISODate(d))
                    days.push({
                      name: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
                      hours: rec?.workingHours ?? 0,
                    })
                  }
                  return days
                }, [attendance])}
                series={[{ key: "hours", name: "Hours", color: "var(--chart-2)" }]}
                height={240}
                valueFormat={(v) => `${v}h`}
              />
            </ChartCard>
          </div>
          <Card className="gap-0 p-0">
            <CardHeader className="border-b py-3.5">
              <CardTitle className="text-sm font-semibold">Attendance History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                className="p-4"
                data={[...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)}
                keyExtractor={(r) => r.id}
                pageSize={8}
                searchIndex={(r) => `${r.date} ${r.status}`}
                onExport={() =>
                  downloadCsv(
                    `attendance-${employee.id}.csv`,
                    ["Date", "Check In", "Check Out", "Hours", "Status"],
                    attendance.map((r) => [r.date, formatTime(r.checkIn), formatTime(r.checkOut), r.workingHours, r.status])
                  )
                }
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
                    render: (r) => formatTime(r.checkIn),
                  },
                  {
                    key: "out",
                    header: "Check Out",
                    render: (r) => formatTime(r.checkOut),
                  },
                  {
                    key: "hours",
                    header: "Hours",
                    sortable: true,
                    sortValue: (r) => r.workingHours,
                    render: (r) => `${r.workingHours.toFixed(2)}h`,
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
        </TabsContent>

        <TabsContent value="leaves" className="animate-fade-in">
          <Card className="gap-0 p-0">
            <CardHeader className="border-b py-3.5">
              <CardTitle className="text-sm font-semibold">Leave History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                className="p-4"
                data={leaves}
                keyExtractor={(l) => l.id}
                pageSize={8}
                searchIndex={(l) => `${l.type} ${l.reason} ${l.status}`}
                columns={[
                  {
                    key: "id",
                    header: "Ref",
                    render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.id}</span>,
                  },
                  {
                    key: "type",
                    header: "Type",
                    sortable: true,
                    sortValue: (l) => l.type,
                    render: (l) => <span className="capitalize font-medium">{l.type.replace("_", " ")}</span>,
                  },
                  {
                    key: "start",
                    header: "Period",
                    render: (l) => `${formatDate(l.startDate)} → ${formatDate(l.endDate)}`,
                  },
                  {
                    key: "applied",
                    header: "Applied",
                    sortable: true,
                    sortValue: (l) => l.appliedOn,
                    render: (l) => formatDate(l.appliedOn),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (l) => <StatusBadge status={l.status} />,
                  },
                  {
                    key: "reason",
                    header: "Reason",
                    className: "max-w-[240px] truncate",
                    render: (l) => <span className="truncate">{l.reason}</span>,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="animate-fade-in space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="relative gap-0 overflow-hidden p-0">
              <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
                <p className="text-sm font-medium text-white/80">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} Payslip
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {netSalary ? formatCurrency(netSalary.net) : "—"}
                </p>
                <p className="mt-1 text-xs text-white/70">Net pay after deductions</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 bg-white text-primary hover:bg-white/90"
                  onClick={() => toast.success("Payslip downloaded", { description: "PDF saved to downloads." })}
                >
                  <Download className="size-4" />
                  Download Payslip
                </Button>
              </div>
            </Card>
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3.5">
                <CardTitle className="text-sm font-semibold">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-1">
                <InfoRow label="Basic Salary" value={formatCurrency(employee.salary.basic)} />
                <InfoRow label="Allowances" value={formatCurrency(employee.salary.allowances)} />
                <InfoRow label="Bonus" value={formatCurrency(employee.salary.bonus)} />
                <InfoRow label="Tax Deducted" value={`-${formatCurrency(employee.salary.tax)}`} />
                <InfoRow label="Other Deductions" value={`-${formatCurrency(employee.salary.deductions)}`} />
              </CardContent>
            </Card>
          </div>

          <ChartCard title="Salary Trend" subtitle="Net pay · last 6 months">
            <AreaTrend
              data={salaryTrend}
              series={[{ key: "net", name: "Net Salary", color: "var(--chart-1)" }]}
              height={240}
              valueFormat={(v) => formatCurrency(v)}
            />
          </ChartCard>
        </TabsContent>

        <TabsContent value="documents" className="animate-fade-in">
          <Card className="gap-0 p-0">
            <CardHeader className="flex-row items-center justify-between border-b py-3.5">
              <CardTitle className="text-sm font-semibold">
                Documents · {verifiedDocs}/{totalDocs} verified
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success("Document uploaded", { description: "The document has been sent for verification." })
                }
              >
                Upload
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {employee.documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Uploaded documents will appear here."
                  compact
                />
              ) : (
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-md"
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <FileText className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {doc.category} · {doc.size} · {formatDate(doc.uploadedOn)}
                        </p>
                      </div>
                      {doc.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.success("Download started", { description: doc.name })}
                        aria-label={`Download ${doc.name}`}
                      >
                        <Download className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        fullEdit={fullEdit}
        departments={departments.map((d) => d.name)}
        onSave={(patch) => {
          updateProfile(employee.id, patch)
          toast.success("Profile updated", { description: "Your changes have been saved." })
        }}
        onPhoto={(url) => {
          setPreviewImage(url)
          toast.success("Photo updated", { description: "Your profile picture has been changed." })
        }}
      />
    </div>
  )
}

function ProfileEditDialog({
  open,
  onOpenChange,
  employee,
  fullEdit,
  departments,
  onSave,
  onPhoto,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  employee: Employee
  fullEdit: boolean
  departments: string[]
  onSave: (patch: Partial<Employee>) => void
  onPhoto: (url: string) => void
}) {
  const [form, setForm] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    address: employee.address,
    city: employee.city,
    gender: employee.gender,
    bloodGroup: employee.bloodGroup,
    designation: employee.designation,
    department: employee.department,
    joiningDate: employee.joiningDate,
    emergencyName: employee.emergencyContact.name,
    emergencyPhone: employee.emergencyContact.phone,
    emergencyRelation: employee.emergencyContact.relation,
    basic: employee.salary.basic,
    allowances: employee.salary.allowances,
  })

  const handlePhoto = (file: File | null) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    onPhoto(url)
  }

  const save = () => {
    onSave({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      designation: form.designation,
      department: form.department,
      joiningDate: form.joiningDate,
      emergencyContact: {
        name: form.emergencyName,
        phone: form.emergencyPhone,
        relation: form.emergencyRelation,
      },
      salary: { ...employee.salary, basic: Number(form.basic) || employee.salary.basic, allowances: Number(form.allowances) || employee.salary.allowances },
    })
    onOpenChange(false)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{fullEdit ? "Edit Profile" : "Update Your Details"}</DialogTitle>
          <DialogDescription>
            {fullEdit
              ? "Full access — all fields are editable."
              : "You can edit your photo, phone and address. Other fields are managed by HR."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={`${employee.firstName} ${employee.lastName}`} size="lg" />
            <label className="hover:border-primary flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 text-sm transition-colors">
              <Camera className="text-muted-foreground size-4" />
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-muted-foreground text-xs">
              JPG or PNG. Square works best.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {!fullEdit ? (
              <>
                <div className="grid gap-1.5">
                  <Label>Phone</Label>
                  <Input {...field("phone")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>City</Label>
                  <Input {...field("city")} />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Address</Label>
                  <Input {...field("address")} />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Emergency Contact</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Name" {...field("emergencyName")} />
                    <Input placeholder="Phone" {...field("emergencyPhone")} />
                    <Input placeholder="Relation" {...field("emergencyRelation")} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <Label>First Name</Label>
                  <Input {...field("firstName")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Last Name</Label>
                  <Input {...field("lastName")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" {...field("email")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Phone</Label>
                  <Input {...field("phone")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Designation</Label>
                  <Input {...field("designation")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Joining Date</Label>
                  <Input type="date" {...field("joiningDate")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Male", "Female", "Other"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Blood Group</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Address</Label>
                  <Input {...field("address")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>City</Label>
                  <Input {...field("city")} />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Emergency Contact</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Name" {...field("emergencyName")} />
                    <Input placeholder="Phone" {...field("emergencyPhone")} />
                    <Input placeholder="Relation" {...field("emergencyRelation")} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Basic Salary (USD)</Label>
                  <Input type="number" {...field("basic")} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Allowances (USD)</Label>
                  <Input type="number" {...field("allowances")} />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Pencil className="size-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
