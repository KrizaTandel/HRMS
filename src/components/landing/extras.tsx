import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion"
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Home,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react"

import { LogoMark } from "@/components/shared/logo"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

// ---------------- Loading screen ----------------

export function LandingLoadingScreen() {
  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="bg-[#F8FAFC] fixed inset-0 z-[100] flex flex-col items-center justify-center dark:bg-[#0B1220]"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <LogoMark className="size-14" />
        <span className="absolute -inset-3 animate-ping rounded-3xl bg-blue-500/15" />
      </motion.div>
      <p className="mt-6 text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">
        Vertex <span className="text-primary">Industries</span>
      </p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
        HRMS Portal
      </p>
      <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-600 to-teal-500"
        />
      </div>
    </motion.div>
  )
}

// ---------------- Back to top ----------------

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 left-5 z-40 flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xl ring-1 ring-slate-200 backdrop-blur transition hover:text-blue-600 lg:bottom-8 lg:left-8 dark:bg-slate-900/90 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-blue-400"
        >
          <ArrowUp className="size-4.5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ---------------- Cookie banner ----------------

const COOKIE_KEY = "nexushr-cookie"

export function CookieBanner() {
  const [dismissed, setDismissed] = useState<string | null>(
    () => (typeof window !== "undefined" ? window.localStorage.getItem(COOKIE_KEY) : null)
  )

  const choose = (v: string) => {
    window.localStorage.setItem(COOKIE_KEY, v)
    setDismissed(v)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-4 bottom-24 left-4 z-40 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-auto sm:max-w-sm dark:border-slate-800 dark:bg-slate-900/95"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-500" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">We value your privacy</p>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            We use cookies to improve your experience and analyze site traffic. You can accept or
            decline at any time.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => choose("accepted")}
              className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              Accept All
            </button>
            <button
              onClick={() => choose("declined")}
              className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------- Custom cursor ----------------

export function CustomCursor() {
  const fine = useMediaQuery("(pointer: fine)")
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 450, damping: 40, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 450, damping: 40, mass: 0.5 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!fine) return
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = (e.target as HTMLElement).closest(
        "a, button, [role='button'], input, textarea, select, label"
      )
      setActive(!!el)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [fine, x, y])

  if (!fine) return null

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed top-0 left-0 z-[95] hidden md:block"
    >
      <motion.span
        animate={{
          width: active ? 44 : 28,
          height: active ? 44 : 28,
          opacity: active ? 0.5 : 0.35,
        }}
        transition={{ duration: 0.2 }}
        className="block -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500"
      />
      <motion.span
        animate={{ scale: active ? 0.4 : 1, opacity: active ? 0.4 : 1 }}
        className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600"
      />
    </motion.div>
  )
}

// ---------------- Mobile bottom nav ----------------

const MOBILE_NAV = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Departments", href: "#departments", icon: Users },
  { label: "Services", href: "#services", icon: Layers },
  { label: "Resources", href: "#resources", icon: BookOpen },
]

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/90 px-2 py-2 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
      {MOBILE_NAV.map((n) => (
        <a
          key={n.label}
          href={n.href}
          className="flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <n.icon className="size-4.5" />
          <span className="text-[10px] font-semibold">{n.label}</span>
        </a>
      ))}
      <Link
        to="/login"
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg"
      >
        Login <ArrowRight className="size-3.5" />
      </Link>
    </nav>
  )
}

