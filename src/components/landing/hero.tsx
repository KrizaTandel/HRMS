import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  BellRing,
  CalendarCheck,
  ChevronRight,
  Plane,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import {
  Particles,
  GlowBlob,
  Sparkline,
  AnimatedBar,
  useParallax,
  cardClasses,
} from "@/components/landing/shared"

const FLOATERS = [
  { className: "-top-6 -right-4 sm:-right-8", delay: 0, type: "attendance" },
  { className: "-bottom-6 -left-3 sm:-left-8", delay: 1.2, type: "leave" },
  { className: "-top-10 left-1/3 hidden lg:flex", delay: 2.1, type: "payroll" },
  { className: "-right-5 bottom-14 hidden xl:flex", delay: 1.6, type: "notif" },
]

export function LandingHero() {
  const { ref, y } = useParallax(26)

  return (
    <section id="home" className="relative overflow-hidden pt-36 pb-24 sm:pt-40 lg:pt-44 lg:pb-32">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <GlowBlob className="-top-32 -left-32 h-[26rem] w-[26rem] bg-blue-500/25 dark:bg-blue-600/20" />
      <GlowBlob className="top-10 right-[-8rem] h-[24rem] w-[24rem] bg-teal-400/20 dark:bg-teal-500/15" />
      <Particles count={20} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300"
            >
              <ShieldCheck className="size-3.5" />
              Vertex Industries · Employee &amp; HR Portal
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem] dark:text-white"
            >
              Welcome to the Employee{" "}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Human Resource Management
              </span>{" "}
              Portal
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg lg:mx-0"
            >
              One secure place to manage your attendance, leave, payroll, personal records and HR
              services — designed for every employee and HR professional at Vertex Industries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgb(37_99_235/0.7)] transition-transform duration-300 hover:scale-[1.03]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Employee Login
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login?role=admin"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                <ShieldCheck className="size-4" />
                HR/Admin Login
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.36 }}
              className="mt-6 text-xs text-slate-400 dark:text-slate-500"
            >
              Secure access for all employees and HR administrators · Single sign-on ready
            </motion.p>
          </div>

          <motion.div
            ref={ref}
            style={{ y }}
            initial={{ opacity: 0, y: 60, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-lg [perspective:1200px] lg:max-w-none"
          >
            <div className={cardClasses}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Vertex Employee Portal
                  </p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    ● Online
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Good morning, Sarah 👋
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Friday, July 31 · Here's your workday
                    </p>
                  </div>
                  <Avatar name="Sarah Mitchell" size="sm" />
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Check-in", value: "9:01 AM", sub: "On time" },
                    { label: "Leave balance", value: "11 days", sub: "Paid" },
                    { label: "Next payslip", value: "$5,420", sub: "Aug 01" },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-slate-900 sm:text-base dark:text-white">{k.value}</p>
                      <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{k.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Your attendance · this week
                    </p>
                    <TrendingUp className="size-3.5 text-emerald-500" />
                  </div>
                  <div className="flex h-16 items-end gap-1.5">
                    {[70, 55, 90, 65, 80, 60, 85].map((h, i) => (
                      <AnimatedBar
                        key={i}
                        height={`${h}%`}
                        delay={0.3 + i * 0.08}
                        className={`flex-1 rounded-t-md ${
                          i === 6 ? "bg-gradient-to-t from-blue-600 to-teal-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-[12px] font-bold text-white shadow-lg">
                    <CalendarCheck className="size-3.5" /> Check In
                  </button>
                  <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300">
                    Apply Leave
                  </button>
                  <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300">
                    Payslip
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 z-10 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:-right-8 dark:border-slate-700 dark:bg-slate-900/90"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CalendarCheck className="size-4.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Attendance</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Checked in · 9:01 AM</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute -bottom-6 -left-3 z-10 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:-left-8 dark:border-slate-700 dark:bg-slate-900/90"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Plane className="size-4.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Leave</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Balance · 11 days paid</p>
              </div>
            </motion.div>

            {FLOATERS.map((f, i) => {
              if (f.type === "payroll")
                return (
                  <motion.div
                    key={f.type}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
                    className={`absolute ${f.className}`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-violet-600 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-violet-400">
                      <Wallet className="size-5" />
                    </span>
                  </motion.div>
                )
              if (f.type === "notif")
                return (
                  <motion.div
                    key={f.type}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
                    className={`absolute ${f.className}`}
                  >
                    <span className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                      <BellRing className="size-4 text-rose-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Approval needed</span>
                    </span>
                  </motion.div>
                )
              return null
            })}

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2.6 }}
              className="absolute -bottom-8 right-2 z-10 hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 shadow-xl backdrop-blur lg:flex dark:border-slate-700 dark:bg-slate-900/90"
            >
              <Sparkles className="size-4 text-teal-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Profile updated</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
