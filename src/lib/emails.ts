import { useEffect, useState } from "react"

export type EmailCategory =
  | "registration-success"
  | "registration-rejected"
  | "email-verification"
  | "password-reset"
  | "leave-approved"
  | "leave-rejected"
  | "salary-slip-available"
  | "payroll-generated"
  | "hr-announcement"
  | "holiday-notice"
  | "new-registration"
  | "pending-approval"
  | "new-leave-application"
  | "payroll-generated-success"
  | "attendance-exception"

export interface EmailMessage {
  id: string
  to: string
  category: EmailCategory
  subject: string
  preview: string
  body: string
  sentAt: string
  read: boolean
}

export const HR_INBOX = "hr@nexushr.io"

export const EMPLOYEE_EMAIL_TYPES: EmailCategory[] = [
  "registration-success",
  "registration-rejected",
  "email-verification",
  "password-reset",
  "leave-approved",
  "leave-rejected",
  "salary-slip-available",
  "payroll-generated",
  "hr-announcement",
  "holiday-notice",
]

export const ADMIN_EMAIL_TYPES: EmailCategory[] = [
  "new-registration",
  "pending-approval",
  "new-leave-application",
  "payroll-generated-success",
  "attendance-exception",
]

export const EMAIL_CATALOG: Record<
  EmailCategory,
  { subject: string; preview: string; recipient: "employee" | "admin" }
> = {
  "registration-success": {
    subject: "Welcome to NexusHR — your account is active",
    preview: "Your registration was successful. You can now sign in to the HRMS portal.",
    recipient: "employee",
  },
  "registration-rejected": {
    subject: "Your NexusHR registration was not approved",
    preview: "Your registration could not be approved by HR. Contact the HR team for details.",
    recipient: "employee",
  },
  "email-verification": {
    subject: "Verify your NexusHR email address",
    preview: "Click the link in this email to verify your email address.",
    recipient: "employee",
  },
  "password-reset": {
    subject: "Reset your NexusHR password",
    preview: "We received a request to reset your password.",
    recipient: "employee",
  },
  "leave-approved": {
    subject: "Leave request approved",
    preview: "Your leave request has been approved by HR.",
    recipient: "employee",
  },
  "leave-rejected": {
    subject: "Leave request not approved",
    preview: "Your leave request could not be approved. Contact HR for details.",
    recipient: "employee",
  },
  "salary-slip-available": {
    subject: "Your payslip is available",
    preview: "Your latest payslip is now available to download from the portal.",
    recipient: "employee",
  },
  "payroll-generated": {
    subject: "Payroll generated",
    preview: "This month's payroll has been generated.",
    recipient: "employee",
  },
  "hr-announcement": {
    subject: "Important HR announcement",
    preview: "An important update from the HR team.",
    recipient: "employee",
  },
  "holiday-notice": {
    subject: "Company holiday notice",
    preview: "Please review the upcoming company holiday.",
    recipient: "employee",
  },
  "new-registration": {
    subject: "New employee registration",
    preview: "A new employee has registered on the portal.",
    recipient: "admin",
  },
  "pending-approval": {
    subject: "Registration pending approval",
    preview: "An employee has verified their email and is awaiting approval.",
    recipient: "admin",
  },
  "new-leave-application": {
    subject: "New leave application",
    preview: "An employee has submitted a new leave request.",
    recipient: "admin",
  },
  "payroll-generated-success": {
    subject: "Payroll generated successfully",
    preview: "This month's payroll has been generated successfully.",
    recipient: "admin",
  },
  "attendance-exception": {
    subject: "Attendance exception",
    preview: "An attendance record was flagged as an exception.",
    recipient: "admin",
  },
}

const STORAGE_KEY = "nexushr-outbox"

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString()
}

function seedOutbox(): EmailMessage[] {
  const employee = "sarah.mitchell@nexushr.io"
  return [
    {
      id: "EM-SEED-1",
      to: HR_INBOX,
      category: "payroll-generated-success",
      subject: "Payroll generated successfully",
      preview: "July payroll has been generated for 50 employees and is ready for review.",
      body: "Hi HR team,\n\nJuly payroll has been generated successfully for 50 employees. Please review the payroll report before disbursement.\n\nNexusHR",
      sentAt: isoHoursAgo(20),
      read: false,
    },
    {
      id: "EM-SEED-2",
      to: employee,
      category: "salary-slip-available",
      subject: "Your July payslip is available",
      preview: "Your July payslip is now available to download from the payroll portal.",
      body: `Hi Sarah,\n\nYour July payslip is now available. Log in to the HRMS portal and open Payroll to download the PDF.\n\nNexusHR`,
      sentAt: isoHoursAgo(20),
      read: false,
    },
    {
      id: "EM-SEED-3",
      to: employee,
      category: "holiday-notice",
      subject: "Company holiday notice — Labor Day",
      preview: "The office will be closed on Labor Day. Plan your schedule accordingly.",
      body: `Hi Sarah,\n\nThe office will be closed on Labor Day. Please plan your work schedule accordingly.\n\nNexusHR`,
      sentAt: isoHoursAgo(48),
      read: true,
    },
    {
      id: "EM-SEED-4",
      to: HR_INBOX,
      category: "new-leave-application",
      subject: "New leave application",
      preview: "Sarah Mitchell applied for 2 days of sick leave and is awaiting review.",
      body: "Hi HR team,\n\nSarah Mitchell (E-042) submitted a new sick leave request (2 days). Please review it in the Leave Management module.\n\nNexusHR",
      sentAt: isoHoursAgo(70),
      read: true,
    },
  ]
}

export function loadOutbox(): EmailMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EmailMessage[]) : seedOutbox()
  } catch {
    return seedOutbox()
  }
}

export function sendEmail(input: {
  to: string
  category: EmailCategory
  subject?: string
  body?: string
}): EmailMessage {
  const meta = EMAIL_CATALOG[input.category]
  const body = input.body ?? meta.preview
  const message: EmailMessage = {
    id: `EM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    to: input.to,
    category: input.category,
    subject: input.subject ?? meta.subject,
    preview: body.slice(0, 120),
    body,
    sentAt: new Date().toISOString(),
    read: false,
  }
  const outbox = loadOutbox()
  outbox.unshift(message)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(outbox))
  window.dispatchEvent(new Event("nexushr:email"))
  // Simulated delivery log — no real SMTP in this demo build.
  console.info(`[NexusHR Email] ${message.subject} → ${message.to}`)
  return message
}

export function markEmailRead(id: string) {
  const outbox = loadOutbox()
  const next = outbox.map((m) => (m.id === id ? { ...m, read: true } : m))
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event("nexushr:email"))
}

export function useEmailOutbox() {
  const [emails, setEmails] = useState<EmailMessage[]>(() => loadOutbox())

  useEffect(() => {
    const refresh = () => setEmails(loadOutbox())
    window.addEventListener("nexushr:email", refresh)
    return () => window.removeEventListener("nexushr:email", refresh)
  }, [])

  return emails
}
