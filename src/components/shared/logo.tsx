import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logog" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logog)" />
      <path d="M24 12 L34 20 V28 H32 V22 L24 16 L16 22 V28 H14 V20 Z" fill="#fff" />
      <rect x="14" y="28" width="20" height="3" rx="1.5" fill="#fff" />
      <rect x="22.5" y="31" width="3" height="6" rx="1.5" fill="#fff" />
      <rect x="17" y="32" width="3" height="4" rx="1.5" fill="#fff" opacity=".75" />
      <rect x="28" y="32" width="3" height="4" rx="1.5" fill="#fff" opacity=".75" />
    </svg>
  )
}

export function Logo({
  className,
  dark = false,
}: {
  className?: string
  dark?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8" />
      <div className="leading-none">
        <span
          className={cn(
            "text-[17px] font-bold tracking-tight",
            dark ? "text-white" : "text-foreground"
          )}
        >
          Nexus<span className="text-primary">HR</span>
        </span>
        <p
          className={cn(
            "mt-1 text-[10px] font-medium tracking-[0.18em] uppercase",
            dark ? "text-slate-500" : "text-muted-foreground"
          )}
        >
          Human Resources
        </p>
      </div>
    </div>
  )
}
