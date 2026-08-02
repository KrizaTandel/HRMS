export type Role = "employee" | "admin"

export type AttendanceStatus = "present" | "absent" | "half_day" | "leave" | "late"

export type LeaveStatus = "pending" | "approved" | "rejected"

export type LeaveType = "paid" | "sick" | "unpaid" | "casual"

export type PayrollStatus = "generated" | "paid" | "draft"

export interface EmployeeDocument {
  id: string
  name: string
  category: string
  size: string
  uploadedOn: string
  verified: boolean
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: Role
  department: string
  designation: string
  joiningDate: string
  address: string
  city: string
  gender: string
  dateOfBirth: string
  bloodGroup: string
  emergencyContact: { name: string; phone: string; relation: string }
  salary: {
    basic: number
    allowances: number
    bonus: number
    tax: number
    deductions: number
  }
  profileCompletion: number
  manager: string
  documents: EmployeeDocument[]
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  workingHours: number
}

export interface LeaveComment {
  by: string
  text: string
  date: string
}

export interface LeaveTimelineEntry {
  action: string
  by: string
  date: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  attachment: string | null
  status: LeaveStatus
  appliedOn: string
  comments: LeaveComment[]
  timeline: LeaveTimelineEntry[]
}

export interface PayrollRecord {
  id: string
  employeeId: string
  month: string
  basic: number
  allowances: number
  bonus: number
  tax: number
  deductions: number
  net: number
  status: PayrollStatus
}

export interface Department {
  id: string
  name: string
  color: string
  head: string
  employeeCount: number
}

export interface Activity {
  id: string
  type: "checkin" | "leave" | "salary" | "profile" | "onboarding" | "attendance"
  text: string
  date: string
  employeeId: string
}

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  tone: "info" | "success" | "warning" | "danger"
}

export interface Message {
  id: string
  from: string
  text: string
  time: string
  read: boolean
}

export type ChatAttachmentKind = "image" | "pdf" | "office"

export interface ChatAttachment {
  id: string
  name: string
  kind: ChatAttachmentKind
  mimeType: string
  size: number
  dataUrl: string | null
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  time: string
  read: boolean
  edited: boolean
  attachment: ChatAttachment | null
}

export interface Conversation {
  id: string
  participantIds: string[]
  messages: ChatMessage[]
}

export type AnnouncementTone = "info" | "success" | "warning" | "danger"

export interface Announcement {
  id: string
  category: AnnouncementCategory
  title: string
  body: string
  createdBy: string
  createdAt: string
  pinned: boolean
  highPriority: boolean
}

export type AnnouncementCategory =
  | "Company Announcement"
  | "Holiday Notice"
  | "HR Circular"
  | "Payroll Notification"
  | "Leave Policy Update"
  | "Training Session"
  | "Meeting Reminder"
  | "Emergency Notice"

export interface SessionUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
}

export type AccountStatus =
  | "pending-verification"
  | "pending-approval"
  | "approved"
  | "rejected"
  | "suspended"
  | "inactive"

export interface RegistrationAccount {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  role: Role
  passwordHash: string
  photo: string | null
  status: AccountStatus
  createdAt: string
  verifiedAt: string | null
  approvedAt: string | null
  approvedBy: string | null
  approvalComment: string | null
  rejectionReason: string | null
  verificationToken: string
  verificationExpiresAt: string
  employee?: Employee
}
