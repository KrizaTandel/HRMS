import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface QuickActionItem {
  label: string
  description?: string
  icon: LucideIcon
  tone: "primary" | "secondary" | "success" | "warning" | "danger" | "info"
  onClick?: () => void
  disabled?: boolean
}

const TONE_BG: Record<QuickActionItem["tone"], string> = {
  primary: "from-blue-500 to-indigo-500",
  secondary: "from-teal-500 to-cyan-500",
  success: "from-green-500 to-emerald-500",
  warning: "from-amber-500 to-orange-500",
  danger: "from-rose-500 to-red-500",
  info: "from-sky-500 to-blue-500",
}

export function QuickActions({ items, className }: { items: QuickActionItem[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6", className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={item.disabled}
          onClick={item.onClick}
          className={cn(
            "group relative overflow-hidden rounded-xl border bg-card p-4 text-left shadow-card transition-all duration-300",
            "card-lift",
            item.disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          )}
        >
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r",
              TONE_BG[item.tone]
            )}
          />
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                TONE_BG[item.tone]
              )}
            >
              <item.icon className="size-[18px]" />
            </div>
            <ArrowUpRight className="text-muted-foreground/40 size-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <p className="mt-3 text-sm font-semibold">{item.label}</p>
          {item.description && (
            <p className="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
          )}
        </button>
      ))}
    </div>
  )
}
