import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import type { Role } from "@/data/types"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { LoginPage } from "@/pages/login"
import { NotFoundPage } from "@/pages/not-found"
import { LandingPage } from "@/pages/landing"
import { RegisterPage } from "@/pages/register"
import { RegisterSuccessPage } from "@/pages/register-success"
import { EmailVerificationPage } from "@/pages/verify-email"
import { EmployeeDashboardPage } from "@/pages/employee/dashboard"
import { EmployeeProfilePage } from "@/pages/employee/profile"
import { EmployeeAttendancePage } from "@/pages/employee/attendance"
import { EmployeeLeavePage } from "@/pages/employee/leaves"
import { EmployeePayrollPage } from "@/pages/employee/payroll"
import { AdminDashboardPage } from "@/pages/admin/dashboard"
import { AdminEmployeesPage } from "@/pages/admin/employees"
import { AdminApprovalsPage } from "@/pages/admin/approvals"
import { AdminEmployeeDetailPage } from "@/pages/admin/employee-detail"
import { AdminAttendancePage } from "@/pages/admin/attendance"
import { AdminLeaveManagementPage } from "@/pages/admin/leaves"
import { AdminPayrollPage } from "@/pages/admin/payroll"
import { AdminReportsPage } from "@/pages/admin/reports"
import { AdminProfilePage } from "@/pages/admin/profile"
import { AdminEmailInboxPage } from "@/pages/admin/email-inbox"
import { SettingsPage } from "@/pages/shared/settings-page"
import { NotificationCenterPage } from "@/pages/shared/notification-center"

function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />
  }
  return <DashboardLayout role={role} />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route path="/employee" element={<RequireRole role="employee" />}>
          <Route index element={<EmployeeDashboardPage />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
          <Route path="attendance" element={<EmployeeAttendancePage />} />
          <Route path="leaves" element={<EmployeeLeavePage />} />
          <Route path="payroll" element={<EmployeePayrollPage />} />
          <Route path="notifications" element={<NotificationCenterPage />} />
          <Route path="settings" element={<SettingsPage role="employee" />} />
        </Route>

        <Route path="/admin" element={<RequireRole role="admin" />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="employees" element={<AdminEmployeesPage />} />
          <Route path="employees/:id" element={<AdminEmployeeDetailPage />} />
          <Route path="approvals" element={<AdminApprovalsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="leaves" element={<AdminLeaveManagementPage />} />
          <Route path="payroll" element={<AdminPayrollPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="emails" element={<AdminEmailInboxPage />} />
          <Route path="notifications" element={<NotificationCenterPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<SettingsPage role="admin" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
