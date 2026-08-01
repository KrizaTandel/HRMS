import {
  toISODate,
  hoursBetween,
  clamp,
  monthKey,
} from "@/lib/format"
import type {
  Activity,
  AppNotification,
  AttendanceRecord,
  AttendanceStatus,
  Department,
  Employee,
  LeaveRequest,
  LeaveType,
  Message,
  PayrollRecord,
  PayrollStatus,
} from "./types"

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260731)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]
const between = (min: number, max: number) => min + rnd() * (max - min)
const int = (min: number, max: number) => Math.round(between(min, max))

const FIRST = [
  "Sarah", "Michael", "Emily", "James", "Olivia", "Daniel", "Sophia", "David",
  "Emma", "Lucas", "Ava", "Ethan", "Mia", "Noah", "Isabella", "Liam", "Amelia",
  "Benjamin", "Charlotte", "Henry", "Grace", "Samuel", "Lily", "Nathan",
  "Chloe", "Owen", "Zoe", "Caleb", "Nora", "Leo", "Ella", "Mason", "Riley",
  "Aiden", "Harper", "Jack", "Lucy", "Elijah", "Maya", "Carter",
]
const LAST = [
  "Mitchell", "Anderson", "Thompson", "Rodriguez", "Garcia", "Williams",
  "Brooks", "Nguyen", "Patel", "Turner", "Clark", "Walker", "Hall", "Young",
  "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Mitchell", "Reed", "Collins", "Murphy", "Bennett",
  "Torres", "Ramirez", "Foster", "Gray", "Hughes", "Price",
]

const GENDERS = ["Female", "Male"]

const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

const STREETS = [
  "188 Market Street", "452 Harbor View", "77 Maple Avenue", "310 Oak Lane",
  "902 Birchwood Drive", "26 Cedar Court", "118 Pine Street", "634 Willow Way",
  "55 Sunset Boulevard", "410 Hillcrest Road", "219 Grand Avenue",
  "388 Riverside Drive", "12 Meadow Lane", "701 Elm Street",
]
const CITIES = ["Austin", "New York", "Seattle", "San Francisco", "Chicago", "Denver", "Boston"]

const DOC_CATEGORIES = [
  { name: "Offer Letter", category: "Offer Letter", size: "184 KB" },
  { name: "Employment Contract", category: "Employment", size: "242 KB" },
  { name: "Government ID", category: "Identification", size: "96 KB" },
  { name: "Bank Account Details", category: "Finance", size: "58 KB" },
  { name: "Signed NDA", category: "Legal", size: "131 KB" },
  { name: "Tax Withholding Form", category: "Finance", size: "77 KB" },
]

interface DeptDef {
  name: string
  color: string
  head: string
  roles: { designation: string; salary: number; count: number }[]
}

const DEPARTMENTS: DeptDef[] = [
  {
    name: "Engineering",
    color: "#2563EB",
    head: "Daniel Williams",
    roles: [
      { designation: "Junior Software Engineer", salary: 4200, count: 2 },
      { designation: "Software Engineer", salary: 5600, count: 3 },
      { designation: "Senior Software Engineer", salary: 7400, count: 3 },
      { designation: "Staff Software Engineer", salary: 9500, count: 1 },
      { designation: "Engineering Manager", salary: 8800, count: 1 },
      { designation: "QA Engineer", salary: 4800, count: 2 },
      { designation: "DevOps Engineer", salary: 7000, count: 1 },
    ],
  },
  {
    name: "Design",
    color: "#8B5CF6",
    head: "Emily Anderson",
    roles: [
      { designation: "UI/UX Designer", salary: 4800, count: 2 },
      { designation: "Senior Product Designer", salary: 7200, count: 2 },
      { designation: "Design Lead", salary: 8100, count: 1 },
    ],
  },
  {
    name: "Product",
    color: "#EC4899",
    head: "Lucas Thompson",
    roles: [
      { designation: "Product Manager", salary: 6900, count: 2 },
      { designation: "Senior Product Manager", salary: 8300, count: 1 },
    ],
  },
  {
    name: "Sales & Marketing",
    color: "#F59E0B",
    head: "Sophia Rodriguez",
    roles: [
      { designation: "Sales Executive", salary: 4100, count: 3 },
      { designation: "Marketing Specialist", salary: 4500, count: 2 },
      { designation: "Sales Manager", salary: 6600, count: 1 },
      { designation: "Growth Lead", salary: 7600, count: 1 },
    ],
  },
  {
    name: "Finance",
    color: "#14B8A6",
    head: "James Garcia",
    roles: [
      { designation: "Accountant", salary: 4600, count: 2 },
      { designation: "Financial Analyst", salary: 5300, count: 2 },
      { designation: "Finance Manager", salary: 7100, count: 1 },
    ],
  },
  {
    name: "Operations",
    color: "#0EA5E9",
    head: "Emma Brooks",
    roles: [
      { designation: "Operations Associate", salary: 4000, count: 3 },
      { designation: "Operations Manager", salary: 6800, count: 1 },
    ],
  },
  {
    name: "Human Resources",
    color: "#22C55E",
    head: "David Carter",
    roles: [
      { designation: "HR Executive", salary: 4300, count: 2 },
      { designation: "Recruiter", salary: 4700, count: 1 },
      { designation: "HR Manager", salary: 6600, count: 1 },
      { designation: "HR Director", salary: 8600, count: 1 },
    ],
  },
  {
    name: "Customer Success",
    color: "#EF4444",
    head: "Olivia Nguyen",
    roles: [
      { designation: "Support Specialist", salary: 4000, count: 4 },
      { designation: "Customer Success Manager", salary: 5400, count: 4 },
    ],
  },
]

const pool: { dept: string; designation: string; salary: number }[] = []
for (const d of DEPARTMENTS) {
  for (const r of d.roles) {
    for (let i = 0; i < r.count; i++) {
      pool.push({ dept: d.name, designation: r.designation, salary: r.salary })
    }
  }
}
// Shuffle pool deterministically
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1))
  ;[pool[i], pool[j]] = [pool[j], pool[i]]
}

function makeEmail(first: string, last: string): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}@nexushr.io`
}

function makePhone(): string {
  return `(555) ${int(200, 999)}-${int(1000, 9999)}`
}

function randomPastDate(startYear: number, endYear: number): Date {
  const start = new Date(`${startYear}-01-01`)
  const end = new Date(`${endYear}-12-31`)
  return new Date(start.getTime() + rnd() * (end.getTime() - start.getTime()))
}

const EMPLOYEES: Employee[] = []
const nameCounts = new Map<string, number>()

for (let i = 0; i < pool.length; i++) {
  const job = pool[i]
  const first = pick(FIRST)
  const last = pick(LAST)
  const key = `${first} ${last}`
  const occ = nameCounts.get(key) ?? 0
  nameCounts.set(key, occ + 1)

  const joining = randomPastDate(2016, 2025)
  const salary = job.salary
  const allowances = Math.round(salary * between(0.18, 0.26))
  const bonus = int(250, 900)
  const gross = salary + allowances + bonus
  const tax = Math.round(gross * between(0.12, 0.16))
  const deductions = int(240, 470)
  const isAdmin = i === 0

  const employee: Employee = {
    id: `E-${String(i + 1).padStart(3, "0")}`,
    firstName: first,
    lastName: last,
    email: makeEmail(first, last),
    phone: makePhone(),
    role: isAdmin ? "admin" : "employee",
    department: job.dept,
    designation: job.designation,
    joiningDate: toISODate(joining),
    address: pick(STREETS),
    city: pick(CITIES),
    gender: pick(GENDERS),
    dateOfBirth: toISODate(randomPastDate(1988, 2002)),
    bloodGroup: pick(BLOOD),
    emergencyContact: {
      name: `${pick(FIRST)} ${pick(LAST)}`,
      phone: makePhone(),
      relation: pick(["Spouse", "Parent", "Sibling", "Friend"]),
    },
    salary: {
      basic: salary,
      allowances,
      bonus,
      tax,
      deductions,
    },
    profileCompletion: int(80, 100),
    manager: DEPARTMENTS.find((d) => d.name === job.dept)?.head ?? "David Carter",
    documents: DOC_CATEGORIES.map((doc, di) => ({
      id: `D-${i}-${di}`,
      name: doc.name,
      category: doc.category,
      size: doc.size,
      uploadedOn: toISODate(randomPastDate(2020, 2025)),
      verified: rnd() > 0.15,
    })),
  }
  EMPLOYEES.push(employee)
}

// Force the demo users to have stable, friendly identities
const adminIdx = EMPLOYEES.findIndex((e) => e.id === "E-001")
const employeeIdx = EMPLOYEES.findIndex((e) => e.id === "E-002")
const apply = (idx: number, patch: Partial<Employee>) => {
  if (idx >= 0) EMPLOYEES[idx] = { ...EMPLOYEES[idx], ...patch }
}
apply(adminIdx, {
  firstName: "David",
  lastName: "Carter",
  email: "david.carter@nexushr.io",
  role: "admin",
  department: "Human Resources",
  designation: "HR Director",
  phone: "(555) 214-8871",
  city: "Austin",
  joiningDate: "2018-03-12",
  salary: { basic: 8600, allowances: 2150, bonus: 800, tax: 1736, deductions: 420 },
  profileCompletion: 100,
  manager: "Board of Directors",
})
apply(employeeIdx, {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah.mitchell@nexushr.io",
  role: "employee",
  department: "Design",
  designation: "Senior Product Designer",
  phone: "(555) 309-4420",
  city: "Austin",
  joiningDate: "2021-07-05",
  salary: { basic: 7200, allowances: 1800, bonus: 650, tax: 1452, deductions: 380 },
  profileCompletion: 94,
  manager: "Emily Anderson",
})

const DEMO_USER: Employee = EMPLOYEES.find((e) => e.id === "E-002")!
const DEMO_ADMIN: Employee = EMPLOYEES.find((e) => e.id === "E-001")!

// A few recent joiners so "new employees" analytics have data
const recentJoinerIds = ["E-030", "E-033", "E-036", "E-041"]
{
  const ref = new Date()
  for (const id of recentJoinerIds) {
    const idx = EMPLOYEES.findIndex((e) => e.id === id)
    if (idx >= 0) {
      const daysAgo = int(2, 25)
      const d = new Date(ref.getTime() - daysAgo * 86400000)
      EMPLOYEES[idx] = { ...EMPLOYEES[idx], joiningDate: toISODate(d) }
    }
  }
}

export const departments: Department[] = DEPARTMENTS.map((d) => ({
  id: d.name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name: d.name,
  color: d.color,
  head: d.head,
  employeeCount: EMPLOYEES.filter((e) => e.department === d.name).length,
}))

// ---------------- Attendance ----------------

const STATUS_WEIGHTS: [AttendanceStatus, number][] = [
  ["present", 0.74],
  ["late", 0.08],
  ["leave", 0.07],
  ["half_day", 0.04],
  ["absent", 0.07],
]

function rollStatus(): AttendanceStatus {
  const roll = rnd()
  let acc = 0
  for (const [status, w] of STATUS_WEIGHTS) {
    acc += w
    if (roll <= acc) return status
  }
  return "present"
}

function todayRoll(): AttendanceStatus {
  const roll = rnd()
  if (roll < 0.84) return "present"
  if (roll < 0.9) return "late"
  if (roll < 0.94) return "leave"
  if (roll < 0.97) return "half_day"
  return "absent"
}

function randomTime(status: AttendanceStatus): { in: string; out: string | null } {
  const hh = int(8, 10)
  const mm = int(0, 59)
  const checkIn = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
  if (status === "half_day") {
    const outH = int(13, 14)
    return { in: checkIn, out: `${outH}:${String(int(0, 45)).padStart(2, "0")}` }
  }
  const outH = int(17, 19)
  const out = `${String(outH).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}`
  return { in: checkIn, out }
}

const ATTENDANCE: AttendanceRecord[] = []
const DAYS_BACK = 120
const today = new Date()
today.setHours(0, 0, 0, 0)

for (let d = DAYS_BACK; d >= 0; d--) {
  const date = new Date(today)
  date.setDate(date.getDate() - d)
  const day = date.getDay()
  if (day === 0 || day === 6) continue
  const dateStr = toISODate(date)
  const isToday = d === 0

  for (const emp of EMPLOYEES) {
    let status: AttendanceStatus
    let checkIn: string | null = null
    let checkOut: string | null = null
    let workingHours = 0

    if (isToday) {
      status = emp.id === DEMO_USER.id ? "present" : todayRoll()
      if (status === "present") {
        const t = randomTime("present")
        checkIn = t.in
        checkOut = null
        workingHours = hoursBetween(t.in, "16:30")
      } else if (status === "late") {
        checkIn = `09:${String(int(25, 55)).padStart(2, "0")}`
        checkOut = null
        workingHours = 0
      }
    } else {
      status = rollStatus()
      if (status === "present" || status === "half_day" || status === "late") {
        const t = randomTime(status)
        checkIn = t.in
        checkOut = t.out
        workingHours = t.out ? hoursBetween(t.in, t.out) : 0
      }
    }

    ATTENDANCE.push({
      id: `A-${emp.id}-${dateStr}`,
      employeeId: emp.id,
      date: dateStr,
      checkIn,
      checkOut,
      status,
      workingHours: +workingHours.toFixed(2),
    })
  }
}

// Ensure Sarah's today record is clearly present
const sarahToday = ATTENDANCE.find(
  (a) => a.employeeId === DEMO_USER.id && a.date === toISODate(today)
)
if (sarahToday) {
  sarahToday.checkIn = "09:04"
  sarahToday.checkOut = null
  sarahToday.status = "present"
  sarahToday.workingHours = 7.5
}

// ---------------- Leaves ----------------

const LEAVE_TYPES: LeaveType[] = ["paid", "sick", "casual", "unpaid"]
const LEAVE_REASONS: Record<LeaveType, string[]> = {
  paid: [
    "Annual vacation planned with family",
    "Travelling abroad for a week",
    "Personal time off to recharge",
  ],
  sick: [
    "Recovering from seasonal flu",
    "Doctor's appointment and rest",
    "Medical leave — fever and body ache",
  ],
  casual: [
    "Family event to attend",
    "Moving apartments, need the day off",
    "Personal errands",
  ],
  unpaid: [
    "Extended personal leave request",
    "Handling family matters",
  ],
}

function buildLeaveTimeline(
  req: LeaveRequest,
  status: LeaveRequest["status"]
): LeaveRequest["timeline"] {
  const timeline: LeaveRequest["timeline"] = [
    { action: `Leave requested (${req.type.replace("_", " ")} leave)`, by: req.employeeId === DEMO_USER.id ? "You" : req.employeeId, date: req.appliedOn },
  ]
  if (status !== "pending") {
    timeline.push({
      action: status === "approved" ? "Leave approved" : "Leave rejected",
      by: "David Carter",
      date: new Date(new Date(req.appliedOn).getTime() + 86400000 * int(1, 3)).toISOString(),
    })
  }
  return timeline
}

const LEAVES: LeaveRequest[] = []
for (let i = 0; i < 52; i++) {
  const emp = pick(EMPLOYEES)
  const type = pick(LEAVE_TYPES)
  const duration = int(1, type === "sick" ? 3 : 6)
  const start = new Date(today)
  start.setDate(start.getDate() + int(-120, 45))
  const end = new Date(start)
  end.setDate(end.getDate() + duration - 1)
  const applied = new Date(start)
  applied.setDate(applied.getDate() - int(5, 30))

  const roll = rnd()
  const status: LeaveRequest["status"] = roll < 0.34 ? "pending" : roll < 0.82 ? "approved" : "rejected"
  const req: LeaveRequest = {
    id: `L-${String(i + 1).padStart(3, "0")}`,
    employeeId: emp.id,
    type,
    startDate: toISODate(start),
    endDate: toISODate(end),
    reason: pick(LEAVE_REASONS[type]),
    attachment: rnd() > 0.75 ? "Medical_report.pdf" : null,
    status,
    appliedOn: toISODate(applied),
    comments:
      status !== "pending"
        ? [
            {
              by: "David Carter",
              text:
                status === "approved"
                  ? "Approved. Enjoy your time off!"
                  : "Request cannot be approved due to current team workload.",
              date: new Date(applied.getTime() + 86400000 * 2).toISOString(),
            },
          ]
        : [],
    timeline: [],
  }
  req.timeline = buildLeaveTimeline(req, status)
  LEAVES.push(req)
}

const sarahLeaves: LeaveRequest[] = [
  {
    id: "L-S1",
    employeeId: DEMO_USER.id,
    type: "paid",
    startDate: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)),
    endDate: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15)),
    reason: "Family trip to the mountains — 4 days away from the city.",
    attachment: null,
    status: "pending",
    appliedOn: toISODate(new Date(today.getTime() - 2 * 86400000)),
    comments: [],
    timeline: [{ action: "Leave requested (paid leave)", by: "You", date: toISODate(new Date(today.getTime() - 2 * 86400000)) }],
  },
  {
    id: "L-S2",
    employeeId: DEMO_USER.id,
    type: "sick",
    startDate: toISODate(new Date(today.getTime() - 46 * 86400000)),
    endDate: toISODate(new Date(today.getTime() - 45 * 86400000)),
    reason: "Doctor's appointment and recovery from mild flu.",
    attachment: "Doctor_note.pdf",
    status: "approved",
    appliedOn: toISODate(new Date(today.getTime() - 52 * 86400000)),
    comments: [
      { by: "David Carter", text: "Get well soon, Sarah.", date: toISODate(new Date(today.getTime() - 50 * 86400000)) },
    ],
    timeline: [
      { action: "Leave requested (sick leave)", by: "You", date: toISODate(new Date(today.getTime() - 52 * 86400000)) },
      { action: "Leave approved", by: "David Carter", date: toISODate(new Date(today.getTime() - 50 * 86400000)) },
    ],
  },
  {
    id: "L-S3",
    employeeId: DEMO_USER.id,
    type: "casual",
    startDate: toISODate(new Date(today.getTime() - 18 * 86400000)),
    endDate: toISODate(new Date(today.getTime() - 18 * 86400000)),
    reason: "Personal errands and apartment move.",
    attachment: null,
    status: "approved",
    appliedOn: toISODate(new Date(today.getTime() - 24 * 86400000)),
    comments: [
      { by: "David Carter", text: "Sure, take the day.", date: toISODate(new Date(today.getTime() - 22 * 86400000)) },
    ],
    timeline: [
      { action: "Leave requested (casual leave)", by: "You", date: toISODate(new Date(today.getTime() - 24 * 86400000)) },
      { action: "Leave approved", by: "David Carter", date: toISODate(new Date(today.getTime() - 22 * 86400000)) },
    ],
  },
]
LEAVES.push(...sarahLeaves)

export function getLeaveBalances(employeeId: string) {
  const year = today.getFullYear()
  const approved = LEAVES.filter(
    (l) =>
      l.employeeId === employeeId &&
      l.status === "approved" &&
      new Date(l.startDate).getFullYear() === year
  )
  const used = approved.reduce((acc, l) => {
    const days =
      (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000 + 1
    acc[l.type] = (acc[l.type] ?? 0) + days
    return acc
  }, {} as Record<string, number>)

  const allowances = { paid: 14, sick: 10, casual: 5 }
  const remaining: Record<string, number> = {}
  for (const [k, v] of Object.entries(allowances)) {
    remaining[k] = Math.max(0, v - (used[k] ?? 0))
  }
  return { used, remaining, allowances }
}

// ---------------- Payroll ----------------

function buildPayroll(): PayrollRecord[] {
  const records: PayrollRecord[] = []
  for (const emp of EMPLOYEES) {
    for (let m = 5; m >= 0; m--) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1)
      const month = monthKey(d)
      const isCurrent = m === 0
      const bonusVariance = isCurrent ? emp.salary.bonus : Math.max(0, emp.salary.bonus + int(-150, 150))
      const status: PayrollStatus = isCurrent ? "generated" : pick(["paid", "paid", "paid", "paid"])
      const net =
        emp.salary.basic +
        emp.salary.allowances +
        bonusVariance -
        emp.salary.tax -
        emp.salary.deductions
      records.push({
        id: `P-${emp.id}-${month}`,
        employeeId: emp.id,
        month,
        basic: emp.salary.basic,
        allowances: emp.salary.allowances,
        bonus: bonusVariance,
        tax: emp.salary.tax,
        deductions: emp.salary.deductions,
        net,
        status,
      })
    }
  }
  return records
}

export const payroll = buildPayroll()

export const currentMonthPayroll = payroll.filter(
  (p) => p.month === monthKey(today)
)

// ---------------- Activities / Notifications / Messages ----------------

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString()
}

const ACTIVITIES: Activity[] = [
  { id: "AC1", type: "checkin", text: `${DEMO_USER.firstName} ${DEMO_USER.lastName} checked in at 09:04 AM`, date: isoHoursAgo(2), employeeId: DEMO_USER.id },
  { id: "AC2", type: "leave", text: "Leave request #L-014 approved for 3 days", date: isoHoursAgo(5), employeeId: "E-014" },
  { id: "AC3", type: "salary", text: "July payroll generated for 50 employees", date: isoHoursAgo(8), employeeId: "E-001" },
  { id: "AC4", type: "onboarding", text: `${pick(EMPLOYEES).firstName} ${pick(EMPLOYEES).lastName} joined the Engineering team`, date: isoHoursAgo(26), employeeId: "E-030" },
  { id: "AC5", type: "attendance", text: "Attendance alert — 3 employees marked absent today", date: isoHoursAgo(30), employeeId: "E-001" },
  { id: "AC6", type: "profile", text: `${DEMO_USER.firstName} updated her emergency contact details`, date: isoHoursAgo(50), employeeId: DEMO_USER.id },
  { id: "AC7", type: "leave", text: "Leave request #L-021 is awaiting approval", date: isoHoursAgo(60), employeeId: "E-021" },
  { id: "AC8", type: "checkin", text: "5 employees clocked in before 9:00 AM today", date: isoHoursAgo(70), employeeId: "E-001" },
  { id: "AC9", type: "salary", text: "Salary structure updated for the Finance team", date: isoHoursAgo(90), employeeId: "E-001" },
  { id: "AC10", type: "onboarding", text: "New hire orientation completed for 2 employees", date: isoHoursAgo(120), employeeId: "E-001" },
]

const NOTIFICATIONS: AppNotification[] = [
  { id: "N1", title: "Company announcement", description: "Flexible working hours update is effective next week. Review the new policy in the portal.", time: isoHoursAgo(2), read: false, tone: "info" },
  { id: "N2", title: "Leave approved", description: "Your sick leave (2 days) was approved by David Carter.", time: isoHoursAgo(6), read: false, tone: "success" },
  { id: "N3", title: "Leave rejected", description: "Your casual leave (1 day) could not be approved. Contact HR for details.", time: isoHoursAgo(14), read: true, tone: "danger" },
  { id: "N4", title: "Payroll generated", description: "July payroll has been generated for all employees.", time: isoHoursAgo(20), read: true, tone: "info" },
  { id: "N5", title: "Salary slip available", description: "Your July payslip is now available to download.", time: isoHoursAgo(26), read: false, tone: "info" },
  { id: "N6", title: "Attendance reminder", description: "Don't forget to clock out before you leave today.", time: isoHoursAgo(30), read: true, tone: "warning" },
  { id: "N7", title: "Holiday notice", description: "The office will be closed on Labor Day. Plan your schedule accordingly.", time: isoHoursAgo(48), read: true, tone: "info" },
]

const MESSAGES: Message[] = [
  { id: "M1", from: "Emily Anderson", text: "Can you share the updated design system specs?", time: isoHoursAgo(1), read: false },
  { id: "M2", from: "James Garcia", text: "Finance needs your timesheet by Friday.", time: isoHoursAgo(4), read: false },
  { id: "M3", from: "David Carter", text: "Great work on the onboarding flow review!", time: isoHoursAgo(28), read: true },
  { id: "M4", from: "Olivia Nguyen", text: "Sending you the customer feedback report.", time: isoHoursAgo(40), read: true },
]

export const activityFeed = ACTIVITIES
export const notifications = NOTIFICATIONS
export const messages = MESSAGES

export const allEmployees = EMPLOYEES
export const adminEmployees = EMPLOYEES.filter((e) => e.role === "admin")
export const demoUser = DEMO_USER
export const demoAdmin = DEMO_ADMIN
export const attendanceRecords = ATTENDANCE
export const leaveRequests = LEAVES
