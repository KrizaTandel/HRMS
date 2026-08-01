import { useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import { motion, useInView, animate, useScroll, useTransform } from "framer-motion"
import type { Variants } from "framer-motion"

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 },
  }),
}

export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const cardClasses =
  "rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_8px_40px_-12px_rgb(15_23_42/0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"

export const mutedText = "text-slate-500 dark:text-slate-400"

export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  gradientWords,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: "center" | "left"
  gradientWords?: string[]
}) {
  const words = Array.isArray(title) ? title : [title]
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-blue-700 uppercase dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {words.map((w, i) => (
          <span key={i}>
            {w}
            {i < words.length - 1 && " "}
          </span>
        ))}
      </h2>
      {description && (
        <p className={`mt-4 text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400 ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </Reveal>
  )
}

export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}

export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [inView, value, decimals])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Particles({
  count = 22,
  className = "",
}: {
  count?: number
  className?: string
}) {
  const random = mulberry32(42)
  const dots = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: random() * 100,
    top: random() * 100,
    size: 2 + random() * 4,
    delay: random() * 4,
    duration: 4 + random() * 6,
    color: i % 3 === 0 ? "bg-violet-400" : i % 3 === 1 ? "bg-blue-400" : "bg-teal-400",
  }))

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className={`absolute rounded-full ${d.color}`}
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: d.duration, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
        />
      ))}
    </div>
  )
}

export function GlowBlob({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full opacity-60 blur-3xl dark:opacity-40 ${className}`}
    />
  )
}

export function Sparkline({
  data,
  color = "var(--primary)",
  height = 40,
  className = "",
}: {
  data: number[]
  color?: string
  height?: number
  className?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const w = 120
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    height - ((d - min) / range) * (height - 6) - 3,
  ])
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
  const area = `${line} L${w},${height} L0,${height} Z`

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${uid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function useParallax(distance = 40) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  return { ref, y }
}

export function AnimatedBar({
  height,
  delay = 0,
  className = "",
}: {
  height: number | string
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ height: 0 }}
      whileInView={{ height }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    />
  )
}
