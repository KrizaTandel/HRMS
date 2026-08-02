const crypto = require("crypto")

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex")
}

function toIsoDate(dt) {
  if (!dt) return null
  const d = dt instanceof Date ? dt : new Date(dt)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function parsePage(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

function paginate(data, total, page, limit) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    photo: user.photo,
    role: user.role,
    status: user.status,
    employeeId: user.employee?.employeeCode ?? null,
    department: user.employee?.department?.name ?? null,
    designation: user.employee?.designation ?? null,
    employee: user.employee
      ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          designation: user.employee.designation,
          department: user.employee.department?.name ?? null,
          profileCompletion: user.employee.profileCompletion,
          joiningDate: toIsoDate(user.employee.joiningDate),
        }
      : null,
  }
}

function publicEmployee(emp) {
  if (!emp) return null
  return {
    id: emp.id,
    employeeCode: emp.employeeCode,
    firstName: emp.user?.firstName ?? "",
    lastName: emp.user?.lastName ?? "",
    email: emp.user?.email ?? "",
    phone: emp.user?.phone ?? "",
    role: emp.user?.role ?? "employee",
    photo: emp.user?.photo ?? null,
    department: emp.department?.name ?? null,
    departmentColor: emp.department?.color ?? null,
    designation: emp.designation,
    joiningDate: toIsoDate(emp.joiningDate),
    address: emp.address,
    city: emp.city,
    gender: emp.gender,
    dateOfBirth: toIsoDate(emp.dateOfBirth),
    bloodGroup: emp.bloodGroup,
    emergencyContact: emp.emergencyContact,
    salary: emp.salary,
    profileCompletion: emp.profileCompletion,
    manager: emp.manager,
  }
}

function mapMessage(msg) {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    from: msg.sender?.id ?? null,
    fromName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : null,
    senderRole: msg.sender?.role ?? null,
    text: msg.text,
    time: toIsoDate(msg.time),
    read: msg.read,
    edited: msg.edited,
    deleted: msg.deleted,
    attachment: msg.attachmentUrl
      ? {
          type: msg.attachmentType,
          name: msg.attachmentName,
          size: msg.attachmentSize,
          url: msg.attachmentUrl,
        }
      : null,
  }
}

module.exports = {
  randomToken,
  toIsoDate,
  parsePage,
  paginate,
  monthKey,
  publicUser,
  publicEmployee,
  mapMessage,
}
