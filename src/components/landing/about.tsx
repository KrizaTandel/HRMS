import { motion } from "framer-motion"
import { Building2 } from "lucide-react"

import { SectionShell, SectionHeading, Counter, Reveal, cardClasses } from "@/components/landing/shared"
import { ABOUT_CARDS, PORTAL_STATS, SERVICES } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

export function AboutSection() {
  return (
    <SectionShell id="about" className="relative">
      <div className="pointer-events-none absolute top-0 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="About HRMS"
          title="One secure portal for the entire employee journey"
          description="Vertex Industries runs its people operations on a single HRMS — covering every record, every day, every payslip."
        />

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:gap-12">
          <Reveal>
            <div className={cn(cardClasses, "relative overflow-hidden p-7 sm:p-8")}>
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
              <div className="relative">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg">
                  <Building2 className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                  Employee experience at the centre
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  We built this portal so that every employee — from onboarding to the last payslip —
                  can manage their own work life without waiting on paper forms or HR tickets. HR
                  teams get the tools to run the organisation smoothly, transparently and in
                  compliance with company policy.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    "Self-service for all employees",
                    "One source of truth for people data",
                    "Transparent approvals at every step",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span className="size-1.5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {ABOUT_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={(i % 2) * 0.07 + Math.floor(i / 2) * 0.05}>
                <div
                  className={cn(
                    cardClasses,
                    "group h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40"
                  )}
                >
                  <span className={cn("flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", card.tone)}>
                    <card.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-10">
          <div className={cn(cardClasses, "grid grid-cols-2 divide-slate-200/70 overflow-hidden dark:divide-slate-800 sm:grid-cols-4 sm:divide-x")}>
            {PORTAL_STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
                <span className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                  <Counter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent" />
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}

export function ServicesSection() {
  return (
    <SectionShell id="services" className="relative">
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Services"
          title="HR services for every employee"
          description="From your first day to your final payslip, the portal handles the essentials — so you can focus on the work that matters."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 5) * 0.06}>
              <div className={cn(cardClasses, "group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40")}>
                <span className={cn("flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", service.tone)}>
                  <service.icon className="size-4.5" />
                </span>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{service.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
