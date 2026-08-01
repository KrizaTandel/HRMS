import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Tone = "primary" | "secondary" | "success" | "warning" | "danger" | "info"

const TONE_STYLES: Record<
  Tone,
  { chip: string; glow: string; text: string }
> = {
  primary: {
    chip: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300",
    glow: "bg-primary/15",
    text: "text-primary",
  },
  secondary: {
    chip: "bg-secondary/10 text-secondary dark:bg-secondary/15 dark:text-teal-300",
    glow: "bg-secondary/15",
    text: "text-secondary",
  },
  success: {
    chip: "bg-success/10 text-success dark:bg-success/15 dark:text-green-300",
    glow: "bg-success/15",
    text: "text-success",
  },
  warning: {
    chip: "bg-warning/10 text-warning dark:bg-warning/15 dark:text-amber-300",
    glow: "bg-warning/15",
    text: "text-warning",
  },
  danger: {
    chip: "bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-red-300",
    glow: "bg-destructive/15",
    text: "text-destructive",
  },
  info: {
    chip: "bg-info/10 text-info dark:bg-info/15 dark:text-blue-300",
    glow: "bg-info/15",
    text: "text-info",
  },
}

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone?: Tone
  trend?: { value: string; direction: "up" | "down"; label: string }
  description?: string
  progress?: number
  prefix?: string
  suffix?: string
  format?: (n: number) => string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  description,
  progress,
  prefix = "",
  suffix = "",
  format,
  className,
}: StatCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <Card
      className={cn(
        "card-lift relative gap-0 overflow-hidden p-5",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-60",
          styles.glow
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[13px] font-medium">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <AnimatedCounter
              value={value}
              format={format}
              className="text-2xl font-bold tracking-tight sm:text-[28px]"
            />
            {prefix && (
              <span className="text-muted-foreground text-sm">{prefix}</span>
            )}
            {suffix && (
              <span className="text-muted-foreground text-sm">{suffix}</span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
            styles.chip
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>

      {typeof progress === "number" && (
        <Progress
          value={progress}
          indicatorClassName={cn("bg-gradient-to-r", styles.chip)}
          className="mt-4 h-1.5"
        />
      )}

      {(trend || description) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                trend.direction === "up"
                  ? "bg-success/10 text-success dark:text-green-300"
                  : "bg-destructive/10 text-destructive dark:text-red-300"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-muted-foreground">
            {description ?? trend?.label}
          </span>
        </div>
      )}
    </Card>
  )
}
