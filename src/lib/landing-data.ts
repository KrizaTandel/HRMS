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
  FileSpreadsheet,
  FileText,
  Fingerprint,
  FolderOpen,
  GraduationCap,
  Headphones,
  Heart,
  Info,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Network,
  Phone,
  Plane,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
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
  { label: "Departments", href: "#departments" },
  { label: "Services", href: "#services" },
  { label: "Employee Resources", href: "#resources" },
  { label: "Announcements", href: "#announcements" },
  { label: "Contact HR", href: "#contact" },
]

export const PORTAL_STATS = [
  { value: 287, suffix: "", label: "Employees" },
  { value: 8, suffix: "", label: "Departments" },
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
  { name: "Finance", description: "Payroll, budgets, accounting and financial reporting.", count: 26, icon: Wallet, color: "from-emerald-500 to-teal-600" },
  { name: "Information Technology", description: "Infrastructure, systems, security and technical support.", count: 45, icon: Network, color: "from-violet-500 to-purple-600" },
  { name: "Operations", description: "Day-to-day processes, facilities and logistics.", count: 58, icon: Settings, color: "from-amber-500 to-orange-600" },
  { name: "Sales & Marketing", description: "Revenue, brand, campaigns and market growth.", count: 52, icon: BarChart3, color: "from-rose-500 to-pink-600" },
  { name: "Customer Support", description: "Client success, support channels and service quality.", count: 38, icon: Headphones, color: "from-cyan-500 to-sky-600" },
  { name: "Research & Development", description: "Innovation, product design and new technologies.", count: 34, icon: GraduationCap, color: "from-indigo-500 to-blue-600" },
  { name: "Administration", description: "Executive support, compliance and general services.", count: 20, icon: Building2, color: "from-slate-500 to-slate-700" },
]

export interface ModuleTab {
  key: string
  label: string
  icon: LucideIcon
  description: string
  benefits: string[]
  stat: { value: string; label: string }
}

export const MODULE_TABS: ModuleTab[] = [
  {
    key: "employee-dashboard",
    label: "Employee Dashboard",
    icon: LayoutDashboard,
    description: "Your personal workday at a glance — attendance, leave balance, payslip and pending actions in one screen.",
    benefits: ["Today's schedule & check-in", "Leave balance overview", "Latest payslip summary", "Pending approvals"],
    stat: { value: "1 min", label: "To see your full day" },
  },
  {
    key: "hr-dashboard",
    label: "HR Dashboard",
    icon: BarChart3,
    description: "Company-wide visibility for HR — headcount, attendance, leave and payroll metrics updated in real time.",
    benefits: ["Live headcount & cost", "Attendance across teams", "Pending leave approvals", "Payroll status"],
    stat: { value: "Live", label: "Organization metrics" },
  },
  {
    key: "profile",
    label: "Employee Profile",
    icon: UserCheck,
    description: "A complete personal record with contact details, documents, emergency contacts and employment history.",
    benefits: ["Self-service updates", "Document vault", "Emergency contacts", "Employment history"],
    stat: { value: "15+", label: "Profile sections" },
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: AlarmClock,
    description: "Clock in and out effortlessly and review your full attendance history, month by month.",
    benefits: ["One-tap check-in", "Daily records", "Shift schedules", "History & reports"],
    stat: { value: "96.4%", label: "Company attendance" },
  },
  {
    key: "leave",
    label: "Leave",
    icon: Plane,
    description: "Apply for leave, watch approvals and always know exactly how many days you have left.",
    benefits: ["Smart leave balances", "One-click requests", "Approval timeline", "Team calendars"],
    stat: { value: "2.4×", label: "Faster approvals" },
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: Wallet,
    description: "Access clear, digital payslips with earnings, tax and year-to-date summaries.",
    benefits: ["Digital payslips", "YTD summaries", "Earnings breakdown", "Download anytime"],
    stat: { value: "12", label: "Payslips per year" },
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileSpreadsheet,
    description: "HR and managers compose the reports they need and export them as CSV or PDF.",
    benefits: ["Attendance reports", "Leave summaries", "Payroll exports", "Access control"],
    stat: { value: "40+", label: "Standard reports" },
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Stay informed with alerts for approvals, announcements, birthdays and policy changes.",
    benefits: ["Real-time alerts", "Announcements", "Milestone reminders", "Digest options"],
    stat: { value: "Instant", label: "Delivery" },
  },
  {
    key: "auth",
    label: "Authentication",
    icon: LogIn,
    description: "Secure sign-in for employees and HR with verified accounts and role-based sessions.",
    benefits: ["Verified accounts", "Email verification", "Secure sessions", "Role-based access"],
    stat: { value: "2", label: "Access roles" },
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Understand attendance, leave and payroll trends across the organization.",
    benefits: ["Attendance trends", "Leave statistics", "Department views", "Exportable insights"],
    stat: { value: "24/7", label: "Available" },
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    description: "Company configuration for policies, roles and portal preferences.",
    benefits: ["Policy engine", "Role management", "Portal branding", "Audit controls"],
    stat: { value: "2 min", label: "Average setup" },
  },
]

export interface Announcement {
  category: string
  title: string
  detail: string
  date: string
  month: string
  tone: string
  icon: LucideIcon
}

export const ANNOUNCEMENTS: Announcement[] = [
  { category: "Holiday", title: "Upcoming Holiday — Independence Day", detail: "All offices will remain closed on Friday, August 15. Attendance for the day will be marked automatically.", date: "Aug 15", month: "AUG", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", icon: CalendarCheck },
  { category: "Company Notice", title: "Updated Remote Work Guidelines", detail: "Effective September 1, hybrid employees may work from home up to three days per week with manager approval.", date: "Jul 28", month: "JUL", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", icon: Info },
  { category: "Policy Update", title: "Travel & Expense Policy v5.2", detail: "New per-diem rates and digital receipt requirements take effect next month. Review the updated policy.", date: "Jul 22", month: "JUL", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", icon: FileText },
  { category: "Birthdays", title: "Happy Birthday This Week!", detail: "Wishing a very happy birthday to 5 of our colleagues celebrating this week. Join the virtual cake at 3 PM.", date: "Jul 20", month: "JUL", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", icon: UserCheck },
  { category: "Work Anniversary", title: "Celebrating 5-Year Anniversaries", detail: "Congratulations to 12 employees completing 5 years with us this month. Your loyalty means the world.", date: "Jul 15", month: "JUL", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", icon: Star },
  { category: "Training", title: "Mandatory Cybersecurity Training", detail: "Complete the annual security awareness module by August 31. The course takes about 45 minutes.", date: "Jul 10", month: "JUL", tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300", icon: GraduationCap },
  { category: "HR Circular", title: "Q3 Wellness Benefits Enrollment", detail: "Enrollment for the Q3 wellness program closes on August 5. Includes gym, mental health and insurance options.", date: "Jul 05", month: "JUL", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300", icon: Heart },
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

export interface WorkflowStep {
  icon: LucideIcon
  title: string
  description: string
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { icon: LogIn, title: "Login", description: "Secure sign-in with your company account." },
  { icon: LayoutDashboard, title: "Dashboard", description: "View your personal workday overview." },
  { icon: AlarmClock, title: "Attendance", description: "Clock in and out with one tap." },
  { icon: Plane, title: "Leave Application", description: "Request leave with full context attached." },
  { icon: ClipboardCheck, title: "Approval", description: "Manager and HR review your request." },
  { icon: Wallet, title: "Payroll", description: "Approved leave reflects in your payslip." },
  { icon: FileSpreadsheet, title: "Reports", description: "Access your records and summaries anytime." },
  { icon: Bell, title: "Notifications", description: "Get notified at every step of the way." },
]

export interface SecurityItem {
  icon: LucideIcon
  title: string
  description: string
}

export const SECURITY_FEATURES: SecurityItem[] = [
  { icon: ShieldCheck, title: "Secure Authentication", description: "Verified sign-in with protected sessions." },
  { icon: KeyRound, title: "Role Based Access", description: "Employees and HR see only what they should." },
  { icon: Mail, title: "Email Verification", description: "Accounts verified before first sign-in." },
  { icon: Lock, title: "Data Privacy", description: "Personal records handled with strict privacy." },
  { icon: ClipboardCheck, title: "Audit Logs", description: "Every action traceable to a user and time." },
  { icon: Fingerprint, title: "Secure Employee Records", description: "Encrypted, access-controlled people data." },
]

export const HR_CONTACT = [
  { icon: Mail, label: "HR Email", value: "hr@company.com" },
  { icon: Phone, label: "HR Phone", value: "+1 (415) 555-0140" },
  { icon: Phone, label: "Office Extension", value: "Ext. 4400" },
  { icon: MapPin, label: "Head Office", value: "100 Corporate Way, Floor 6, San Francisco, CA" },
  { icon: Clock, label: "Working Hours", value: "Mon–Fri · 9:00 AM – 6:00 PM" },
]

export const FOOTER_LINKS = {
  "Employee Portal": ["Employee Login", "HR/Admin Login", "Employee Dashboard", "My Profile", "Help Desk"],
  "Employee Resources": ["Employee Handbook", "Company Policies", "Holiday Calendar", "Leave Policy", "Download Forms"],
  Policies: ["Privacy Policy", "Terms of Use", "Data Protection", "Code of Conduct", "Cookie Policy"],
  Support: ["HR Helpdesk", "IT Helpdesk", "Contact HR", "Report an Issue", "System Status"],
}

export const NOTIFICATIONS = [
  { title: "Leave request approved", detail: "Amara Okafor · 3 days · Paid leave", time: "2 min ago", tone: "success" },
  { title: "Payroll for July generated", detail: "All employees · View your payslip", time: "1 hr ago", tone: "primary" },
  { title: "Policy update published", detail: "Travel & Expense Policy v5.2", time: "3 hrs ago", tone: "info" },
]
