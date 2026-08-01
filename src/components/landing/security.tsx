import { motion } from "framer-motion"
import { Fingerprint, Lock, ShieldCheck } from "lucide-react"

import { SectionShell, SectionHeading, Reveal, Particles, cardClasses } from "@/components/landing/shared"
import { SECURITY_FEATURES } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

function LockVisual() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: i * 0.9 }}
          className="absolute size-48 rounded-full border border-blue-400/40 dark:border-blue-400/25"
        />
      ))}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex size-40 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-violet-600 to-teal-500 shadow-[0_30px_80px_-20px_rgb(37_99_235/0.6)]"
      >
        <Particles count={10} />
        <Lock className="relative z-10 size-16 text-white" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 right-2 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
      >
        <Fingerprint className="size-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">MFA Ready</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute bottom-8 left-0 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
      >
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">SOC 2 aligned</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute top-1/2 -right-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
      >
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">GDPR ✓</span>
      </motion.div>
    </div>
  )
}

export function SecuritySection() {
  return (
    <SectionShell id="security">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-6 sm:p-10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_30%_20%,black,transparent)]" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="size-3.5" /> Security first
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Employee data protected <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">by default</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                Every login is verified, every role sees only what it should, and every action is
                audited. Your people data stays yours — always.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["SSO + MFA", "Role-based access", "Audit logs", "GDPR ready"].map((b) => (
                  <span key={b} className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <LockVisual />
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {SECURITY_FEATURES.map((s, i) => (
              <Reveal key={s.title} delay={(i % 2) * 0.07 + Math.floor(i / 2) * 0.05}>
                <div
                  className={cn(
                    cardClasses,
                    "group flex h-full items-start gap-3.5 p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-lg dark:hover:border-emerald-500/40"
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {s.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
