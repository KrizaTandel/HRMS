import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Megaphone, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react"

import { LogoMark } from "@/components/shared/logo"
import { useTheme } from "@/hooks/use-theme"
import { NAV_LINKS } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

function AnnouncementRibbon({ hidden, onClose }: { hidden: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-10 overflow-hidden bg-gradient-to-r from-blue-700 to-blue-600"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-1.5 text-center">
            <Megaphone className="size-3.5 shrink-0 text-white/90" />
            <a href="#announcements" className="text-[12px] font-medium text-white/95 hover:underline">
              Company notice: Office closed on Friday, August 15 (Independence Day).{" "}
              <span className="hidden sm:inline underline underline-offset-2">View details →</span>
            </a>
            <button
              onClick={onClose}
              aria-label="Dismiss notice"
              className="absolute right-3 rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PortalBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-8" />
      <div className="leading-none">
        <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">
          Vertex Industries
        </span>
        <p className="mt-1 text-[10px] font-medium tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
          HRMS Portal
        </p>
      </div>
    </div>
  )
}

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [ribbonHidden, setRibbonHidden] = useState(false)
  const { toggleTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <AnnouncementRibbon hidden={ribbonHidden} onClose={() => setRibbonHidden(true)} />

      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "border-b border-slate-200/70 bg-white/85 shadow-[0_8px_32px_-12px_rgb(15_23_42/0.1)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 transition-all duration-300 sm:px-8",
            scrolled ? "h-16" : "h-20"
          )}
        >
          <a href="#home" className="shrink-0">
            <PortalBrand />
          </a>

          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolvedTheme}
                  initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                >
                  {resolvedTheme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Link
                to="/register"
                className="hidden rounded-full px-3 py-2 text-[13px] font-semibold text-slate-500 transition hover:text-blue-600 md:block dark:text-slate-400 dark:hover:text-blue-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-300 bg-white/60 px-3.5 py-2 text-[13px] font-semibold text-slate-700 backdrop-blur transition hover:border-blue-500 hover:text-blue-600 md:block dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                Employee Login
              </Link>
              <Link
                to="/login?role=admin"
                className="group relative hidden overflow-hidden rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] lg:block dark:bg-gradient-to-r dark:from-blue-600 dark:to-violet-600"
              >
                <ShieldCheck className="mr-1.5 inline size-3.5 -translate-y-px" />
                HR/Admin Login
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800/70"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-[82%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl lg:hidden dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <PortalBrand />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex size-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-5">
                {NAV_LINKS.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
              <div className="grid gap-2 border-t border-slate-100 p-5 dark:border-slate-800">
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Employee Login
                </Link>
                <Link
                  to="/login?role=admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg dark:bg-gradient-to-r dark:from-blue-600 dark:to-violet-600"
                >
                  HR/Admin Login
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
