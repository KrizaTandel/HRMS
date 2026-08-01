import { useAuth } from "@/contexts/auth-context"
import { ProfileView } from "@/components/shared/profile-view"

export function EmployeeProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <ProfileView
      employeeId={user.id}
      fullEdit={false}
    />
  )
}
