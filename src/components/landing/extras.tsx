import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Building2,
  Command,
  Headphones,
  Home,
  Layers,
  LayoutDashboard,
  LogIn,
  Megaphone,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Users,
  X,
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

// ---------------- Chat widget ----------------

interface ChatMsg {
  from: "bot" | "user"
  text: string
}

const BOT_REPLY =
  "Hi! I'm the HR assistant 🤖. Ask about attendance, leave, payroll or policies — or sign in to the portal and manage it yourself. How can I help?"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "bot", text: "Hi there! 👋 How can I help you today?" },
  ])
  const [draft, setDraft] = useState("")
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing, open])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [...m, { from: "user", text }])
    setDraft("")
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: "bot", text: BOT_REPLY }])
    }, 1200)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 bottom-24 z-40 flex w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-8 items-center justify-center rounded-full bg-white/20 text-white">
                  <MessageCircle className="size-4" />
                  <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-600" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">HR Assistant</p>
                  <p className="text-[10px] text-white/80">Typically replies instantly</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 text-white/90 transition hover:bg-white/20">
                <X className="size-4" />
              </button>
            </div>

            <div ref={listRef} className="flex max-h-72 min-h-40 flex-col gap-2.5 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", m.from === "bot" ? "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" : "ml-auto rounded-br-md bg-gradient-to-r from-blue-600 to-violet-600 text-white")}
                >
                  {m.text}
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 dark:bg-slate-800">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      className="size-1.5 rounded-full bg-slate-400"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send()
                  }}
                  placeholder="Type a message…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
                <button onClick={send} aria-label="Send message" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white transition hover:scale-105">
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed right-4 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_16px_40px_-12px_rgb(37_99_235/0.8)] sm:right-6 sm:bottom-6 dark:shadow-[0_16px_40px_-12px_rgb(99_102_241/0.6)]"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}

// ---------------- Command palette ----------------

interface CommandItem {
  label: string
  description: string
  group: string
  icon: LucideIcon
  href?: string
  to?: string
}

const COMMANDS: CommandItem[] = [
  { label: "Home", description: "Back to the hero", group: "Sections", icon: Home, href: "#home" },
  { label: "About HRMS", description: "About the portal", group: "Sections", icon: Building2, href: "#about" },
  { label: "Departments", description: "Teams & headcounts", group: "Sections", icon: Users, href: "#departments" },
  { label: "Services", description: "HR services", group: "Sections", icon: Layers, href: "#services" },
  { label: "Modules", description: "Explore the portal", group: "Sections", icon: LayoutDashboard, href: "#modules" },
  { label: "Employee Resources", description: "Policies & handbooks", group: "Sections", icon: BookOpen, href: "#resources" },
  { label: "Announcements", description: "Company circulars", group: "Sections", icon: Megaphone, href: "#announcements" },
  { label: "Contact HR", description: "Talk to the HR team", group: "Sections", icon: Headphones, href: "#contact" },
  { label: "Employee Login", description: "Sign in as an employee", group: "Application", icon: LogIn, to: "/login" },
  { label: "HR/Admin Login", description: "Sign in as an administrator", group: "Application", icon: ShieldCheck, to: "/login?role=admin" },
  { label: "Employee Dashboard", description: "Personal workspace", group: "Application", icon: LayoutDashboard, to: "/employee" },
  { label: "Admin Dashboard", description: "HR command center", group: "Application", icon: ShieldCheck, to: "/admin" },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) : COMMANDS
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const run = (item: CommandItem) => {
    onClose()
    if (item.to) {
      navigate(item.to)
    } else if (item.href) {
      document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && results[active]) {
      run(results[active])
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const c of results) {
      map.set(c.group, [...(map.get(c.group) ?? []), c])
    }
    return [...map.entries()]
  }, [results])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
              <Search className="size-4 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, modules, actions…"
                className="h-13 flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700">esc</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {groups.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No results for "{query}"</p>
              )}
              {groups.map(([group, items]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    {group}
                  </p>
                  {items.map((item, i) => {
                    const flatIndex = results.indexOf(item)
                    return (
                      <button
                        key={item.label}
                        onMouseEnter={() => setActive(flatIndex)}
                        onClick={() => run(item)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                          flatIndex === active ? "bg-blue-50 dark:bg-blue-500/10" : ""
                        )}
                      >
                        <span className={cn("flex size-8 items-center justify-center rounded-lg", flatIndex === active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300")}>
                          <item.icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                          <p className="truncate text-[11px] text-slate-400">{item.description}</p>
                        </div>
                        {item.to && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-500">
                            Open <ArrowRight className="size-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400 dark:border-slate-800">
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">esc</kbd> close</span>
            </div>
          </motion.div>
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

// ---------------- Global ⌘K hint chip ----------------

export function CommandHint() {
  return (
    <button
      onClick={() => {
        window.dispatchEvent(new Event("nexushr:cmd"))
      }}
      className="fixed bottom-24 right-4 z-30 hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-lg backdrop-blur transition hover:border-blue-300 hover:text-blue-600 lg:flex dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
    >
      <Command className="size-3.5" /> Search
      <kbd className="rounded border border-slate-200 px-1 text-[9px] dark:border-slate-700">⌘K</kbd>
    </button>
  )
}
