import { useState } from "react"
import {
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  XCircle,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { LeaveFormDialog } from "@/components/shared/leave-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatDate, timeAgo } from "@/lib/format"
import { getLeaveBalances } from "@/data/mockData"
import type { LeaveRequest } from "@/data/types"

const BALANCE_META = {
  paid: { label: "Paid Leave", color: "bg-primary", text: "text-primary" },
  sick: { label: "Sick Leave", color: "bg-secondary", text: "text-secondary" },
  casual: { label: "Casual Leave", color: "bg-warning", text: "text-warning" },
  unpaid: { label: "Unpaid Leave", color: "bg-muted-foreground", text: "text-muted-foreground" },
}

function BalanceCard({ type, used, total, remaining }: { type: keyof typeof BALANCE_META; used: number; total: number; remaining: number }) {
  const meta = BALANCE_META[type]
  const pct = Math.min(100, Math.round((used / Math.max(1, total)) * 100))
  return (
    <Card className="card-lift gap-0 p-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium">{meta.label}</p>
        <span className={cn("size-2.5 rounded-full", meta.color)} />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight">{remaining}</span>
        <span className="text-muted-foreground text-xs">days left</span>
      </div>
      <Progress value={pct} indicatorClassName={meta.color} className="mt-3 h-1.5" />
      <p className="text-muted-foreground mt-2 text-[11px]">
        {used} of {total} used
      </p>
    </Card>
  )
}

export function EmployeeLeavePage() {
  const { user } = useAuth()
  const { getEmployeeLeaves } = useData()
  const loading = useDelayedLoading(600)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const leaves = user ? getEmployeeLeaves(user.id) : []
  const balances = user ? getLeaveBalances(user.id) : null
  const pending = leaves.filter((l) => l.status === "pending").length
  const approved = leaves.filter((l) => l.status === "approved").length
  const rejected = leaves.filter((l) => l.status === "rejected").length

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Apply for leave, view balances and track the status of your requests."
        breadcrumbs={[{ label: "Workplace" }, { label: "Leave Requests" }]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <CalendarPlus className="size-4" />
            Apply Leave
          </Button>
        }
      />

      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {balances &&
          (["paid", "sick", "casual"] as const).map((type) => (
            <BalanceCard
              key={type}
              type={type}
              remaining={balances.remaining[type] ?? 0}
              used={balances.used[type] ?? 0}
              total={balances.allowances[type]}
            />
          ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending Requests" value={pending} icon={Clock} tone="warning" description="Awaiting HR approval" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" description="All time" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} tone="danger" description="All time" />
      </section>

      <Card className="gap-0 p-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-sm font-semibold">Leave History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leaves.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title="No leave requests yet"
              description="Use the Apply Leave button to submit your first request."
              compact
            />
          ) : (
            <DataTable
              className="p-4"
              data={leaves}
              keyExtractor={(l) => l.id}
              pageSize={8}
              searchIndex={(l) => `${l.type} ${l.reason} ${l.status}`}
              onRowClick={(l) => setExpanded(expanded === l.id ? null : l.id)}
              columns={[
                {
                  key: "id",
                  header: "Ref",
                  render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.id}</span>,
                },
                {
                  key: "type",
                  header: "Type",
                  sortable: true,
                  sortValue: (l) => l.type,
                  render: (l) => (
                    <Badge variant="outline" className="capitalize font-medium">
                      {l.type.replace("_", " ")}
                    </Badge>
                  ),
                },
                {
                  key: "period",
                  header: "Period",
                  sortable: true,
                  sortValue: (l) => l.startDate,
                  render: (l) => (
                    <span className="text-[13px]">
                      {formatDate(l.startDate)} <span className="text-muted-foreground">→</span>{" "}
                      {formatDate(l.endDate)}
                    </span>
                  ),
                },
                {
                  key: "applied",
                  header: "Applied On",
                  sortable: true,
                  sortValue: (l) => l.appliedOn,
                  render: (l) => formatDate(l.appliedOn),
                },
                {
                  key: "reason",
                  header: "Reason",
                  className: "max-w-[220px] truncate",
                  render: (l) => <span className="truncate">{l.reason}</span>,
                },
                {
                  key: "status",
                  header: "Status",
                  render: (l) => <StatusBadge status={l.status} />,
                },
                {
                  key: "chevron",
                  header: "",
                  align: "right",
                  render: (l) => (
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground ml-auto size-4 transition-transform",
                        expanded === l.id && "rotate-180"
                      )}
                    />
                  ),
                },
              ]}
            />
          )}

          {expanded && (
            <div className="animate-fade-in mx-4 mb-4 rounded-xl border bg-muted/30 p-4">
              {(() => {
                const req = leaves.find((l) => l.id === expanded)
                if (!req) return null
                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        Approval Timeline
                      </p>
                      <ol className="relative space-y-4 border-l pl-4">
                        {req.timeline.map((t, i) => (
                          <li key={i} className="relative">
                            <span className="bg-primary absolute top-1 -left-[21px] size-2 rounded-full ring-2 ring-background" />
                            <p className="text-sm font-medium">{t.action}</p>
                            <p className="text-muted-foreground text-xs">
                              by {t.by} · {timeAgo(t.date)}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        Details
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{req.reason}</p>
                      {req.attachment && (
                        <p className="mt-2 text-xs">
                          <span className="font-medium">Attachment:</span>{" "}
                          <span className="text-primary underline">{req.attachment}</span>
                        </p>
                      )}
                      <Separator className="my-4" />
                      <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        Comments
                      </p>
                      {req.comments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No comments yet.</p>
                      ) : (
                        req.comments.map((c, i) => (
                          <div key={i} className="mb-3 rounded-lg border bg-card p-3">
                            <p className="flex items-center gap-1.5 text-xs font-medium">
                              <Info className="size-3 text-muted-foreground" />
                              {c.by}
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveFormDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
