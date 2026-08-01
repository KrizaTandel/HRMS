import {
  CalendarCheck2,
  CalendarDays,
  UserCircle,
  UserPlus,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import type { Activity } from "@/data/types"
import { Avatar } from "@/components/ui/avatar"
import { useData } from "@/contexts/data-context"

const ICONS = {
  checkin: { icon: CalendarCheck2, cls: "bg-success/15 text-success" },
  leave: { icon: CalendarDays, cls: "bg-info/15 text-info" },
  salary: { icon: Wallet, cls: "bg-primary/15 text-primary" },
  profile: { icon: UserCircle, cls: "bg-secondary/15 text-secondary" },
  onboarding: { icon: UserPlus, cls: "bg-warning/15 text-warning" },
  attendance: { icon: CalendarCheck2, cls: "bg-violet-500/15 text-violet-500" },
} as const

export function ActivityTimeline({
  activities,
  limit,
  compact = false,
}: {
  activities: Activity[]
  limit?: number
  compact?: boolean
}) {
  const { getEmployee } = useData()
  const items = limit ? activities.slice(0, limit) : activities

  return (
    <ol className="relative space-y-0">
      {items.map((activity, i) => {
        const conf = ICONS[activity.type]
        const Icon = conf.icon
        const emp = getEmployee(activity.employeeId)
        const isLast = i === items.length - 1
        return (
          <li key={activity.id} className="relative flex gap-3.5 pb-5">
            {!isLast && (
              <span className="bg-border absolute top-9 left-[17px] h-[calc(100%-2rem)] w-px" />
            )}
            <div
              className={cn(
                "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full",
                conf.cls
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className={cn("leading-snug", compact ? "text-[13px]" : "text-sm")}>
                {activity.text}
              </p>
              {emp && !compact && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {emp.firstName} {emp.lastName} · {emp.designation}
                </p>
              )}
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {timeAgo(activity.date)}
              </p>
            </div>
            {emp && (
              <Avatar name={`${emp.firstName} ${emp.lastName}`} size="xs" className="mt-1" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
