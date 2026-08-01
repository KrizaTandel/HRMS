import { useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, timeAgo } from "@/lib/format"
import { downloadCsv } from "@/lib/exportCsv"
import type { Employee, LeaveRequest } from "@/data/types"

export function AdminLeaveManagementPage() {
  const { leaves, employees, getEmployee, approveLeave, rejectLeave } = useData()
  const loading = useDelayedLoading(600)
  const [pending, setPending] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})

  const sorted = [...leaves].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
  const pendingList = sorted.filter((l) => l.status === "pending")
  const approvedList = sorted.filter((l) => l.status === "approved")
  const rejectedList = sorted.filter((l) => l.status === "rejected")

  const handleApprove = (l: LeaveRequest) => {
    approveLeave(l.id, comments[l.id]?.trim())
    toast.success("Leave approved", {
      description: `${getEmployee(l.employeeId)?.firstName}'s request ${l.id} was approved.`,
    })
    setPending(null)
  }

  const handleReject = (l: LeaveRequest) => {
    rejectLeave(l.id, comments[l.id]?.trim())
    toast.success("Leave rejected", {
      description: `${getEmployee(l.employeeId)?.firstName}'s request ${l.id} was rejected.`,
    })
    setRejectId(null)
  }

  const comment = (l: LeaveRequest) =>
    comments[l.id] ?? (l.comments[l.comments.length - 1]?.text ?? "")

  const exportLeaves = (rows: LeaveRequest[]) =>
    downloadCsv(
      "leave-requests.csv",
      ["ID", "Employee", "Type", "Start", "End", "Reason", "Status"],
      rows.map((l) => [
        l.id,
        `${getEmployee(l.employeeId)?.firstName} ${getEmployee(l.employeeId)?.lastName}`,
        l.type,
        l.startDate,
        l.endDate,
        l.reason,
        l.status,
      ])
    )

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Review, approve or reject leave requests submitted by your team."
        breadcrumbs={[{ label: "Management" }, { label: "Leave Management" }]}
      />

      <section className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={pendingList.length} icon={Clock} tone="warning" description="Awaiting review" />
        <StatCard label="Approved" value={approvedList.length} icon={CheckCircle2} tone="success" description="All time" />
        <StatCard label="Rejected" value={rejectedList.length} icon={XCircle} tone="danger" description="All time" />
      </section>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingList.length > 0 && (
              <span className="bg-warning text-warning-foreground ml-1 rounded-full px-1.5 text-[10px] font-bold">
                {pendingList.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <span className="bg-success/15 text-success ml-1 rounded-full px-1.5 text-[10px] font-bold">
              {approvedList.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <span className="bg-destructive/15 text-destructive ml-1 rounded-full px-1.5 text-[10px] font-bold">
              {rejectedList.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="animate-fade-in">
          {pendingList.length === 0 ? (
            <Card className="gap-0 p-0">
              <EmptyState
                icon={CheckCircle2}
                title="All caught up!"
                description="There are no leave requests waiting for your approval."
              />
            </Card>
          ) : (
            <div className="stagger grid gap-4 lg:grid-cols-2">
              {pendingList.map((l) => {
                const emp = getEmployee(l.employeeId)
                return (
                  <Card key={l.id} className="card-lift gap-0 overflow-hidden p-0">
                    <div className="bg-gradient-to-r from-primary to-secondary h-1.5" />
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${emp?.firstName} ${emp?.lastName}`} size="md" />
                          <div>
                            <p className="font-semibold">
                              {emp?.firstName} {emp?.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {emp?.designation} · {emp?.department}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">
                              {emp?.id} · Applied {timeAgo(l.appliedOn)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize font-medium">
                          {l.type.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3">
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">Start Date</p>
                          <p className="mt-0.5 text-sm font-semibold">{formatDate(l.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">End Date</p>
                          <p className="mt-0.5 text-sm font-semibold">{formatDate(l.endDate)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[11px] font-medium">
                          <MessageSquare className="size-3" /> Reason
                        </p>
                        <p className="text-sm leading-relaxed">{l.reason}</p>
                        {l.attachment && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs">
                            <Paperclip className="text-muted-foreground size-3" />
                            <span className="text-primary underline">{l.attachment}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment (optional)"
                          value={comment(l)}
                          onChange={(e) =>
                            setComments((c) => ({ ...c, [l.id]: e.target.value }))
                          }
                          className="flex-1"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => setPending(l.id)}>
                          <CheckCircle2 className="size-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                          onClick={() => setRejectId(l.id)}
                        >
                          <XCircle className="size-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="animate-fade-in">
          <Card className="gap-0 p-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-semibold">Approved Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LeaveTable rows={approvedList} getEmployee={getEmployee} onExport={() => exportLeaves(approvedList)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="animate-fade-in">
          <Card className="gap-0 p-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-semibold">Rejected Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LeaveTable rows={rejectedList} getEmployee={getEmployee} onExport={() => exportLeaves(rejectedList)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Approve this leave request?"
        description="The employee will be notified immediately and their leave balance will be updated."
        confirmLabel="Approve Leave"
        onConfirm={() => {
          const l = pendingList.find((x) => x.id === pending)
          if (l) handleApprove(l)
        }}
      />
      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject this leave request?"
        description="The employee will be notified with your comment. This action can be revisited later."
        confirmLabel="Reject Leave"
        destructive
        onConfirm={() => {
          const l = pendingList.find((x) => x.id === rejectId)
          if (l) handleReject(l)
        }}
      />
    </div>
  )
}

function LeaveTable({
  rows,
  getEmployee,
  onExport,
}: {
  rows: LeaveRequest[]
  getEmployee: (id: string) => Employee | undefined
  onExport: () => void
}) {
  const { employees } = useData()
  return (
    <DataTable
      className="p-4"
      data={rows}
      keyExtractor={(l) => l.id}
      pageSize={8}
      searchIndex={(l) => {
        const emp = employees.find((e) => e.id === l.employeeId)
        return `${l.type} ${l.reason} ${l.status} ${emp?.firstName} ${emp?.lastName}`
      }}
      onExport={onExport}
      columns={[
        {
          key: "emp",
          header: "Employee",
          render: (l) => {
            const emp = getEmployee(l.employeeId)
            return (
              <div className="flex items-center gap-2.5">
                <Avatar name={`${emp?.firstName} ${emp?.lastName}`} size="sm" />
                <div>
                  <p className="font-medium">{emp?.firstName} {emp?.lastName}</p>
                  <p className="text-muted-foreground text-[11px]">{emp?.department}</p>
                </div>
              </div>
            )
          },
        },
        {
          key: "type",
          header: "Type",
          sortable: true,
          sortValue: (l) => l.type,
          render: (l) => (
            <Badge variant="outline" className="capitalize">
              {l.type.replace("_", " ")}
            </Badge>
          ),
        },
        {
          key: "period",
          header: "Period",
          render: (l) => (
            <span className="text-[13px]">
              {formatDate(l.startDate)} → {formatDate(l.endDate)}
            </span>
          ),
        },
        {
          key: "reason",
          header: "Reason",
          className: "max-w-[200px] truncate",
          render: (l) => <span className="truncate">{l.reason}</span>,
        },
        {
          key: "applied",
          header: "Applied",
          sortable: true,
          sortValue: (l) => l.appliedOn,
          render: (l) => formatDate(l.appliedOn),
        },
        {
          key: "status",
          header: "Status",
          render: (l) => <StatusBadge status={l.status} />,
        },
      ]}
    />
  )
}
