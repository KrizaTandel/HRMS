import { useMemo, useState } from "react"
import { BellOff, CheckCheck, Inbox, Trash2 } from "lucide-react"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { SearchInput } from "@/components/shared/search-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import type { AppNotification } from "@/data/types"

const TONE_META: Record<AppNotification["tone"], { dot: string; text: string; bg: string }> = {
  success: { dot: "bg-success", text: "text-success", bg: "bg-success/10" },
  info: { dot: "bg-info", text: "text-info", bg: "bg-info/10" },
  warning: { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
  danger: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
}

type Filter = "all" | "unread" | "read"

export function NotificationCenterPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } =
    useData()
  const loading = useDelayedLoading(500)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const unread = notifications.filter((n) => !n.read).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...notifications]
      .sort((a, b) => b.time.localeCompare(a.time))
      .filter((n) => {
        if (filter === "unread" && n.read) return false
        if (filter === "read" && !n.read) return false
        if (q && !`${n.title} ${n.description}`.toLowerCase().includes(q)) return false
        return true
      })
  }, [notifications, query, filter])

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Stay up to date with leave decisions, payroll and company notices."
        breadcrumbs={[{ label: "General" }, { label: "Notifications" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            disabled={unread === 0}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          {(["all", "unread", "read"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f === "unread" ? `Unread (${unread})` : "Read"}
            </button>
          ))}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search notifications..."
          className="sm:max-w-xs"
        />
      </div>

      {visible.length === 0 ? (
        <Card className="gap-0 p-0">
          <EmptyState
            icon={notifications.length === 0 ? BellOff : Inbox}
            title={notifications.length === 0 ? "No notifications" : "No matches found"}
            description={
              notifications.length === 0
                ? "You're all caught up. New alerts will appear here."
                : "Try adjusting your search or filter."
            }
          />
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden p-0">
          <div className="divide-y">
            {visible.map((n) => {
              const tone = TONE_META[n.tone]
              return (
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5",
                    !n.read && "bg-primary/[0.03]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="text-left outline-none"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        tone.bg
                      )}
                    >
                      <span className={cn("size-2.5 rounded-full", tone.dot, n.read && "opacity-30")} />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="min-w-0 flex-1 text-left outline-none"
                  >
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className={cn("size-1.5 rounded-full", tone.dot)} />}
                      <span className="text-muted-foreground ml-auto text-xs">
                        {timeAgo(n.time)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-[13px] leading-relaxed">
                      {n.description}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete notification"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
