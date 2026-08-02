const { prisma } = require("../config/prisma")
const { ApiError } = require("../utils/ApiError")
const { asyncHandler } = require("../utils/asyncHandler")
const { parsePage, paginate, toIsoDate } = require("../utils/helpers")
const { addAudit } = require("../services/auditService")

const dateToStart = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toTimeStamp(time, base) {
  const [h, m] = time.split(":").map(Number)
  const d = base ? new Date(base) : new Date()
  d.setHours(h, m, 0, 0)
  return d
}

async function requireEmployee(userId) {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new ApiError(404, "Employee profile not found.")
  return employee
}

exports.myRecords = asyncHandler(async (req, res) => {
  const { from, to } = req.query
  const employee = await requireEmployee(req.user.id)
  const where = { employeeId: employee.id }
  if (from) where.date = { gte: dateToStart(from) }
  if (to) where.date = { ...(where.date ?? {}), lte: dateToStart(to) }
  const records = await prisma.attendance.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  })
  res.json({ success: true, data: records })
})

exports.allRecords = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePage(req.query)
  const { from, to, status, department, employeeId } = req.query
  const where = {}
  if (from) where.date = { gte: dateToStart(from) }
  if (to) where.date = { ...(where.date ?? {}), lte: dateToStart(to) }
  if (status) where.status = status
  if (employeeId) where.employeeId = employeeId
  if (department) where.employee = { department: { name: { equals: department, mode: "insensitive" } } }

  const [total, records] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      include: { employee: { include: { user: true, department: true } } },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
  ])
  res.json(
    paginate(
      records.map((r) => ({
        id: r.id,
        employeeId: r.employeeId,
        name: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
        department: r.employee.department?.name ?? null,
        date: toIsoDate(r.date),
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status,
        workingHours: r.workingHours,
        notes: r.notes,
      })),
      total,
      page,
      limit
    )
  )
})

exports.today = asyncHandler(async (req, res) => {
  const todayStart = dateToStart(new Date())
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const records = await prisma.attendance.findMany({
    where: { date: { gte: todayStart, lt: todayEnd } },
    include: { employee: { include: { user: true, department: true } } },
  })
  const statusCounts = { present: 0, late: 0, absent: 0, half_day: 0, leave: 0 }
  const recent = []
  for (const r of records) {
    statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
    recent.push({
      id: r.id,
      name: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
      department: r.employee.department?.name ?? null,
      designation: r.employee.designation,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status,
    })
  }
  res.json({
    success: true,
    data: {
      total: records.length,
      ...statusCounts,
      onTime: records.filter((r) => r.checkIn && r.checkIn <= "09:00").length,
      recent: recent.sort((a, b) => (b.checkIn ?? "").localeCompare(a.checkIn ?? "")).slice(0, 8),
    },
  })
})

exports.checkIn = asyncHandler(async (req, res) => {
  const employee = await requireEmployee(req.user.id)
  const now = new Date()
  const todayStart = dateToStart(now)
  const existing = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: { gte: todayStart, lt: new Date(todayStart.getTime() + 86400000) } },
  })
  if (existing?.checkIn) throw new ApiError(409, "You have already checked in today.")
  const time = now.toTimeString().slice(0, 5)
  const status = time <= "09:05" ? "present" : "late"
  const record = existing
    ? await prisma.attendance.update({ where: { id: existing.id }, data: { checkIn: time, status } })
    : await prisma.attendance.create({
        data: { employeeId: employee.id, date: todayStart, checkIn: time, status },
      })
  await addAudit({
    actor: req.user.email,
    action: "Checked in",
    detail: `${req.user.firstName} ${req.user.lastName} checked in at ${time}.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, data: record, message: `Checked in at ${time}.` })
})

exports.checkOut = asyncHandler(async (req, res) => {
  const employee = await requireEmployee(req.user.id)
  const todayStart = dateToStart(new Date())
  const record = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: { gte: todayStart, lt: new Date(todayStart.getTime() + 86400000) } },
  })
  if (!record?.checkIn) throw new ApiError(400, "Check in first before checking out.")
  if (record.checkOut) throw new ApiError(409, "You have already checked out today.")
  const time = new Date().toTimeString().slice(0, 5)
  const [h1, m1] = record.checkIn.split(":").map(Number)
  const [h2, m2] = time.split(":").map(Number)
  const workingHours = +(((h2 - h1) * 60 + (m2 - m1)) / 60).toFixed(2)
  const updated = await prisma.attendance.update({
    where: { id: record.id },
    data: { checkOut: time, workingHours: Math.max(0, workingHours) },
  })
  await addAudit({
    actor: req.user.email,
    action: "Checked out",
    detail: `${req.user.firstName} ${req.user.lastName} checked out at ${time}.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, data: updated, message: `Checked out at ${time}.` })
})

exports.adjust = asyncHandler(async (req, res) => {
  const { status, checkIn, checkOut, notes } = req.body
  const data = {}
  if (status) data.status = status
  if (checkIn !== undefined) data.checkIn = checkIn
  if (checkOut !== undefined) data.checkOut = checkOut
  if (notes !== undefined) data.notes = notes
  if (checkIn && checkOut) {
    const [h1, m1] = checkIn.split(":").map(Number)
    const [h2, m2] = checkOut.split(":").map(Number)
    data.workingHours = +(((h2 - h1) * 60 + (m2 - m1)) / 60).toFixed(2)
  }
  const updated = await prisma.attendance.update({ where: { id: req.params.id }, data })
  await addAudit({
    actor: req.user.email,
    action: "Attendance adjusted",
    detail: `Attendance record ${req.params.id} adjusted by HR.`,
    userId: req.user.id,
    req,
  })
  res.json({ success: true, data: updated, message: "Attendance record updated." })
})
