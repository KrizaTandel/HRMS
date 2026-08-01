import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { MapPin, Send } from "lucide-react"

import {
  SectionShell,
  SectionHeading,
  Reveal,
  cardClasses,
  mutedText,
} from "@/components/landing/shared"
import { HR_CONTACT } from "@/lib/landing-data"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const TOPICS = [
  "General inquiry",
  "Benefits & wellness",
  "Payroll & payslips",
  "Leave & absence",
  "IT support",
  "Report an issue",
]

function MapPlaceholder() {
  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-100 via-teal-50 to-violet-100 dark:border-slate-800 dark:from-blue-950/40 dark:via-slate-900 dark:to-violet-950/40">
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
        <g stroke="currentColor" strokeOpacity="0.18" fill="none" strokeWidth="1.5">
          <path d="M-20 120 C 80 100, 140 150, 260 120 S 440 90, 560 130" />
          <path d="M120 -20 C 110 70, 150 160, 100 280" />
          <path d="M300 -20 C 290 90, 330 180, 280 300" />
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <span className="absolute -inset-3 animate-ping rounded-full bg-blue-500/20" />
          <span className="relative flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-xl">
            <MapPin className="size-5" />
          </span>
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
        Vertex Industries · Head Office
      </div>
    </div>
  )
}

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    toast.success("Request sent to HR", {
      description: `Thanks ${form.name || "there"}! The HR team will get back to you within one business day.`,
    })
    setForm({ name: "", email: "", topic: "", message: "" })
  }

  return (
    <SectionShell id="contact" className="relative">
      <div className="pointer-events-none absolute -top-10 left-1/4 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl dark:bg-teal-500/10" />
      <div className="relative">
        <SectionHeading
          eyebrow="Contact HR"
          title="Talk to the HR team"
          description="Questions about benefits, payroll, leave or anything work-related — we're here to help."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <form onSubmit={submit} className={cn(cardClasses, "space-y-4 p-6 sm:p-8")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full name</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Cooper"
                    className="h-11 rounded-xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Work email</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@vertex.com"
                    className="h-11 rounded-xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Topic</label>
                <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white/80 text-[15px] dark:border-slate-700 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Message</label>
                <Textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can HR help you?"
                  className="rounded-xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60"
                />
              </div>
              <Button
                type="submit"
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Send to HR <Send className="size-4" />
              </Button>
              <p className={cn(mutedText, "text-center text-[11px]")}>
                Your message is sent to the HR helpdesk. Internal requests may be answered faster in the portal.
              </p>
            </form>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-5">
            <MapPlaceholder />

            <div className={cn(cardClasses, "grid gap-4 p-6 sm:grid-cols-2 sm:p-6")}>
              {HR_CONTACT.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg">
                    <c.icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-slate-900 uppercase dark:text-white">{c.label}</p>
                    <p className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 px-6 py-4 text-sm font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              Employees: most requests — leave, payslips, profile updates — are handled instantly in
              the self-service portal. Sign in to get started.
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  )
}
