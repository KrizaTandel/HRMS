import { useMemo, useState } from "react"
import { Mail, MailOpen } from "lucide-react"

import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { SearchInput } from "@/components/shared/search-input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import {
  ADMIN_EMAIL_TYPES,
  EMPLOYEE_EMAIL_TYPES,
  EMAIL_CATALOG,
  markEmailRead,
  useEmailOutbox,
} from "@/lib/emails"

function humanize(category: string): string {
  return category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AdminEmailInboxPage() {
  const emails = useEmailOutbox()
  const loading = useDelayedLoading(500)
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<"all" | "admin" | "employee">("all")

  const unread = emails.filter((e) => !e.read).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...emails]
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
      .filter((e) => {
        if (scope === "admin" && !ADMIN_EMAIL_TYPES.includes(e.category)) return false
        if (scope === "employee" && !EMPLOYEE_EMAIL_TYPES.includes(e.category)) return false
        if (q && !`${e.to} ${e.subject} ${e.category}`.toLowerCase().includes(q)) return false
        return true
      })
  }, [emails, query, scope])

  const sentToday = emails.filter((e) => {
    const d = new Date(e.sentAt)
    return d.toDateString() === new Date().toDateString()
  }).length

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Alerts"
        description="Outbox of HR-related emails sent by the system to employees and HR."
        breadcrumbs={[{ label: "Management" }, { label: "Email Alerts" }]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          {(["all", "admin", "employee"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                scope === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? "All" : s === "admin" ? "HR Alerts" : "Employee"}
            </button>
          ))}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search recipient, subject..."
          className="sm:max-w-xs"
        />
      </div>

      {visible.length === 0 ? (
        <Card className="gap-0 p-0">
          <EmptyState
            icon={Mail}
            title="No emails found"
            description="Try adjusting your search or filter."
          />
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
            <span>
              {visible.length} email{visible.length === 1 ? "" : "s"} · {unread} unread
            </span>
            <span>{sentToday} sent today</span>
          </div>
          <div className="divide-y">
            {visible.map((e) => {
              const meta = EMAIL_CATALOG[e.category]
              const isAdmin = meta.recipient === "admin"
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => markEmailRead(e.id)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 sm:px-5"
                >
                  <span
                    className={cn(
                      "text-muted-foreground mt-0.5 shrink-0",
                      !e.read && "text-primary"
                    )}
                  >
                    {e.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className={cn("text-sm font-semibold", !e.read && "text-primary")}>
                        {e.subject}
                      </span>
                      {!e.read && <span className="bg-primary size-1.5 rounded-full" />}
                      <span className="text-muted-foreground ml-auto text-xs">
                        {timeAgo(e.sentAt)}
                      </span>
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      To: {e.to}
                    </span>
                    <span className="text-muted-foreground mt-1 line-clamp-2 block text-[13px]">
                      {e.preview}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant={isAdmin ? "secondary" : "outline"} className="text-[10px]">
                        {isAdmin ? "HR Alert" : "Employee"}
                      </Badge>
                      <Badge variant="muted" className="text-[10px]">
                        {humanize(e.category)}
                      </Badge>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
