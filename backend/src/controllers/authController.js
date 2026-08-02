const bcrypt = require("bcryptjs")
const { prisma } = require("../config/prisma")
const { ApiError } = require("../utils/ApiError")
const { asyncHandler } = require("../utils/asyncHandler")
const { randomToken, publicUser, toIsoDate } = require("../utils/helpers")
const { signAccess, signRefresh, refreshExpires } = require("../middleware/auth")
const { deliverEmail } = require("../services/emailService")
const { addAudit } = require("../services/auditService")
const { notifyUser } = require("../services/notificationService")

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

function pickClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || null
}

function pickUserAgent(req) {
  return (req.headers["user-agent"] || "").slice(0, 255)
}

// ---------------------------------------------------------------- Register

exports.register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    employeeCode,
    department,
    designation,
    role = "employee",
    password,
  } = req.body

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) throw new ApiError(409, "An account with this email already exists.")

  const codeTaken = await prisma.employee.findUnique({ where: { employeeCode } })
  if (codeTaken) throw new ApiError(409, "This Employee ID is already registered.")

  const hash = await bcrypt.hash(password, 12)
  const verificationToken = randomToken()

  const dept = department
    ? await prisma.department.findFirst({
        where: { name: { equals: department, mode: "insensitive" } },
      })
    : null

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      role: role === "admin" ? "admin" : "employee",
      status: "PENDING_VERIFICATION",
      verificationToken,
      verificationExpiry: new Date(Date.now() + 24 * 3600 * 1000),
    },
  })

  const employee = await prisma.employee.create({
    data: {
      userId: user.id,
      employeeCode: employeeCode.trim().toUpperCase(),
      departmentId: dept?.id ?? null,
      designation: designation ?? "New Hire",
      joiningDate: new Date(),
      city: "Austin",
      gender: "Other",
      salary: { basic: 4200, allowances: 840, bonus: 300, tax: 588, deductions: 300 },
      profileCompletion: 40,
      manager: "David Carter",
    },
  })

  await addAudit({
    actor: "System",
    action: "Registration created",
    detail: `New account opened for ${firstName} ${lastName} (${employeeCode}).`,
  })

  const verifyUrl = `${FRONTEND_URL}/#/verify-email?token=${verificationToken}`
  await deliverEmail({
    to: normalizedEmail,
    category: "registration-success",
    subject: "Welcome to NexusHR — verify your email",
    body: [
      `Hi ${firstName},`,
      "Welcome to NexusHR! Your registration was successful.",
      "Verify your email to continue, then HR will approve your portal access.",
    ],
    cta: "Verify my email",
    ctaUrl: verifyUrl,
  })
  await deliverEmail({
    to: process.env.HR_EMAIL || "hr@nexushr.io",
    category: "new-registration",
    subject: "New registration awaiting verification",
    body: [
      "Hi HR team,",
      `${firstName} ${lastName} (${employeeCode}, ${dept?.name ?? "Unassigned"}) registered on the portal and is awaiting email verification.`,
    ],
  })

  res.status(201).json({ success: true, message: "Registration successful. Verify your email to continue." })
})

// ---------------------------------------------------------------- Verify email

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body
  const user = await prisma.user.findUnique({ where: { verificationToken: token } })
  if (!user) throw new ApiError(400, "This verification link is invalid.")
  if (user.verificationExpiry && user.verificationExpiry.getTime() < Date.now()) {
    throw new ApiError(400, "This verification link has expired. Request a new one.")
  }
  if (user.status === "APPROVED" || user.status === "PENDING_APPROVAL") {
    return res.json({ success: true, message: "Email already verified." })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "PENDING_APPROVAL", emailVerifiedAt: new Date(), verificationToken: null },
  })

  await addAudit({
    actor: `${user.firstName} ${user.lastName}`,
    action: "Email verified",
    detail: `${user.firstName} ${user.lastName} (${user.email}) verified their email and is awaiting HR approval.`,
  })
  await deliverEmail({
    to: process.env.HR_EMAIL || "hr@nexushr.io",
    category: "pending-approval",
    subject: "Registration pending HR approval",
    body: [
      "Hi HR team,",
      `${user.firstName} ${user.lastName} (${user.email}) verified their email and is now pending your approval.`,
      "Review the registration in the Approvals module.",
    ],
  })

  res.json({ success: true, message: "Email verified. Awaiting HR approval." })
})

exports.resendVerification = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new ApiError(404, "No account found with this email.")
  if (user.status !== "PENDING_VERIFICATION") {
    throw new ApiError(400, "This account does not require verification.")
  }
  const token = randomToken()
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationExpiry: new Date(Date.now() + 24 * 3600 * 1000) },
  })
  const verifyUrl = `${FRONTEND_URL}/#/verify-email?token=${token}`
  await deliverEmail({
    to: user.email,
    category: "email-verification",
    subject: "Fresh verification link for NexusHR",
    body: [
      `Hi ${user.firstName},`,
      "A fresh verification link has been sent for your NexusHR account. It expires in 24 hours.",
    ],
    cta: "Verify my email",
    ctaUrl: verifyUrl,
  })
  res.json({ success: true, message: "A fresh verification link has been sent." })
})

// ---------------------------------------------------------------- Approve / Reject

exports.pendingApprovals = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { employee: { include: { department: true } } },
    orderBy: { createdAt: "desc" },
  })
  res.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      employeeCode: u.employee?.employeeCode ?? null,
      department: u.employee?.department?.name ?? null,
      designation: u.employee?.designation ?? null,
      createdAt: toIsoDate(u.createdAt),
      approvedAt: toIsoDate(u.approvedAt),
      verifiedAt: toIsoDate(u.emailVerifiedAt),
      status: u.status,
      approvalComment: u.approvalComment,
    })),
  })
})

exports.approve = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { comment } = req.body
  const user = await prisma.user.findUnique({
    where: { id },
    include: { employee: true },
  })
  if (!user) throw new ApiError(404, "Account not found.")
  if (user.status !== "PENDING_APPROVAL" && user.status !== "PENDING_VERIFICATION") {
    throw new ApiError(400, "This account is not pending approval.")
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: req.user.email,
        approvalComment: comment || null,
      },
    }),
    prisma.employee.update({
      where: { id: user.employee.id },
      data: { joiningDate: new Date(), profileCompletion: 40 },
    }),
  ])

  await addAudit({
    actor: req.user.email,
    action: "Approved registration",
    detail: `${user.firstName} ${user.lastName} (${user.employee?.employeeCode}) approved for portal access.`,
    req,
  })
  await notifyUser(user.id, {
    title: "Account approved",
    description: "Great news — your NexusHR account has been approved by HR and is now active.",
    tone: "success",
    category: "registration",
  })
  await deliverEmail({
    to: user.email,
    category: "registration-success",
    subject: "Your NexusHR account is now active",
    body: [
      `Hi ${user.firstName},`,
      "Great news — your NexusHR account has been approved by HR and is now active. You can sign in to the portal to get started.",
    ],
  })

  res.json({ success: true, message: "Account approved." })
})

exports.reject = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  if (!reason?.trim()) throw new ApiError(422, "A rejection reason is required.")
  const user = await prisma.user.findUnique({ where: { id }, include: { employee: true } })
  if (!user) throw new ApiError(404, "Account not found.")

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "REJECTED", approvedBy: req.user.email, rejectionReason: reason.trim() },
  })
  await addAudit({
    actor: req.user.email,
    action: "Rejected registration",
    detail: `${user.firstName} ${user.lastName} (${user.employee?.employeeCode}) rejected — ${reason.trim()}`,
    req,
  })
  await deliverEmail({
    to: user.email,
    category: "registration-rejected",
    subject: "Your NexusHR registration was not approved",
    body: [
      `Hi ${user.firstName},`,
      "Unfortunately your NexusHR registration could not be approved.",
      `Reason: ${reason.trim()}`,
      "If you believe this is a mistake, please contact HR.",
    ],
  })
  res.json({ success: true, message: "Account rejected." })
})

// ---------------------------------------------------------------- Login

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { employee: { include: { department: true } } },
  })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password.")
  }
  if (user.status === "PENDING_VERIFICATION") {
    throw new ApiError(403, "Please verify your email before signing in.", undefined, "EMAIL_NOT_VERIFIED")
  }
  if (user.status === "PENDING_APPROVAL") {
    throw new ApiError(403, "Your account is awaiting HR approval.", undefined, "PENDING_APPROVAL")
  }
  if (user.status === "REJECTED") {
    throw new ApiError(403, "Your registration was rejected. Contact HR for details.", undefined, "REGISTRATION_REJECTED")
  }
  if (user.status !== "APPROVED") {
    throw new ApiError(403, "Your account is not active.", undefined, "ACCOUNT_NOT_ACTIVE")
  }

  const jti = randomToken(16)
  const refreshToken = signRefresh(user, jti)
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: pickUserAgent(req),
      ip: pickClientIp(req),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  })
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })
  await addAudit({
    actor: user.email,
    action: "Signed in",
    detail: `${user.firstName} ${user.lastName} signed in to the portal.`,
    userId: user.id,
    req,
  })

  const accessToken = signAccess(user)
  const maxAge = 7 * 24 * 3600 * 1000
  res.cookie("nexushr_refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/api",
    maxAge,
  })
  res.json({
    success: true,
    message: "Signed in successfully.",
    data: { user: publicUser(user), accessToken, sessionId: session.id },
  })
})

// ---------------------------------------------------------------- Refresh / Logout

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.nexushr_refresh
  if (!token) throw new ApiError(401, "No refresh token provided.")
  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: { user: { include: { employee: { include: { department: true } } } } },
  })
  if (!session || session.revoked || session.expiresAt < new Date()) {
    res.clearCookie("nexushr_refresh", { path: "/api" })
    throw new ApiError(401, "Session expired. Please sign in again.")
  }
  const user = session.user
  if (user.status !== "APPROVED") throw new ApiError(403, "Account not active.")

  const jti = randomToken(16)
  const newRefresh = signRefresh(user, jti)
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
  })
  res.cookie("nexushr_refresh", newRefresh, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/api",
    maxAge: 7 * 24 * 3600 * 1000,
  })
  res.json({ success: true, data: { user: publicUser(user), accessToken: signAccess(user) } })
})

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.nexushr_refresh
  if (token) {
    await prisma.session.updateMany({
      where: { refreshToken: token },
      data: { revoked: true },
    })
  }
  res.clearCookie("nexushr_refresh", { path: "/api" })
  res.json({ success: true, message: "Signed out." })
})

// ---------------------------------------------------------------- Me

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } })
})

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const ok = await bcrypt.compare(currentPassword, req.user.password)
  if (!ok) throw new ApiError(400, "Current password is incorrect.")
  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hash } })
  await addAudit({
    actor: req.user.email,
    action: "Password changed",
    detail: `${req.user.firstName} ${req.user.lastName} changed their password.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, message: "Password changed." })
})

// ---------------------------------------------------------------- Forgot / Reset

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.json({ success: true, message: "If an account exists, a reset link has been sent." })
  }
  const resetToken = randomToken()
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: new Date(Date.now() + 24 * 3600 * 1000) },
  })
  const resetUrl = `${FRONTEND_URL}/#/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
  await deliverEmail({
    to: email,
    category: "password-reset",
    subject: "Reset your NexusHR password",
    body: [
      `Hi ${user.firstName},`,
      "We received a request to reset your NexusHR password. Use the link below to choose a new password.",
      "This link expires in 24 hours. If you didn't request this, you can safely ignore this email.",
    ],
    cta: "Reset password",
    ctaUrl: resetUrl,
  })
  await addAudit({
    actor: email,
    action: "Password reset requested",
    detail: `Password reset link sent to ${email}.`,
    userId: user.id,
    req,
  })
  res.json({ success: true, message: "If an account exists, a reset link has been sent." })
})

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { resetToken: token } })
  if (!user) throw new ApiError(400, "This reset link is invalid.")
  if (user.resetTokenExpiry && user.resetTokenExpiry.getTime() < Date.now()) {
    throw new ApiError(400, "This reset link has expired. Request a new one.")
  }
  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, resetToken: null, resetTokenExpiry: null },
  })
  await addAudit({
    actor: user.email,
    action: "Password reset",
    detail: `${user.firstName} ${user.lastName} (${user.email}) reset their password.`,
    userId: user.id,
    req,
  })
  await deliverEmail({
    to: user.email,
    category: "password-reset",
    subject: "Your NexusHR password has been changed",
    body: [
      `Hi ${user.firstName},`,
      "Your NexusHR password was successfully changed. If this wasn't you, please contact HR immediately.",
    ],
  })
  res.json({ success: true, message: "Password reset successfully. You can now sign in." })
})
