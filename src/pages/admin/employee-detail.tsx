import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, UserRound } from "lucide-react"

import { useData } from "@/contexts/data-context"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"
import { ProfileView } from "@/components/shared/profile-view"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEmployee } = useData()
  const loading = useDelayedLoading(500)
  const employee = id ? getEmployee(id) : undefined

  if (loading) return <PageLoader variant="detail" />

  if (!employee) {
    return (
      <EmptyState
        icon={UserRound}
        title="Employee not found"
        description="The employee you're looking for doesn't exist or was removed."
        action={
          <Button onClick={() => navigate("/admin/employees")}>
            <ArrowLeft className="size-4" />
            Back to Employees
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}
        description="Full employee profile with attendance, leave, payroll and documents."
        breadcrumbs={[
          { label: "Management", to: "/admin" },
          { label: "Employees", to: "/admin/employees" },
          { label: employee.id },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/admin/employees")}>
            <ArrowLeft className="size-4" />
            Back to Employees
          </Button>
        }
      />
      <ProfileView employeeId={employee.id} fullEdit />
    </div>
  )
}
