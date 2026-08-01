import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Mail,
  Settings,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  badgeKey?: "approvals"
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const employeeNav: NavSection[] = [
  {
    items: [{ label: "Dashboard", to: "/employee", icon: LayoutDashboard, end: true }],
  },
  {
    title: "Workplace",
    items: [
      { label: "My Profile", to: "/employee/profile", icon: User },
      { label: "Attendance", to: "/employee/attendance", icon: CalendarCheck },
      { label: "Leave Requests", to: "/employee/leaves", icon: CalendarDays },
      { label: "Payroll", to: "/employee/payroll", icon: Wallet },
    ],
  },
  {
    title: "General",
    items: [
      { label: "Notifications", to: "/employee/notifications", icon: Bell },
      { label: "Settings", to: "/employee/settings", icon: Settings },
    ],
  },
]

export const adminNav: NavSection[] = [
  {
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true }],
  },
  {
    title: "Management",
    items: [
      { label: "Employees", to: "/admin/employees", icon: Users },
      { label: "Approvals", to: "/admin/approvals", icon: UserCheck, badgeKey: "approvals" },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
      { label: "Leave Management", to: "/admin/leaves", icon: CalendarDays },
      { label: "Payroll", to: "/admin/payroll", icon: Wallet },
      { label: "Reports", to: "/admin/reports", icon: BarChart3 },
      { label: "Email Alerts", to: "/admin/emails", icon: Mail },
    ],
  },
  {
    title: "Personal",
    items: [{ label: "My Profile", to: "/admin/profile", icon: User }],
  },
  {
    title: "General",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
]

export function navFor(role: "employee" | "admin"): NavSection[] {
  return role === "admin" ? adminNav : employeeNav
}
