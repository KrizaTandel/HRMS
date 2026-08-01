import { Link } from "react-router-dom"
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { LogoMark } from "@/components/shared/logo"
import { FOOTER_LINKS } from "@/lib/landing-data"

export function LandingFooter() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-[#0F172A] text-slate-300">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative space-y-14 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
                The employee and HR portal for Vertex Industries — attendance, leave, payroll,
                records and HR services in one secure workspace.
              </p>

              <div className="mt-6 space-y-2.5 text-sm text-slate-400">
                <p className="flex items-center gap-2.5">
                  <MapPin className="size-4 shrink-0 text-blue-400" /> 100 Corporate Way, Floor 6, San Francisco, CA
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-blue-400" /> hr@company.com
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-blue-400" /> +1 (415) 555-0140 · Ext. 4400
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-blue-400" /> Mon–Fri · 9:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-sm font-bold text-white">{group}</p>
                <ul className="mt-4 space-y-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#home"
                        onClick={(e) => e.preventDefault()}
                        className="text-sm text-slate-400 transition hover:text-blue-300"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-slate-800 pt-7 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Vertex Industries. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-slate-400">
              <a href="#home" onClick={(e) => e.preventDefault()} className="transition hover:text-blue-300">Privacy Policy</a>
              <a href="#home" onClick={(e) => e.preventDefault()} className="transition hover:text-blue-300">Terms of Use</a>
              <a href="#home" onClick={(e) => e.preventDefault()} className="transition hover:text-blue-300">Cookies</a>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
              >
                Employee Login
              </Link>
              <Link
                to="/login?role=admin"
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
              >
                <ShieldCheck className="size-3.5" /> HR/Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
