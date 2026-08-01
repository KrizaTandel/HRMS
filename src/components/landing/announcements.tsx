import { SectionShell, SectionHeading, Reveal, cardClasses } from "@/components/landing/shared"
import { ANNOUNCEMENTS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

export function AnnouncementsSection() {
  return (
    <SectionShell id="announcements" className="relative">
      <div className="pointer-events-none absolute top-10 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/5" />
      <div className="relative">
        <SectionHeading
          eyebrow="Announcements"
          title="Company news & circulars"
          description="Stay up to date with the latest notices, policy updates, celebrations and reminders from HR."
        />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="absolute top-0 bottom-0 left-[19px] w-px bg-gradient-to-b from-blue-200 via-slate-200 to-transparent sm:left-1/2 dark:from-blue-800 dark:via-slate-800" />

          <div className="space-y-6">
            {ANNOUNCEMENTS.map((a, i) => (
              <Reveal key={a.title} delay={0.05}>
                <div
                  className={cn(
                    "relative flex items-start gap-4 sm:w-1/2 sm:gap-0",
                    i % 2 === 0 ? "sm:pr-10" : "sm:ml-auto sm:pl-10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-4 left-[9px] size-[21px] rounded-full border-4 border-white shadow sm:left-auto dark:border-slate-950",
                      i % 2 === 0 ? "sm:right-[-10px]" : "sm:left-[-10px]",
                      i % 3 === 0 ? "bg-blue-500" : i % 3 === 1 ? "bg-teal-500" : "bg-violet-500"
                    )}
                  />
                  <div
                    className={cn(
                      "ml-12 w-full sm:ml-0",
                      cardClasses,
                      "group p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", a.tone)}>
                        <a.icon className="size-3" />
                        {a.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{a.date}</span>
                    </div>
                    <h3 className="mt-3 text-[15px] font-bold text-slate-900 dark:text-white">{a.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {a.detail}
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
