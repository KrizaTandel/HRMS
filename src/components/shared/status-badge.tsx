import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status =
  | "present"
  | "absent"
  | "half_day"
  | "late"
  | "leave"
  | "pending"
  | "approved"
  | "rejected"
  | "generated"
  | "paid"
  | "draft"
  | string

const MAP: Record<string, { label: string; variant: "success" | "danger" | "warning" | "info" | "muted" | "secondary" }> = {
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "danger" },
  half_day: { label: "Half Day", variant: "warning" },
  late: { label: "Late", variant: "warning" },
  leave: { label: "On Leave", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  generated: { label: "Generated", variant: "info" },
  paid: { label: "Paid", variant: "success" },
  draft: { label: "Draft", variant: "muted" },
}

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: Status
  className?: string
  dot?: boolean
}) {
  const conf = MAP[status] ?? { label: status, variant: "muted" as const }
  return (
    <Badge
      variant={conf.variant}
      className={cn("gap-1.5 capitalize", className)}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {conf.label}
    </Badge>
  )
}
