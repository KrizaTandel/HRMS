import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight, ShieldCheck } from "lucide-react"

import { Particles, GlowBlob } from "@/components/landing/shared"

export function LandingHero() {
  return (
    <section id="home" className="relative overflow-hidden pt-36 pb-24 sm:pt-40 lg:pt-44 lg:pb-32">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <GlowBlob className="-top-32 -left-32 h-[26rem] w-[26rem] bg-blue-500/25 dark:bg-blue-600/20" />
      <GlowBlob className="top-10 right-[-8rem] h-[24rem] w-[24rem] bg-teal-400/20 dark:bg-teal-500/15" />
      <Particles count={20} />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
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
          className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
        >
          One secure place to manage your attendance, leave, payroll, personal records and HR
          services — designed for every employee and HR professional at Vertex Industries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
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
    </section>
  )
}
