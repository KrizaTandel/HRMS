import { useRef } from "react"
import { motion, useScroll } from "framer-motion"

import { SectionShell, SectionHeading } from "@/components/landing/shared"
import { WORKFLOW_STEPS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

export function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.5"],
  })

  return (
    <SectionShell id="workflow" className="relative">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,black,transparent)]" />
      <div className="relative">
        <SectionHeading
          eyebrow="How it works"
          title="From sign-in to payslip in eight steps"
          description="One seamless, automated flow that connects every part of the employee journey."
        />

        <div ref={ref} className="mt-14">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full origin-left rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-blue-300/70 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-500/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="size-4.5" />
                    </span>
                    <span className="text-2xl font-extrabold text-slate-200 transition-colors group-hover:text-blue-200 dark:text-slate-700 dark:group-hover:text-blue-900">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
