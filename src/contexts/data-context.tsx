import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  activityFeed,
  allEmployees,
  attendanceRecords,
  departments as deptSeed,
  leaveRequests,
  messages as messageSeed,
  notifications as notificationSeed,
  payroll,
} from "@/data/mockData"
import type {
  Activity,
  AppNotification,
  AttendanceRecord,
  Department,
  Employee,
  LeaveRequest,
  LeaveType,
  Message,
  PayrollRecord,
} from "@/data/types"
import { toISODate, monthKey, hoursBetween, formatDate } from "@/lib/format"
import { approvedAccountEmployees } from "@/lib/accounts"
import { HR_INBOX, sendEmail } from "@/lib/emails"

export interface ApplyLeaveInput {
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  attachment?: string | null
}

export interface NewEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  city?: string
  salaryBasic: number
}

interface DataContextValue {
  employees: Employee[]
  attendance: AttendanceRecord[]
  leaves: LeaveRequest[]
  payrollRecords: PayrollRecord[]
  notifications: AppNotification[]
  messages: Message[]
  activities: Activity[]
  departments: Department[]

  getEmployee: (id: string) => Employee | undefined
  getEmployeeAttendance: (id: string) => AttendanceRecord[]
  getEmployeeLeaves: (id: string) => LeaveRequest[]
  getEmployeePayroll: (id: string) => PayrollRecord[]
  todayRecord: (id: string) => AttendanceRecord | undefined

  checkIn: (employeeId: string) => void
  checkOut: (employeeId: string) => void
  applyLeave: (input: ApplyLeaveInput) => LeaveRequest
  approveLeave: (id: string, comment?: string) => void
  rejectLeave: (id: string, comment?: string) => void
  updateProfile: (employeeId: string, patch: Partial<Employee>) => void
  addEmployee: (input: NewEmployeeInput) => Employee
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  editAttendance: (recordId: string, patch: Partial<AttendanceRecord>) => void
  generatePayroll: () => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  deleteNotification: (id: string) => void
  pushNotification: (n: { title: string; description: string; tone: AppNotification["tone"] }) => void
  markMessageRead: (id: string) => void
  pushActivity: (activity: Omit<Activity, "id" | "date">) => void
}

const DataContext = createContext<DataContextValue | null>(null)

let leaveCounter = 1000
let employeeCounter = 1000

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => [
    ...allEmployees,
    ...approvedAccountEmployees(),
  ])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(attendanceRecords)
  const [leaves, setLeaves] = useState<LeaveRequest[]>(leaveRequests)
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(payroll)
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationSeed)
  const [messages, setMessages] = useState<Message[]>(messageSeed)
  const [activities, setActivities] = useState<Activity[]>(activityFeed)
  const [departments] = useState<Department[]>(deptSeed)

  useEffect(() => {
    const sync = () => {
      const registered = approvedAccountEmployees()
      const ids = new Set(registered.map((e) => e.id))
      setEmployees((prev) => [...prev.filter((e) => !ids.has(e.id)), ...registered])
    }
    window.addEventListener("nexushr:accounts", sync)
    return () => window.removeEventListener("nexushr:accounts", sync)
  }, [])

  useEffect(() => {
    const syncApproved = () => {
      const approved = approvedAccountEmployees()
      setEmployees((prev) => {
        const existing = new Set(prev.map((e) => e.id))
        const fresh = approved.filter((e) => !existing.has(e.id))
        if (fresh.length === 0) return prev
        return [...fresh, ...prev]
      })
    }
    window.addEventListener("nexushr:accounts", syncApproved)
    return () => window.removeEventListener("nexushr:accounts", syncApproved)
  }, [])

  const pushActivity = useCallback((a: Omit<Activity, "id" | "date">) => {
    setActivities((prev) => [
      { ...a, id: `ACT-${Date.now()}`, date: new Date().toISOString() },
      ...prev.slice(0, 19),
    ])
  }, [])

  const getEmployee = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees]
  )

  const getEmployeeAttendance = useCallback(
    (id: string) => attendance.filter((a) => a.employeeId === id),
    [attendance]
  )

  const getEmployeeLeaves = useCallback(
    (id: string) => leaves.filter((l) => l.employeeId === id),
    [leaves]
  )

  const getEmployeePayroll = useCallback(
    (id: string) => payrollRecords.filter((p) => p.employeeId === id),
    [payrollRecords]
  )

  const todayRecord = useCallback(
    (id: string) => {
      const today = toISODate(new Date())
      return attendance.find((a) => a.employeeId === id && a.date === today)
    },
    [attendance]
  )

  const checkIn = useCallback(
    (employeeId: string) => {
      const today = toISODate(new Date())
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.employeeId === employeeId && a.date === today
        )
        if (existing) {
          return prev.map((a) =>
            a.id === existing.id ? { ...a, checkIn: time, status: "present" as const } : a
          )
        }
        return [
          {
            id: `A-${employeeId}-${today}`,
            employeeId,
            date: today,
            checkIn: time,
            checkOut: null,
            status: "present",
            workingHours: 0,
          },
          ...prev,
        ]
      })
    },
    []
  )

  const checkOut = useCallback(
    (employeeId: string) => {
      const today = toISODate(new Date())
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      setAttendance((prev) =>
        prev.map((a) => {
          if (a.employeeId !== employeeId || a.date !== today) return a
          const hours = a.checkIn ? hoursBetween(a.checkIn, time) : 0
          return { ...a, checkOut: time, workingHours: +hours.toFixed(2) }
        })
      )
    },
    []
  )

  const applyLeave = useCallback((input: ApplyLeaveInput): LeaveRequest => {
    const id = `L-${leaveCounter++}`
    const req: LeaveRequest = {
      id,
      employeeId: input.employeeId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
      attachment: input.attachment ?? null,
      status: "pending",
      appliedOn: toISODate(new Date()),
      comments: [],
      timeline: [
        { action: `Leave requested (${input.type.replace("_", " ")} leave)`, by: "You", date: new Date().toISOString() },
      ],
    }
    setLeaves((prev) => [req, ...prev])
    const employee = employees.find((e) => e.id === input.employeeId)
    if (employee) {
      sendEmail({
        to: HR_INBOX,
        category: "new-leave-application",
        body: `Hi HR team,\n\n${employee.firstName} ${employee.lastName} (${employee.id}) submitted a ${input.type.replace("_", " ")} leave request from ${formatDate(input.startDate)} to ${formatDate(input.endDate)}.\n\nReason: ${input.reason}\n\nReview it in the Leave Management module.\n\nNexusHR`,
      })
    }
    return req
  }, [employees])

  const pushNotification = useCallback(
    (n: { title: string; description: string; tone: AppNotification["tone"] }) => {
      setNotifications((prev) => [
        {
          id: `N-${Date.now()}`,
          title: n.title,
          description: n.description,
          time: new Date().toISOString(),
          read: false,
          tone: n.tone,
        },
        ...prev.slice(0, 49),
      ])
    },
    []
  )

  const setLeaveStatus = useCallback(
    (id: string, status: "approved" | "rejected", comment?: string) => {
      const leave = leaves.find((l) => l.id === id)
      if (!leave) return
      const by = "David Carter"
      setLeaves((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          return {
            ...l,
            status,
            comments: comment
              ? [...l.comments, { by, text: comment, date: new Date().toISOString() }]
              : l.comments,
            timeline: [
              ...l.timeline,
              { action: status === "approved" ? "Leave approved" : "Leave rejected", by, date: new Date().toISOString() },
            ],
          }
        })
      )
      const employee = employees.find((e) => e.id === leave.employeeId)
      if (!employee) return
      if (status === "approved") {
        pushNotification({
          title: "Leave approved",
          description: `Your ${leave.type.replace("_", " ")} leave (${formatDate(leave.startDate)} → ${formatDate(leave.endDate)}) was approved.`,
          tone: "success",
        })
        sendEmail({
          to: employee.email,
          category: "leave-approved",
          body: `Hi ${employee.firstName},\n\nYour ${leave.type.replace("_", " ")} leave request (${leave.id}) from ${formatDate(leave.startDate)} to ${formatDate(leave.endDate)} has been approved by HR.${comment ? `\n\nNote: ${comment}` : ""}\n\nNexusHR`,
        })
      } else {
        pushNotification({
          title: "Leave rejected",
          description: `Your ${leave.type.replace("_", " ")} leave (${formatDate(leave.startDate)} → ${formatDate(leave.endDate)}) was not approved.`,
          tone: "danger",
        })
        sendEmail({
          to: employee.email,
          category: "leave-rejected",
          body: `Hi ${employee.firstName},\n\nUnfortunately your ${leave.type.replace("_", " ")} leave request (${leave.id}) from ${formatDate(leave.startDate)} to ${formatDate(leave.endDate)} could not be approved.${comment ? `\n\nReason: ${comment}` : ""}\n\nPlease contact HR if you have any questions.\n\nNexusHR`,
        })
      }
    },
    [leaves, employees, pushNotification]
  )

  const approveLeave = useCallback(
    (id: string, comment?: string) => setLeaveStatus(id, "approved", comment),
    [setLeaveStatus]
  )

  const rejectLeave = useCallback(
    (id: string, comment?: string) => setLeaveStatus(id, "rejected", comment),
    [setLeaveStatus]
  )

  const updateProfile = useCallback((employeeId: string, patch: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, ...patch } : e))
    )
  }, [])

  const updateEmployee = updateProfile

  const addEmployee = useCallback((input: NewEmployeeInput): Employee => {
    const id = `E-${employeeCounter++}`
    const emp: Employee = {
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || `${input.firstName}.${input.lastName}@nexushr.io`.toLowerCase(),
      phone: input.phone,
      role: "employee",
      department: input.department,
      designation: input.designation,
      joiningDate: input.joiningDate,
      address: "",
      city: input.city ?? "Austin",
      gender: "Other",
      dateOfBirth: "1995-01-01",
      bloodGroup: "O+",
      emergencyContact: { name: "", phone: "", relation: "" },
      salary: {
        basic: input.salaryBasic,
        allowances: Math.round(input.salaryBasic * 0.2),
        bonus: 300,
        tax: Math.round(input.salaryBasic * 0.14),
        deductions: 300,
      },
      profileCompletion: 60,
      manager: "David Carter",
      documents: [],
    }
    setEmployees((prev) => [emp, ...prev])
    return emp
  }, [])

  const editAttendance = useCallback(
    (recordId: string, patch: Partial<AttendanceRecord>) => {
      const existing = attendance.find((a) => a.id === recordId)
      setAttendance((prev) =>
        prev.map((a) => {
          if (a.id !== recordId) return a
          const next = { ...a, ...patch }
          if (next.checkIn && next.checkOut) {
            next.workingHours = +hoursBetween(next.checkIn, next.checkOut).toFixed(2)
          }
          return next
        })
      )
      const nextStatus = patch.status
      if (
        existing &&
        nextStatus &&
        nextStatus !== existing.status &&
        nextStatus !== "present"
      ) {
        const employee = employees.find((e) => e.id === existing.employeeId)
        if (employee) {
          sendEmail({
            to: HR_INBOX,
            category: "attendance-exception",
            body: `Hi HR team,\n\nAn attendance exception was recorded for ${employee.firstName} ${employee.lastName} (${employee.id}) on ${formatDate(existing.date)}.\n\nStatus: ${nextStatus.replace("_", " ")}\n\nNexusHR`,
          })
        }
      }
    },
    [attendance, employees]
  )

  const generatePayroll = useCallback(() => {
    const month = monthKey()
    const existing = payrollRecords.filter((p) => p.month === month)
    const newRecords: PayrollRecord[] = employees
      .filter((e) => !existing.some((p) => p.employeeId === e.id))
      .map((e) => ({
        id: `P-${e.id}-${month}`,
        employeeId: e.id,
        month,
        basic: e.salary.basic,
        allowances: e.salary.allowances,
        bonus: e.salary.bonus,
        tax: e.salary.tax,
        deductions: e.salary.deductions,
        net:
          e.salary.basic +
          e.salary.allowances +
          e.salary.bonus -
          e.salary.tax -
          e.salary.deductions,
        status: "generated" as const,
      }))
    if (newRecords.length === 0) return
    setPayrollRecords((prev) => [...prev, ...newRecords])
    pushNotification({
      title: "Payroll generated",
      description: `${month} payroll has been generated for ${newRecords.length} employees.`,
      tone: "info",
    })
    sendEmail({
      to: HR_INBOX,
      category: "payroll-generated-success",
      body: `Hi HR team,\n\n${month} payroll has been generated successfully for ${newRecords.length} employees and is ready for review.\n\nNexusHR`,
    })
    for (const emp of newRecords.map((r) => employees.find((e) => e.id === r.employeeId))) {
      if (!emp) continue
      sendEmail({
        to: emp.email,
        category: "salary-slip-available",
        body: `Hi ${emp.firstName},\n\nYour ${month} payslip is now available. Log in to the HRMS portal and open Payroll to download the PDF.\n\nNexusHR`,
      })
    }
  }, [employees, payrollRecords, pushNotification])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markMessageRead = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }, [])

  const value = useMemo<DataContextValue>(
    () => ({
      employees,
      attendance,
      leaves,
      payrollRecords,
      notifications,
      messages,
      activities,
      departments,
      getEmployee,
      getEmployeeAttendance,
      getEmployeeLeaves,
      getEmployeePayroll,
      todayRecord,
      checkIn,
      checkOut,
      applyLeave,
      approveLeave,
      rejectLeave,
      updateProfile,
      addEmployee,
      updateEmployee,
      editAttendance,
      generatePayroll,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      pushNotification,
      markMessageRead,
      pushActivity,
    }),
    [
      employees,
      attendance,
      leaves,
      payrollRecords,
      notifications,
      messages,
      activities,
      departments,
      getEmployee,
      getEmployeeAttendance,
      getEmployeeLeaves,
      getEmployeePayroll,
      todayRecord,
      checkIn,
      checkOut,
      applyLeave,
      approveLeave,
      rejectLeave,
      updateProfile,
      addEmployee,
      updateEmployee,
      editAttendance,
      generatePayroll,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      pushNotification,
      markMessageRead,
      pushActivity,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
