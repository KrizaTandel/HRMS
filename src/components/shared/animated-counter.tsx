import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}

export function AnimatedCounter({
  value,
  duration = 900,
  className,
  format = (n) => Math.round(n).toLocaleString(),
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>(0)
  const reduced = useRef(false)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      reduced.current = true
    }
  }, [])

  useEffect(() => {
    if (reduced.current) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}
