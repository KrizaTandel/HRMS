const jwt = require("jsonwebtoken")
const { prisma } = require("../config/prisma")
const { ApiError } = require("../utils/ApiError")
const { asyncHandler } = require("../utils/asyncHandler")

const accessExpires = () =>
  process.env.JWT_ACCESS_EXPIRES || "15m"

const refreshExpires = () =>
  process.env.JWT_REFRESH_EXPIRES || "7d"

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: accessExpires() }
  )
}

function signRefresh(user, jti) {
  return jwt.sign(
    { sub: user.id, role: user.role, jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: refreshExpires() }
  )
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) throw new ApiError(401, "Authentication required. Please sign in.")
  let payload
  try {
    payload = verifyAccess(token)
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.", undefined, "TOKEN_EXPIRED")
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      employee: { include: { department: true } },
    },
  })
  if (!user) throw new ApiError(401, "Account not found.")
  if (user.status !== "APPROVED") {
    throw new ApiError(403, "Your account is not active.", undefined, "ACCOUNT_NOT_ACTIVE")
  }
  req.user = user
  next()
})

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action.")
    }
    next()
  }

module.exports = { requireAuth, requireRole, signAccess, signRefresh, verifyAccess, accessExpires, refreshExpires }
