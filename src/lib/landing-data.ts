import type { LucideIcon } from "lucide-react"
import {
  AlarmClock,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Download,
  FolderOpen,
  GraduationCap,
  Headphones,
  KeyRound,
  Mail,
  MapPin,
  Network,
  Phone,
  Plane,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react"

export interface CardItem {
  icon: LucideIcon
  title: string
  description: string
  tone: string
}

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About HRMS", href: "#about" },
  { label: "HR Services", href: "#services" },
  { label: "Departments", href: "#departments" },
  { label: "Employee Resources", href: "#resources" },
  { label: "Contact HR", href: "#contact" },
]

export const PORTAL_STATS = [
  { value: 287, suffix: "", label: "Employees" },
  { value: 6, suffix: "", label: "Departments" },
  { value: 96.4, suffix: "%", label: "Attendance", decimals: 1 },
  { value: 12, suffix: "", label: "Payroll cycles / yr" },
]

export const ABOUT_CARDS: CardItem[] = [
  { icon: Users, title: "Centralized Employee Management", description: "Every employee record — personal details, documents, designations and history — stored securely in one place.", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { icon: AlarmClock, title: "Attendance Tracking", description: "Clock in and out with ease, view daily records and keep attendance history always up to date.", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { icon: Plane, title: "Leave Management", description: "Apply for leave, track balances and follow approvals from a single self-service screen.", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { icon: Wallet, title: "Payroll Management", description: "Receive clear monthly payslips with transparent earnings, tax and deductions.", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { icon: UserCheck, title: "Employee Self-Service", description: "Update your details, download documents and manage your work life without HR tickets.", tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  { icon: ClipboardCheck, title: "HR Administration", description: "HR teams manage policies, approvals, records and audits through dedicated admin tools.", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
]

export const SERVICES: CardItem[] = [
  { icon: Users, title: "Employee Management", description: "Complete, self-updating records for the entire workforce.", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { icon: AlarmClock, title: "Attendance Tracking", description: "Reliable clock-in/out with daily history and reports.", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { icon: Plane, title: "Leave Management", description: "Self-service requests, balances and approval workflows.", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { icon: Wallet, title: "Payroll Management", description: "Timely payslips with complete earnings and deductions.", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { icon: Network, title: "Employee Directory", description: "Find colleagues, teams and reporting lines in seconds.", tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  { icon: BarChart3, title: "Reports & Analytics", description: "Attendance, leave and payroll insights for managers and HR.", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  { icon: Bell, title: "Notifications", description: "Timely alerts for approvals, announcements and policies.", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { icon: ShieldCheck, title: "Secure Authentication", description: "Protected sign-in with verified accounts and sessions.", tone: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
  { icon: KeyRound, title: "Role Based Access", description: "Employees, managers and HR see only what they should.", tone: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300" },
  { icon: FolderOpen, title: "Document Management", description: "Policies, forms and records available on demand.", tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
]

export interface Department {
  name: string
  description: string
  count: number
  icon: LucideIcon
  color: string
}

export const DEPARTMENTS: Department[] = [
  { name: "Human Resources", description: "People operations, talent, policies and employee well-being.", count: 14, icon: Users, color: "from-blue-500 to-blue-600" },
  { name: "IT", description: "Infrastructure, systems, security and technical support.", count: 45, icon: Network, color: "from-violet-500 to-purple-600" },
  { name: "Finance", description: "Payroll, budgets, accounting and financial reporting.", count: 26, icon: Wallet, color: "from-emerald-500 to-teal-600" },
  { name: "Operations", description: "Day-to-day processes, facilities and logistics.", count: 58, icon: Settings, color: "from-amber-500 to-orange-600" },
  { name: "Sales & Marketing", description: "Revenue, brand, campaigns and market growth.", count: 52, icon: BarChart3, color: "from-rose-500 to-pink-600" },
  { name: "Administration", description: "Executive support, compliance and general services.", count: 20, icon: Building2, color: "from-slate-500 to-slate-700" },
]

export const RESOURCES: CardItem[] = [
  { icon: BookOpen, title: "Employee Handbook", description: "Your guide to company culture, expectations and benefits.", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { icon: Scale, title: "Company Policies", description: "All official policies, reviewed and versioned.", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { icon: CalendarCheck, title: "Holiday Calendar", description: "This year's public holidays and office closures.", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { icon: Plane, title: "Leave Policy", description: "Eligibility, balances and how to apply for leave.", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { icon: ScrollText, title: "Code of Conduct", description: "Standards of professional behavior and ethics.", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { icon: GraduationCap, title: "Training Materials", description: "Skill development courses and learning paths.", tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  { icon: Headphones, title: "IT Helpdesk", description: "Technical support for systems, access and devices.", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  { icon: Headphones, title: "HR Helpdesk", description: "Questions about benefits, policies and records.", tone: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
  { icon: Download, title: "Download Forms", description: "Forms for reimbursements, requests and more.", tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
]

export const HR_CONTACT = [
  { icon: Mail, label: "HR Email", value: "hr@company.com" },
  { icon: Phone, label: "HR Phone", value: "+1 (415) 555-0140" },
  { icon: Phone, label: "Office Extension", value: "Ext. 4400" },
  { icon: MapPin, label: "Head Office", value: "100 Corporate Way, Floor 6, San Francisco, CA" },
  { icon: Clock, label: "Working Hours", value: "Mon–Fri · 9:00 AM – 6:00 PM" },
]
