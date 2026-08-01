import { useEffect, useState } from "react"
import type { Employee, RegistrationAccount, Role } from "@/data/types"
import { allEmployees } from "@/data/mockData"
import { HR_INBOX, sendEmail } from "@/lib/emails"
import { addAuditEntry } from "@/lib/audit-log"

const STORAGE_KEY = "nexushr-accounts"

export const DEPARTMENTS = [
  "Human Resources",
  "Information Technology",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "Administration",
]

export const DESIGNATIONS: Record<string, string[]> = {
  "Human Resources": ["HR Executive", "HR Associate", "HR Manager", "Recruiter", "HR Business Partner"],
  "Information Technology": ["Software Engineer", "Senior Software Engineer", "DevOps Engineer", "QA Engineer", "IT Support Engineer"],
  Finance: ["Accountant", "Financial Analyst", "Finance Manager", "Payroll Specialist"],
  Sales: ["Sales Executive", "Account Manager", "Sales Manager"],
  Marketing: ["Marketing Specialist", "Content Writer", "Brand Manager", "Growth Lead"],
  Operations: ["Operations Executive", "Operations Manager", "Logistics Coordinator"],
  Administration: ["Administrative Assistant", "Office Manager", "Compliance Officer"],
}

export const COUNTRY_CODES = [
  { code: "+1", label: "US / Canada" },
  { code: "+44", label: "United Kingdom" },
  { code: "+91", label: "India" },
  { code: "+61", label: "Australia" },
  { code: "+49", label: "Germany" },
  { code: "+33", label: "France" },
  { code: "+81", label: "Japan" },
  { code: "+55", label: "Brazil" },
  { code: "+234", label: "Nigeria" },
  { code: "+971", label: "UAE" },
]

export interface RegistrationInput {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  role: Role
  password: string
  photo: string | null
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function loadAccounts(): RegistrationAccount[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RegistrationAccount[]) : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts: RegistrationAccount[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  window.dispatchEvent(new Event("nexushr:accounts"))
}

// ---------------------------------------------------------------------------
// Security helpers
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`nexushr::v1::${password}`)
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function makeToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// ---------------------------------------------------------------------------
// Uniqueness
// ---------------------------------------------------------------------------

export function isEmployeeIdTaken(employeeId: string): boolean {
  const id = employeeId.trim().toLowerCase()
  if (allEmployees.some((e) => e.id.toLowerCase() === id)) return true
  return loadAccounts().some((a) => a.employeeId.trim().toLowerCase() === id)
}

export function isEmailTaken(email: string): boolean {
  const value = email.trim().toLowerCase()
  if (allEmployees.some((e) => e.email.toLowerCase() === value)) return true
  return loadAccounts().some((a) => a.email.toLowerCase() === value)
}

export function findAccountByEmail(email: string): RegistrationAccount | undefined {
  const value = email.trim().toLowerCase()
  return loadAccounts().find((a) => a.email.toLowerCase() === value)
}

export function findAccountById(id: string): RegistrationAccount | undefined {
  return loadAccounts().find((a) => a.id === id)
}

export function findAccountByToken(token: string): RegistrationAccount | undefined {
  return loadAccounts().find((a) => a.verificationToken === token)
}

export function pendingApprovals(): RegistrationAccount[] {
  return loadAccounts().filter((a) => a.status === "pending-approval")
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

export async function registerAccount(input: RegistrationInput): Promise<RegistrationAccount> {
  const passwordHash = await hashPassword(input.password)
  const now = new Date()
  const account: RegistrationAccount = {
    id: `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId.trim().toUpperCase(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    department: input.department,
    designation: input.designation,
    role: input.role,
    passwordHash,
    photo: input.photo,
    status: "pending-verification",
    createdAt: now.toISOString(),
    verifiedAt: null,
    approvedAt: null,
    approvedBy: null,
    approvalComment: null,
    rejectionReason: null,
    verificationToken: makeToken(),
    verificationExpiresAt: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
  }
  const accounts = loadAccounts()
  accounts.unshift(account)
  saveAccounts(accounts)
  addAuditEntry({
    actor: "System",
    action: "Registration created",
    detail: `New account opened for ${account.firstName} ${account.lastName} (${account.employeeId}).`,
  })
  sendEmail({
    to: account.email,
    category: "registration-success",
    body: `Hi ${account.firstName},\n\nWelcome to NexusHR! Your registration was successful. Verify your email to continue, then HR will approve your access.\n\nNexusHR`,
  })
  sendEmail({
    to: HR_INBOX,
    category: "new-registration",
    body: `Hi HR team,\n\n${account.firstName} ${account.lastName} (${account.employeeId}, ${account.department}) registered on the portal and is awaiting email verification.\n\nNexusHR`,
  })
  return account
}

export function resendVerification(accountId: string): RegistrationAccount | null {
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === accountId)
  if (idx === -1) return null
  accounts[idx] = {
    ...accounts[idx],
    verificationToken: makeToken(),
    verificationExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  }
  saveAccounts(accounts)
  sendEmail({
    to: accounts[idx].email,
    category: "email-verification",
    body: `Hi ${accounts[idx].firstName},\n\nA fresh verification link has been sent for your NexusHR account. It expires in 24 hours.\n\nNexusHR`,
  })
  return accounts[idx]
}

export type VerifyResult = "success" | "invalid" | "expired"

export function verifyAccount(token: string): { reason: VerifyResult; account?: RegistrationAccount } {
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.verificationToken === token)
  if (idx === -1) return { reason: "invalid" }
  const account = accounts[idx]
  if (new Date(account.verificationExpiresAt).getTime() < Date.now()) {
    return { reason: "expired" }
  }
  if (account.status === "approved" || account.status === "pending-approval") {
    return { reason: "success", account }
  }
  accounts[idx] = {
    ...account,
    status: "pending-approval",
    verifiedAt: new Date().toISOString(),
  }
  saveAccounts(accounts)
  addAuditEntry({
    actor: `${account.firstName} ${account.lastName}`,
    action: "Email verified",
    detail: `${account.firstName} ${account.lastName} (${account.employeeId}) verified their email and is awaiting HR approval.`,
  })
  sendEmail({
    to: HR_INBOX,
    category: "pending-approval",
    body: `Hi HR team,\n\n${account.firstName} ${account.lastName} (${account.employeeId}) verified their email and is now pending your approval.\n\nReview the registration in the Approvals module.\n\nNexusHR`,
  })
  return { reason: "success", account: accounts[idx] }
}

function buildEmployee(account: RegistrationAccount): Employee {
  const basic = 4200
  return {
    id: `E-${account.employeeId}`,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    phone: account.phone,
    role: account.role,
    department: account.department,
    designation: account.designation,
    joiningDate: (account.approvedAt ?? account.createdAt).slice(0, 10),
    address: "",
    city: "Austin",
    gender: "Other",
    dateOfBirth: "1995-01-01",
    bloodGroup: "O+",
    emergencyContact: { name: "", phone: "", relation: "" },
    salary: {
      basic,
      allowances: Math.round(basic * 0.2),
      bonus: 300,
      tax: Math.round(basic * 0.14),
      deductions: 300,
    },
    profileCompletion: 40,
    manager: "David Carter",
    documents: [],
  }
}

export function approveAccount(id: string, by: string, comment?: string): RegistrationAccount | null {
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx === -1) return null
  const account = accounts[idx]
  if (account.status !== "pending-approval" && account.status !== "pending-verification") return account
  const employee = buildEmployee({ ...account, approvedAt: new Date().toISOString() })
  accounts[idx] = {
    ...account,
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvedBy: by,
    approvalComment: comment ?? null,
    employee,
  }
  saveAccounts(accounts)
  addAuditEntry({
    actor: by,
    action: "Approved registration",
    detail: `${account.firstName} ${account.lastName} (${account.employeeId}) approved for portal access.`,
  })
  sendEmail({
    to: accounts[idx].email,
    category: "registration-success",
    subject: "Your NexusHR account is now active",
    body: `Hi ${account.firstName},\n\nGreat news — your NexusHR account has been approved by HR and is now active. You can sign in to the portal to get started.\n\nNexusHR`,
  })
  return accounts[idx]
}

export function rejectAccount(id: string, by: string, reason: string): RegistrationAccount | null {
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx === -1) return null
  accounts[idx] = {
    ...accounts[idx],
    status: "rejected",
    approvedBy: by,
    rejectionReason: reason.trim(),
  }
  saveAccounts(accounts)
  addAuditEntry({
    actor: by,
    action: "Rejected registration",
    detail: `${accounts[idx].firstName} ${accounts[idx].lastName} (${accounts[idx].employeeId}) rejected — ${reason.trim()}`,
  })
  sendEmail({
    to: accounts[idx].email,
    category: "registration-rejected",
    subject: "Your NexusHR registration was not approved",
    body: `Hi ${accounts[idx].firstName},\n\nUnfortunately your NexusHR registration could not be approved.\n\nReason: ${reason.trim()}\n\nIf you believe this is a mistake, please contact HR at hr@nexushr.io.\n\nNexusHR`,
  })
  return accounts[idx]
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export interface PasswordResetRequest {
  token: string
  email: string
  expiresAt: string
}

const RESET_STORAGE_KEY = "nexushr-password-resets"

export function requestPasswordReset(email: string): PasswordResetRequest | null {
  const value = email.trim().toLowerCase()
  const account = findAccountByEmail(value)
  if (!account) return null

  const request: PasswordResetRequest = {
    token: makeToken(),
    email: account.email,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  }
  const resets = loadPasswordResets()
  resets.unshift(request)
  window.localStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(resets.slice(0, 20)))

  const base = `${window.location.origin}${window.location.pathname}`
  const link = `${base}#/reset-password?token=${request.token}&email=${encodeURIComponent(account.email)}`
  sendEmail({
    to: account.email,
    category: "password-reset",
    body: `Hi ${account.firstName},\n\nWe received a request to reset your NexusHR password. Use the link below to choose a new password:\n\n${link}\n\nThis link expires in 24 hours. If you didn't request this, you can safely ignore this email.\n\nNexusHR`,
  })
  addAuditEntry({
    actor: account.email,
    action: "Password reset requested",
    detail: `Password reset link sent to ${account.email}.`,
  })
  return request
}

function loadPasswordResets(): PasswordResetRequest[] {
  try {
    const raw = window.localStorage.getItem(RESET_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PasswordResetRequest[]) : []
  } catch {
    return []
  }
}

export function findPasswordReset(token: string): PasswordResetRequest | undefined {
  return loadPasswordResets().find((r) => r.token === token)
}

export type ResetResult = "success" | "invalid" | "expired" | "account-not-found"

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ResetResult> {
  const request = findPasswordReset(token)
  if (!request) return "invalid"
  if (new Date(request.expiresAt).getTime() < Date.now()) return "expired"

  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === request.email.toLowerCase())
  if (idx === -1) return "account-not-found"

  const passwordHash = await hashPassword(newPassword)
  accounts[idx] = { ...accounts[idx], passwordHash }
  saveAccounts(accounts)

  const resets = loadPasswordResets().filter((r) => r.token !== token)
  window.localStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(resets))

  addAuditEntry({
    actor: accounts[idx].email,
    action: "Password reset",
    detail: `${accounts[idx].firstName} ${accounts[idx].lastName} (${accounts[idx].employeeId}) reset their password.`,
  })
  sendEmail({
    to: accounts[idx].email,
    category: "password-reset",
    subject: "Your NexusHR password has been changed",
    body: `Hi ${accounts[idx].firstName},\n\nYour NexusHR password was successfully changed. If this wasn't you, please contact HR immediately.\n\nNexusHR`,
  })
  return "success"
}

export function setAccountStatus(id: string, status: RegistrationAccount["status"]): RegistrationAccount | null {
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx === -1) return null
  accounts[idx] = { ...accounts[idx], status }
  saveAccounts(accounts)
  return accounts[idx]
}

export function approvedAccountEmployees(): Employee[] {
  return loadAccounts()
    .filter((a) => a.status === "approved" && a.employee)
    .map((a) => a.employee as Employee)
}

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

export function useAccountsStore() {
  const [accounts, setAccounts] = useState<RegistrationAccount[]>(() => loadAccounts())

  useEffect(() => {
    const refresh = () => setAccounts(loadAccounts())
    window.addEventListener("nexushr:accounts", refresh)
    return () => window.removeEventListener("nexushr:accounts", refresh)
  }, [])

  return accounts
}

export function usePendingApprovalCount() {
  const [count, setCount] = useState(() => pendingApprovals().length)

  useEffect(() => {
    const refresh = () => setCount(pendingApprovals().length)
    window.addEventListener("nexushr:accounts", refresh)
    return () => window.removeEventListener("nexushr:accounts", refresh)
  }, [])

  return count
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateEmployeeId(value: string): string | null {
  const v = value.trim()
  if (!v) return "Employee ID is required."
  if (!/^[A-Za-z0-9]{5,15}$/.test(v))
    return "Use 5–15 alphanumeric characters (no spaces or symbols)."
  if (isEmployeeIdTaken(v)) return "This Employee ID is already registered."
  return null
}

export function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return "Official email address is required."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address."
  if (isEmailTaken(v)) return "An account with this email already exists."
  return null
}

export function validatePhone(value: string): string | null {
  const v = value.trim().replace(/[\s-]/g, "")
  if (!v) return "Phone number is required."
  if (!/^\+?\d{7,15}$/.test(v)) return "Enter a valid mobile number with country code."
  return null
}

export interface PasswordCheck {
  length: boolean
  upper: boolean
  lower: boolean
  number: boolean
  special: boolean
  noSpace: boolean
}

export function passwordChecks(password: string): PasswordCheck {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noSpace: !/\s/.test(password),
  }
}

export function passwordStrength(password: string): number {
  const c = passwordChecks(password)
  return [c.length, c.upper, c.lower, c.number, c.special].filter(Boolean).length
}

export function validatePassword(password: string): string | null {
  const c = passwordChecks(password)
  if (!c.length) return "Password must be at least 12 characters."
  if (!c.upper) return "Add at least one uppercase letter."
  if (!c.lower) return "Add at least one lowercase letter."
  if (!c.number) return "Add at least one number."
  if (!c.special) return "Add at least one special character."
  if (!c.noSpace) return "Password must not contain spaces."
  return null
}
