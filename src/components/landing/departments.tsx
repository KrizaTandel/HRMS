import { SectionShell, SectionHeading, Reveal, cardClasses } from "@/components/landing/shared"
import { DEPARTMENTS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

export function DepartmentsSection() {
  return (
    <SectionShell id="departments" className="relative">
      <div className="pointer-events-none absolute top-20 -right-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Departments"
          title="Every team, managed in one directory"
          description="Six departments across Vertex Industries — all supported through a single HR portal."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept, i) => (
            <Reveal key={dept.name} delay={(i % 3) * 0.06}>
              <div
                className={cn(
                  cardClasses,
                  "group flex h-full items-center gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                    dept.color
                  )}
                >
                  <dept.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {dept.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
