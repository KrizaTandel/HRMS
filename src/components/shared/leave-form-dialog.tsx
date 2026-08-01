import { useState } from "react"
import { CalendarDays, FileUp } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import type { LeaveType } from "@/data/types"
import { toISODate } from "@/lib/format"

const LEAVE_TYPE_META: Record<LeaveType, { label: string; desc: string }> = {
  paid: { label: "Paid Leave", desc: "Vacation / annual leave" },
  sick: { label: "Sick Leave", desc: "Medical leave" },
  casual: { label: "Casual Leave", desc: "Short notice leave" },
  unpaid: { label: "Unpaid Leave", desc: "Leave without pay" },
}

export function LeaveFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user } = useAuth()
  const { applyLeave } = useData()
  const [type, setType] = useState<LeaveType>("paid")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [attachment, setAttachment] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setType("paid")
    setStartDate("")
    setEndDate("")
    setReason("")
    setAttachment(null)
    setError(null)
  }

  const handleSubmit = () => {
    if (!user) return
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.")
      return
    }
    if (endDate < startDate) {
      setError("End date cannot be before start date.")
      return
    }
    if (!reason.trim()) {
      setError("Please provide a reason for your leave.")
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const req = applyLeave({
        employeeId: user.id,
        type,
        startDate,
        endDate,
        reason: reason.trim(),
        attachment,
      })
      toast.success("Leave submitted", {
        description: `Request ${req.id} is awaiting approval.`,
      })
      setSubmitting(false)
      reset()
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <CalendarDays className="size-4" />
            </span>
            Apply for Leave
          </DialogTitle>
          <DialogDescription>
            Submit a new leave request. It will be sent to HR for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label>Leave Type</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(LEAVE_TYPE_META) as LeaveType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    type === t
                      ? "border-primary bg-primary/5 text-primary rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-all"
                      : "hover:bg-muted text-muted-foreground rounded-xl border-2 border-transparent bg-muted/50 px-3 py-2.5 text-xs font-medium transition-all"
                  }
                >
                  {LEAVE_TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="leave-start">Start Date</Label>
              <Input
                id="leave-start"
                type="date"
                value={startDate}
                min={toISODate(new Date())}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="leave-end">End Date</Label>
              <Input
                id="leave-end"
                type="date"
                value={endDate}
                min={startDate || toISODate(new Date())}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="leave-reason">Reason</Label>
            <Textarea
              id="leave-reason"
              placeholder="Briefly describe the reason for your leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Attachment (optional)</Label>
            <label className="hover:border-primary flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition-colors">
              <FileUp className="text-muted-foreground size-4" />
              <span className="text-sm">
                {attachment ? (
                  <span className="font-medium">{attachment}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Upload medical note / supporting document
                  </span>
                )}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setAttachment(e.target.files?.[0]?.name ?? null)
                }
              />
            </label>
          </div>

          {error && (
            <p className="text-destructive rounded-lg bg-destructive/10 px-3 py-2 text-xs">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
