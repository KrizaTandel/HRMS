import { useMemo, useState } from "react"
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  MailOpen,
  ScrollText,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { DataTable } from "@/components/shared/data-table"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  approveAccount,
  rejectAccount,
  resendVerification,
  setAccountStatus,
  useAccountsStore,
} from "@/lib/accounts"
import { useAuditLog } from "@/lib/audit-log"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AccountStatus, RegistrationAccount } from "@/data/types"

const STATUS_META: Record<AccountStatus, { label: string; variant: "success" | "danger" | "warning" | "info" | "muted" | "secondary" }> = {
  "pending-verification": { label: "Pending", variant: "warning" },
  "pending-approval": { label: "Verified", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  suspended: { label: "Suspended", variant: "danger" },
  inactive: { label: "Inactive", variant: "muted" },
}

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge variant={meta.variant} className="gap-1.5 capitalize">
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}

const FILTERS: { value: AccountStatus | "all"; label: string }[] = [
  { value: "all", label: "All requests" },
  { value: "pending-approval", label: "Verified" },
  { value: "pending-verification", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
]

export function AdminApprovalsPage() {
  const { user } = useAuth()
  const accounts = useAccountsStore()
  const auditLog = useAuditLog()
  const loading = useDelayedLoading(500)
  const [filter, setFilter] = useState<AccountStatus | "all">("all")
  const [target, setTarget] = useState<RegistrationAccount | null>(null)
  const [dialog, setDialog] = useState<"approve" | "reject" | "details" | null>(null)
  const [comment, setComment] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const adminName = user ? `${user.firstName} ${user.lastName}` : "HR Admin"

  const counts = useMemo(() => ({
    pending: accounts.filter((a) => a.status === "pending-approval").length,
    verification: accounts.filter((a) => a.status === "pending-verification").length,
    approved: accounts.filter((a) => a.status === "approved").length,
    rejected: accounts.filter((a) => a.status === "rejected").length,
  }), [accounts])

  const filtered = useMemo(
    () => (filter === "all" ? accounts : accounts.filter((a) => a.status === filter)),
    [accounts, filter]
  )

  const openApprove = (acc: RegistrationAccount) => {
    setTarget(acc)
    setComment("")
    setDialog("approve")
  }

  const openReject = (acc: RegistrationAccount) => {
    setTarget(acc)
    setReason("")
    setDialog("reject")
  }

  const openDetails = (acc: RegistrationAccount) => {
    setTarget(acc)
    setDialog("details")
  }

  const confirmApprove = () => {
    if (!target) return
    setSubmitting(true)
    setTimeout(() => {
      const updated = approveAccount(target.id, adminName, comment.trim() || undefined)
      if (updated && updated.status === "approved") {
        toast.success("Application approved", {
          description: `${updated.firstName} ${updated.lastName} can now sign in.`,
        })
      } else {
        toast.error("Could not approve", { description: "The application is no longer in a pending state." })
      }
      setSubmitting(false)
      setDialog(null)
      setTarget(null)
    }, 500)
  }

  const confirmReject = () => {
    if (!target) return
    if (!reason.trim()) {
      toast.error("Reason required", { description: "Please provide a rejection reason." })
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const updated = rejectAccount(target.id, adminName, reason)
      if (updated) {
        toast.success("Application rejected", {
          description: `${updated.firstName} ${updated.lastName} was notified with the reason.`,
        })
      }
      setSubmitting(false)
      setDialog(null)
      setTarget(null)
    }, 500)
  }

  const resend = (acc: RegistrationAccount) => {
    const updated = resendVerification(acc.id)
    if (updated) {
      toast.success("Verification email sent", {
        description: `A fresh link was sent to ${updated.email}.`,
      })
    }
  }

  const toggleActive = (acc: RegistrationAccount) => {
    const next = acc.status === "approved" ? "inactive" : "approved"
    const updated = setAccountStatus(acc.id, next)
    if (updated) {
      toast.success(next === "inactive" ? "Account deactivated" : "Account reactivated", {
        description: `${updated.firstName} ${updated.lastName}'s account is now ${next}.`,
      })
    }
  }

  const reapprove = (acc: RegistrationAccount) => {
    setAccountStatus(acc.id, "pending-approval")
    const updated = approveAccount(acc.id, adminName, "Re-approved after review")
    if (updated && updated.status === "approved") {
      toast.success("Application re-approved", {
        description: `${updated.firstName} ${updated.lastName} can now sign in.`,
      })
    }
  }

  if (loading) return <PageLoader variant="list" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Review and manage employee registration requests before they gain portal access."
        breadcrumbs={[{ label: "Management" }, { label: "Approvals" }]}
      />

      <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Approval" value={counts.pending} icon={UserCheck} tone="primary" description="Awaiting your review" />
        <StatCard label="Awaiting Verification" value={counts.verification} icon={MailOpen} tone="info" description="Not yet email-verified" />
        <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} tone="success" description="Active portal users" />
        <StatCard label="Rejected" value={counts.rejected} icon={XCircle} tone="danger" description="Declined applications" />
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="gap-2"
          >
            {f.value === "pending-approval" && counts.pending > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full px-1.5 text-[10px] font-bold">
                {counts.pending}
              </span>
            )}
            {f.label}
          </Button>
        ))}
      </div>

      <DataTable<RegistrationAccount>
        data={filtered}
        keyExtractor={(a) => a.id}
        pageSize={10}
        searchIndex={(a) =>
          `${a.firstName} ${a.lastName} ${a.email} ${a.employeeId} ${a.department} ${a.designation}`
        }
        emptyMessage="No registration requests"
        emptyDescription="New sign-ups will appear here for review once an employee registers and verifies their email."
        columns={[
          {
            key: "applicant",
            header: "Applicant",
            sortable: true,
            sortValue: (a) => `${a.firstName} ${a.lastName}`,
            render: (a) => (
              <div className="flex items-center gap-3">
                <Avatar name={`${a.firstName} ${a.lastName}`} image={a.photo} size="sm" />
                <div>
                  <p className="font-medium">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">{a.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "employeeId",
            header: "Requested ID",
            render: (a) => (
              <span className="font-mono text-xs text-muted-foreground">E-{a.employeeId}</span>
            ),
          },
          {
            key: "department",
            header: "Department",
            sortable: true,
            sortValue: (a) => a.department,
            render: (a) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  <Building2 className="text-muted-foreground size-3.5" />
                  {a.department}
                </span>
                <span className="text-muted-foreground text-xs">{a.designation}</span>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (a) => (
              <Badge variant={a.role === "admin" ? "secondary" : "muted"}>
                {a.role === "admin" ? "HR Admin" : "Employee"}
              </Badge>
            ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            sortValue: (a) => a.status,
            render: (a) => <AccountStatusBadge status={a.status} />,
          },
          {
            key: "createdAt",
            header: "Applied",
            sortable: true,
            sortValue: (a) => a.createdAt,
            render: (a) => (
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className="text-muted-foreground size-3.5" />
                {new Date(a.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            className: "min-w-[260px]",
            render: (a) => {
              if (a.status === "pending-approval" || a.status === "pending-verification") {
                return (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetails(a)} className="gap-1.5">
                      <Eye className="size-3.5" /> View
                    </Button>
                    <Button size="sm" onClick={() => openApprove(a)} className="gap-1.5">
                      <CheckCircle2 className="size-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openReject(a)} className="gap-1.5 text-destructive hover:text-destructive">
                      <XCircle className="size-3.5" /> Reject
                    </Button>
                  </div>
                )
              }
              if (a.status === "rejected") {
                return (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetails(a)} className="gap-1.5">
                      <Eye className="size-3.5" /> View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reapprove(a)}>
                      Re-approve
                    </Button>
                  </div>
                )
              }
              if (a.status === "approved" || a.status === "inactive" || a.status === "suspended") {
                return (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetails(a)} className="gap-1.5">
                      <Eye className="size-3.5" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(a.status === "approved" && "text-destructive hover:text-destructive")}
                      onClick={() => toggleActive(a)}
                    >
                      <ShieldAlert className="size-3.5" />
                      {a.status === "approved" ? "Deactivate" : "Reactivate"}
                    </Button>
                  </div>
                )
              }
              return null
            },
          },
        ]}
      />

      <Dialog open={dialog === "approve"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="text-primary size-5" /> Approve application
            </DialogTitle>
            <DialogDescription>
              Approve <span className="font-semibold text-foreground">
                {target ? `${target.firstName} ${target.lastName}` : ""}
              </span>{" "}
              ({target?.email}) for portal access. Their employee profile will be created
              automatically and they'll be able to sign in immediately.
            </DialogDescription>
          </DialogHeader>
          {target && (
            <div className="bg-muted/50 flex items-center justify-between rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={`${target.firstName} ${target.lastName}`} image={target.photo} size="md" />
                <div>
                  <p className="text-sm font-semibold">
                    {target.firstName} {target.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {target.designation} · {target.department}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                <Users className="size-3" /> E-{target.employeeId}
              </Badge>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="approval-comment">Comment (optional)</Label>
            <Textarea
              id="approval-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note for the employee (e.g., welcome, onboarding info)…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} disabled={submitting} className="gap-2">
              <CheckCircle2 className="size-4" />
              {submitting ? "Approving…" : "Approve & grant access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reject"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="size-5" /> Reject application
            </DialogTitle>
            <DialogDescription>
              Rejecting{" "}
              <span className="font-semibold text-foreground">
                {target ? `${target.firstName} ${target.lastName}` : ""}
              </span>{" "}
              ({target?.email}) will block portal access. The employee will see the reason on their
              next sign-in attempt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Reason (required)</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Provided employee ID belongs to another department…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={submitting} className="gap-2">
              <XCircle className="size-4" />
              {submitting ? "Rejecting…" : "Reject application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "details"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="text-primary size-5" /> Registration details
            </DialogTitle>
            <DialogDescription>
              Full application details for{" "}
              <span className="font-semibold text-foreground">
                {target ? `${target.firstName} ${target.lastName}` : ""}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          {target && (
            <div className="space-y-4">
              <div className="bg-muted/50 flex items-center gap-3 rounded-xl px-4 py-3">
                <Avatar name={`${target.firstName} ${target.lastName}`} image={target.photo} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {target.firstName} {target.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{target.email}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {target.designation} · {target.department}
                  </p>
                </div>
                <AccountStatusBadge status={target.status} />
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <DetailItem label="Employee ID" value={`E-${target.employeeId}`} />
                <DetailItem label="Role" value={target.role === "admin" ? "HR Admin" : "Employee"} />
                <DetailItem label="Email" value={target.email} />
                <DetailItem label="Phone" value={target.phone} />
                <DetailItem label="Department" value={target.department} />
                <DetailItem label="Designation" value={target.designation} />
                <DetailItem label="Registered" value={formatDate(target.createdAt)} />
                <DetailItem
                  label="Email verified"
                  value={target.verifiedAt ? formatDate(target.verifiedAt) : "Not yet"}
                />
                <DetailItem
                  label="Approved"
                  value={target.approvedAt ? formatDate(target.approvedAt) : "—"}
                />
                <DetailItem
                  label="Approved by"
                  value={target.approvedBy ?? "—"}
                />
              </dl>

              {target.approvalComment && (
                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-3.5 py-3 text-xs leading-relaxed text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="font-semibold">HR comment: </span>
                  {target.approvalComment}
                </div>
              )}

              {target.rejectionReason && (
                <div className="rounded-xl border border-rose-200/70 bg-rose-50/70 px-3.5 py-3 text-xs leading-relaxed text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                  <span className="font-semibold">Rejection reason: </span>
                  {target.rejectionReason}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex items-center justify-between">
            {target?.status === "pending-verification" ? (
              <Button variant="outline" onClick={() => resend(target)} className="gap-2">
                <MailOpen className="size-4" /> Resend verification email
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Close
              </Button>
              {target && (target.status === "pending-approval" || target.status === "pending-verification") && (
                <>
                  <Button variant="destructive" onClick={() => { setDialog(null); openReject(target) }} className="gap-2">
                    <XCircle className="size-4" /> Reject
                  </Button>
                  <Button onClick={() => { setDialog(null); openApprove(target) }} className="gap-2">
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="gap-0 p-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ScrollText className="text-primary size-4" /> Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {auditLog.length === 0 ? (
            <p className="text-muted-foreground text-sm">No audit entries recorded yet.</p>
          ) : (
            <div className="grid gap-1">
              {auditLog.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40">
                  <span
                    className={cn(
                      "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      entry.action.startsWith("Approved")
                        ? "bg-success/10 text-success"
                        : entry.action.startsWith("Rejected")
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {entry.action.startsWith("Approved")
                      ? "A"
                      : entry.action.startsWith("Rejected")
                        ? "R"
                        : "·"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{entry.actor}</span>{" "}
                      <span className="text-muted-foreground text-[13px]">{entry.action}</span>
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{entry.detail}</p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {new Date(entry.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <dt className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  )
}
