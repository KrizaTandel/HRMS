import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { SectionShell, SectionHeading, Reveal, cardClasses } from "@/components/landing/shared"
import { RESOURCES } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

export function ResourcesSection() {
  return (
    <SectionShell id="resources" className="relative">
      <div className="pointer-events-none absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Employee Resources"
          title="Handbooks, policies & help desks"
          description="Everything you need to work at Vertex Industries — documents, policies and support channels, all in one place."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 0.06}>
              <a
                href="#resources"
                onClick={(e) => e.preventDefault()}
                className={cn(
                  cardClasses,
                  "group flex h-full items-center gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/70 hover:shadow-lg dark:hover:border-blue-500/40"
                )}
              >
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", r.tone)}>
                  <r.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{r.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{r.description}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white shadow-lg sm:flex-row sm:p-8">
            <div>
              <h3 className="text-lg font-bold sm:text-xl">Can't find what you need?</h3>
              <p className="mt-1 text-sm text-white/85">
                Sign in to access the full resource library and your personal documents.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition-transform duration-300 hover:scale-[1.04]"
            >
              Employee Login <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
