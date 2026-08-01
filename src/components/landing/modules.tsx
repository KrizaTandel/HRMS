import { useState } from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronRight, Lock, ShieldCheck, Star } from "lucide-react"

import { SectionShell, SectionHeading, Sparkline, AnimatedBar, cardClasses } from "@/components/landing/shared"
import { MODULE_TABS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

const EMPLOYEES = [
  { name: "Amara Okafor", role: "HR Director", status: "Active", tone: "bg-emerald-500" },
  { name: "Jordan Lee", role: "Product Designer", status: "Active", tone: "bg-emerald-500" },
  { name: "Daniel Reyes", role: "Head of People", status: "On leave", tone: "bg-amber-500" },
  { name: "Sofia Lindqvist", role: "CHRO", status: "Active", tone: "bg-emerald-500" },
]

function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      <span className="w-8" />
    </div>
  )
}

function HrDashboardMock() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Headcount", value: "287", tone: "text-blue-600 dark:text-blue-400" },
          { label: "Attend. rate", value: "96.4%", tone: "text-emerald-600 dark:text-emerald-400" },
          { label: "Payroll", value: "$1.24M", tone: "text-violet-600 dark:text-violet-400" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{k.label}</p>
            <p className={cn("text-base font-bold", k.tone)}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
        <p className="mb-1.5 text-[10px] text-slate-500 dark:text-slate-400">Attendance this week</p>
        <div className="flex h-14 items-end gap-1">
          {[55, 80, 62, 95, 70, 84, 60].map((h, i) => (
            <AnimatedBar
              key={i}
              height={`${h}%`}
              delay={i * 0.06}
              className={cn(
                "flex-1 rounded-t",
                i === 3 ? "bg-gradient-to-t from-blue-600 to-violet-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {[
          { label: "Pending leaves", value: "12", sub: "+3 today" },
          { label: "New joiners", value: "5", sub: "this month" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {s.value} <span className="text-[10px] font-medium text-slate-400">· {s.sub}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmployeeDashboardMock() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Avatar name="Sarah Mitchell" size="sm" />
          <div>
            <p className="text-[12px] font-bold text-slate-900 dark:text-white">Good morning, Sarah</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Friday · Jul 31, 2026</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          Checked in 9:01
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {[
          { label: "Leave balance", value: "11 d", tone: "text-blue-600 dark:text-blue-400" },
          { label: "Next payslip", value: "$5,420", tone: "text-violet-600 dark:text-violet-400" },
          { label: "Pending", value: "2", tone: "text-amber-600 dark:text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{k.label}</p>
            <p className={cn("text-base font-bold", k.tone)}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
        <p className="mb-1.5 text-[10px] text-slate-500 dark:text-slate-400">My week</p>
        <div className="flex h-12 items-end gap-1">
          {[70, 55, 90, 65, 80, 60, 85].map((h, i) => (
            <AnimatedBar
              key={i}
              height={`${h}%`}
              delay={i * 0.06}
              className={cn(
                "flex-1 rounded-t",
                i === 6 ? "bg-gradient-to-t from-blue-600 to-teal-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>
      <div className="mt-2.5 flex gap-2">
        <span className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-center text-[11px] font-bold text-white">
          Check In
        </span>
        <span className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Apply Leave
        </span>
        <span className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Payslip
        </span>
      </div>
    </div>
  )
}

function ProfileMock() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <Avatar name="Sarah Mitchell" size="lg" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">Sarah Mitchell</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Product Designer · Design</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            ● Active employee
          </span>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {[
          { label: "Employee ID", value: "VX-1042" },
          { label: "Join date", value: "Mar 12, 2022" },
          { label: "Manager", value: "J. Chen" },
          { label: "Work location", value: "HQ · SF" },
        ].map((f) => (
          <div key={f.label} className="rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
            <p className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">{f.label}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-slate-800 dark:text-slate-100">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 space-y-1.5">
        {["Personal details", "Documents (4)", "Emergency contacts", "Employment history"].map((s) => (
          <div key={s} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            {s}
            <span className="text-slate-400">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceMock() {
  const days = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1]
  return (
    <div className="p-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">This month</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">26 / 28 days present</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          96.4%
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.015 }}
            className={cn(
              "aspect-square rounded-md",
              d === 1 ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/20"
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-400" /> Present</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-400" /> Absent</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-slate-200 dark:bg-slate-700" /> Weekend</span>
      </div>
    </div>
  )
}

function LeaveMock() {
  return (
    <div className="space-y-2 p-4">
      {[
        { type: "Paid leave", days: "3 days", status: "Approved", tone: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
        { type: "Sick leave", days: "1 day", status: "Pending", tone: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" },
        { type: "Casual leave", days: "2 days", status: "Approved", tone: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
      ].map((l) => (
        <div key={l.type} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Star className="size-3.5" />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{l.type}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{l.days} · Jul 2026</p>
            </div>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", l.tone)}>{l.status}</span>
        </div>
      ))}
      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <span>Paid leave balance</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">11 / 14</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "79%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
          />
        </div>
      </div>
    </div>
  )
}

function PayrollMock() {
  return (
    <div className="p-4">
      <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">July 2026 · Net pay</p>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            Generated
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">$5,420.00</p>
        <div className="mt-2.5 space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex justify-between"><span>Basic + Allowances</span><span className="font-semibold text-slate-700 dark:text-slate-200">+$6,350</span></div>
          <div className="flex justify-between"><span>Tax + Deductions</span><span className="font-semibold text-rose-500">-$930</span></div>
        </div>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {[
          { name: "Amara Okafor", amt: "$5,420" },
          { name: "Jordan Lee", amt: "$4,180" },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
            <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
            <p className="text-[12px] font-bold text-slate-900 dark:text-white">{p.amt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportsMock() {
  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <span>Report</span><span>Updated</span><span className="text-right">Status</span>
        </div>
        {[
          { name: "Monthly payroll", when: "1 hr ago", status: "Ready", ok: true },
          { name: "Attendance log", when: "2 hrs ago", status: "Ready", ok: true },
          { name: "Leave summary", when: "Today", status: "Scheduled", ok: false },
        ].map((r) => (
          <div key={r.name} className="grid grid-cols-3 items-center border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-800">
            <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">{r.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{r.when}</span>
            <span className={cn("justify-self-end rounded-full px-2 py-0.5 text-[9px] font-bold", r.ok ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400")}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <ChevronRight className="size-3" /> Export CSV · PDF
      </div>
    </div>
  )
}

function AnalyticsMock() {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Payroll trend</p>
        <p className="text-base font-bold text-slate-900 dark:text-white">$1.24M</p>
        <Sparkline data={[40, 52, 48, 65, 72, 84, 92]} color="var(--chart-1)" height={28} className="mt-1.5 h-7 w-full" />
      </div>
      <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Attendance rate</p>
        <p className="text-base font-bold text-slate-900 dark:text-white">96.4%</p>
        <Sparkline data={[55, 60, 66, 70, 78, 88, 96]} color="var(--chart-2)" height={28} className="mt-1.5 h-7 w-full" />
      </div>
      <div className="col-span-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Department headcount</p>
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
          {[
            { w: "28%", c: "bg-blue-500" },
            { w: "22%", c: "bg-violet-500" },
            { w: "18%", c: "bg-teal-500" },
            { w: "14%", c: "bg-amber-500" },
            { w: "18%", c: "bg-rose-400" },
          ].map((s, i) => (
            <div key={i} className={cn(s.w, s.c)} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[9px] text-slate-500 dark:text-slate-400">
          <span>● Engineering 28%</span><span>● Sales 22%</span><span>● Design 18%</span>
        </div>
      </div>
    </div>
  )
}

function NotificationsMock() {
  return (
    <div className="space-y-2 p-4">
      {[
        { title: "Leave approved", sub: "3 days · Paid leave", tone: "bg-emerald-500" },
        { title: "Payroll generated", sub: "July · $1.24M total", tone: "bg-blue-500" },
        { title: "Birthday this week", sub: "5 team members 🎉", tone: "bg-violet-500" },
        { title: "Policy updated", sub: "Remote work policy v2", tone: "bg-amber-500" },
      ].map((n) => (
        <div key={n.title} className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
          <span className={cn("size-2 shrink-0 rounded-full", n.tone)} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{n.sub}</p>
          </div>
          <span className="ml-auto text-[9px] text-slate-400">now</span>
        </div>
      ))}
    </div>
  )
}

function SettingsMock() {
  return (
    <div className="space-y-2 p-4">
      {[
        { label: "Role-based access", on: true },
        { label: "Email notifications", on: true },
        { label: "Two-factor auth", on: false },
        { label: "Audit logs", on: true },
      ].map((s) => (
        <div key={s.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-800">
          <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{s.label}</span>
          <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", s.on ? "justify-end bg-blue-600" : "justify-start bg-slate-300 dark:bg-slate-700")}>
            <span className="size-4 rounded-full bg-white shadow" />
          </span>
        </div>
      ))}
    </div>
  )
}

function AuthMock() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-xs rounded-xl border border-slate-100 p-4 shadow-lg dark:border-slate-800">
        <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
          <ShieldCheck className="size-4.5" />
        </div>
        <p className="mt-2 text-center text-[13px] font-bold text-slate-900 dark:text-white">Welcome back</p>
        <div className="mt-3 space-y-1.5">
          <div className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">you@company.com</div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
            •••••••• <Lock className="size-3 text-slate-400" />
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-2 text-center text-[11px] font-bold text-white">
          Sign in securely
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">
          <ShieldCheck className="size-3 text-emerald-500" /> JWT sessions · Email verified
        </div>
      </div>
    </div>
  )
}

const MOCKUPS: Record<string, () => ReactNode> = {
  "employee-dashboard": EmployeeDashboardMock,
  "hr-dashboard": HrDashboardMock,
  profile: ProfileMock,
  attendance: AttendanceMock,
  leave: LeaveMock,
  payroll: PayrollMock,
  reports: ReportsMock,
  analytics: AnalyticsMock,
  notifications: NotificationsMock,
  settings: SettingsMock,
  auth: AuthMock,
}

export function ModulesSection() {
  const [active, setActive] = useState(0)
  const tab = MODULE_TABS[active]
  const Mockup = MOCKUPS[tab.key]

  return (
    <SectionShell id="modules" className="relative">
      <div className="pointer-events-none absolute top-24 -right-40 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Modules"
          title="Explore the portal"
          description="Eleven purpose-built modules that cover the entire employee and HR journey — from your personal dashboard to company analytics."
        />

        <div className="scrollbar-none mt-10 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:justify-center">
          {MODULE_TABS.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
                i === active
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white/70 text-slate-600 hover:border-blue-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-white"
              )}
            >
              {i === active && (
                <motion.span
                  layoutId="module-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <m.icon className="size-3.5" />
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${tab.key}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                  <tab.icon className="size-5.5" />
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tab.label}</h3>
              </div>
              <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">{tab.description}</p>
              <ul className="mt-6 space-y-2.5">
                {tab.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <Check className="size-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-blue-200/60 bg-blue-50/60 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">{tab.stat.value}</span>
                <span className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">{tab.stat.label}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`mock-${tab.key}`}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(cardClasses, "min-h-[21rem] overflow-hidden")}
            >
              <WindowChrome title={`Vertex HRMS · ${tab.label}`} />
              <Mockup />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionShell>
  )
}
