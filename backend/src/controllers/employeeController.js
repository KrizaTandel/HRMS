const { prisma } = require("../config/prisma")
const { ApiError } = require("../utils/ApiError")
const { asyncHandler } = require("../utils/asyncHandler")
const { parsePage, paginate, publicEmployee } = require("../utils/helpers")
const { addAudit } = require("../services/auditService")

const employeeInclude = {
  user: true,
  department: true,
}

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePage(req.query)
  const { search, department, status } = req.query
  const where = {}
  if (department) where.department = { name: { equals: department, mode: "insensitive" } }
  if (status) where.user = { status }

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      include: employeeInclude,
      orderBy: { joiningDate: "desc" },
      skip,
      take: limit,
    }),
  ])
  res.json(paginate(employees.map(publicEmployee), total, page, limit))
})

exports.get = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: {
      ...employeeInclude,
      documents: { orderBy: { uploadedOn: "desc" } },
      attendance: { orderBy: { date: "desc" }, take: 30 },
    },
  })
  if (!employee) throw new ApiError(404, "Employee not found.")
  res.json({
    success: true,
    data: {
      ...publicEmployee(employee),
      documents: employee.documents,
      attendance: employee.attendance,
    },
  })
})

exports.me = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { userId: req.user.id },
    include: {
      ...employeeInclude,
      documents: { orderBy: { uploadedOn: "desc" } },
    },
  })
  if (!employee) throw new ApiError(404, "Employee profile not found.")
  res.json({ success: true, data: { ...publicEmployee(employee), documents: employee.documents } })
})

exports.updateMe = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } })
  if (!employee) throw new ApiError(404, "Employee profile not found.")

  const {
    phone,
    address,
    city,
    gender,
    dateOfBirth,
    bloodGroup,
    emergencyContact,
  } = req.body

  const userData = {}
  if (phone !== undefined) userData.phone = phone

  const empData = {}
  if (address !== undefined) empData.address = address
  if (city !== undefined) empData.city = city
  if (gender !== undefined) empData.gender = gender
  if (dateOfBirth !== undefined) empData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined
  if (bloodGroup !== undefined) empData.bloodGroup = bloodGroup
  if (emergencyContact !== undefined) empData.emergencyContact = emergencyContact

  const [updatedEmp] = await prisma.$transaction([
    prisma.employee.update({
      where: { id: employee.id },
      data: {
        ...empData,
        profileCompletion: Math.min(100, employee.profileCompletion + 20),
      },
      include: employeeInclude,
    }),
    ...(Object.keys(userData).length
      ? [prisma.user.update({ where: { id: req.user.id }, data: userData })]
      : []),
  ])

  await addAudit({
    actor: req.user.email,
    action: "Profile updated",
    detail: `${req.user.firstName} ${req.user.lastName} updated their employee profile.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, data: publicEmployee(updatedEmp), message: "Profile updated." })
})

exports.update = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({ where: { id: req.params.id } })
  if (!employee) throw new ApiError(404, "Employee not found.")

  const {
    designation,
    departmentId,
    department,
    manager,
    salary,
    address,
    city,
    gender,
    dateOfBirth,
    bloodGroup,
    phone,
    emergencyContact,
    profileCompletion,
  } = req.body

  let resolvedDeptId = departmentId
  if (department && !resolvedDeptId) {
    const dept = await prisma.department.findFirst({
      where: { name: { equals: department, mode: "insensitive" } },
    })
    resolvedDeptId = dept?.id ?? null
  }

  const empData = {}
  if (designation !== undefined) empData.designation = designation
  if (manager !== undefined) empData.manager = manager
  if (salary !== undefined) empData.salary = salary
  if (address !== undefined) empData.address = address
  if (city !== undefined) empData.city = city
  if (gender !== undefined) empData.gender = gender
  if (dateOfBirth !== undefined) empData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined
  if (bloodGroup !== undefined) empData.bloodGroup = bloodGroup
  if (emergencyContact !== undefined) empData.emergencyContact = emergencyContact
  if (profileCompletion !== undefined) empData.profileCompletion = profileCompletion
  if (resolvedDeptId !== undefined) empData.departmentId = resolvedDeptId

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: empData,
    include: employeeInclude,
  })
  if (phone !== undefined) {
    await prisma.user.update({ where: { id: employee.userId }, data: { phone } })
  }
  await addAudit({
    actor: req.user.email,
    action: "Employee updated",
    detail: `HR updated the profile of ${updated.user.firstName} ${updated.user.lastName}.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, data: publicEmployee(updated), message: "Employee updated." })
})

exports.verifyDocument = asyncHandler(async (req, res) => {
  const { employeeId, docId } = req.params
  const doc = await prisma.document.findFirst({
    where: { id: docId, employeeId },
  })
  if (!doc) throw new ApiError(404, "Document not found.")
  await prisma.document.update({ where: { id: docId }, data: { verified: true } })
  await addAudit({
    actor: req.user.email,
    action: "Document verified",
    detail: `Document "${doc.name}" verified for ${req.params.employeeId}.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, message: "Document verified." })
})

exports.analytics = asyncHandler(async (_req, res) => {
  const [total, byDept, newJoiners, admins] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
    }),
    prisma.employee.findMany({
      where: { joiningDate: { gte: new Date(Date.now() - 90 * 86400000) } },
      include: { user: true, department: true },
      orderBy: { joiningDate: "desc" },
      take: 10,
    }),
    prisma.employee.count({ where: { user: { role: "admin" } } }),
  ])

  const departments = await prisma.department.findMany()
  const deptBreakdown = byDept.map((d) => {
    const dept = departments.find((x) => x.id === d.departmentId)
    return {
      name: dept?.name ?? "Unassigned",
      color: dept?.color ?? "#94a3b8",
      count: d._count._all,
    }
  })

  res.json({
    success: true,
    data: {
      total,
      admins,
      employees: total - admins,
      deptBreakdown,
      newJoiners: newJoiners.map((e) => ({
        id: e.id,
        name: `${e.user.firstName} ${e.user.lastName}`,
        email: e.user.email,
        department: e.department?.name ?? null,
        designation: e.designation,
        joiningDate: e.joiningDate,
      })),
    },
  })
})

exports.orgChart = asyncHandler(async (_req, res) => {
  const employees = await prisma.employee.findMany({
    include: { user: true, department: true },
    orderBy: { joiningDate: "asc" },
  })
  const byDept = {}
  for (const e of employees) {
    const dept = e.department?.name ?? "Unassigned"
    ;(byDept[dept] ??= []).push({
      id: e.id,
      name: `${e.user.firstName} ${e.user.lastName}`,
      email: e.user.email,
      role: e.user.role,
      designation: e.designation,
      avatar: e.user.photo,
    })
  }
  res.json({
    success: true,
    data: Object.entries(byDept).map(([name, members]) => ({ name, members })),
  })
})
