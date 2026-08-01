import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import type { Activity } from "@/data/types"

const DOT_CLASS: Record<Activity["type"], string> = {
  checkin: "bg-success",
  leave: "bg-info",
  salary: "bg-primary",
  profile: "bg-secondary",
  onboarding: "bg-warning",
  attendance: "bg-violet-500",
}

export function MinimalTimeline({
  activities,
  limit,
}: {
  activities: Activity[]
  limit?: number
}) {
  const items = limit ? activities.slice(0, limit) : activities

  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
          {i !== items.length - 1 && (
            <span className="bg-border absolute top-2.5 left-[5px] h-[calc(100%-1rem)] w-px" />
          )}
          <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT_CLASS[item.type])} />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug">{item.text}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{timeAgo(item.date)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
