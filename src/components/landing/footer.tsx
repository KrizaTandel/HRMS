import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { LogoMark } from "@/components/shared/logo"

const SUPPORT_LINKS = ["IT Help Desk", "HR Help Desk", "Privacy Policy", "Terms & Conditions"]

export function LandingFooter() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-[#0F172A] text-slate-300">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-9" />
              <div className="leading-none">
                <span className="text-lg font-bold text-white">
                  Vertex <span className="text-blue-400">Industries</span>
                </span>
                <p className="mt-1 text-[10px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  HRMS Portal
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Internal Human Resource Management Portal for employees and HR administration.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-white">HR Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-blue-400" /> hr@company.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-blue-400" /> +1 (415) 555-0140
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-blue-400" /> Mon–Fri · 9:00 AM – 6:00 PM
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-blue-400" /> 100 Corporate Way, Floor 6, San
                Francisco, CA
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Support</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((s) => (
                <li key={s}>
                  <a
                    href="#contact"
                    onClick={(e) => e.preventDefault()}
                    className="text-slate-400 transition hover:text-blue-300"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-7 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Vertex Industries. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
