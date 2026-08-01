import { motion } from "framer-motion"
import { Users } from "lucide-react"

import { SectionShell, SectionHeading, Reveal, cardClasses } from "@/components/landing/shared"
import { DEPARTMENTS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

const LEADS = ["D. Carter", "L. Nguyen", "M. Patel", "R. Alvarez", "J. Chen", "K. Osei", "S. Novak", "P. Duarte"]

export function DepartmentsSection() {
  return (
    <SectionShell id="departments" className="relative">
      <div className="pointer-events-none absolute top-20 -right-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Departments"
          title="Every team, tracked as one organisation"
          description="Eight departments across Vertex Industries — with live headcounts, attendance and leave handled in a single directory."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((dept, i) => {
            const pct = Math.round((dept.count / 287) * 100)
            return (
              <Reveal key={dept.name} delay={(i % 4) * 0.06}>
                <div className={cn(cardClasses, "group h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40")}>
                  <div className="flex items-start justify-between">
                    <span className={cn("flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110", dept.color)}>
                      <dept.icon className="size-4.5" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {dept.count} people
                    </span>
                  </div>
                  <h3 className="mt-3.5 text-[15px] font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{dept.description}</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Headcount share</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                        className={cn("h-full rounded-full bg-gradient-to-r", dept.color)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                    <Avatar name={LEADS[i]} size="xs" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{LEADS[i]}</p>
                      <p className="text-[9px] text-slate-400">Dept. head</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <Users className="size-2.5" /> In directory
                    </span>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}
