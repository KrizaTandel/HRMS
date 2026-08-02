const { prisma } = require("../config/prisma")
const { asyncHandler } = require("../utils/asyncHandler")

exports.list = asyncHandler(async (_req, res) => {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  })
  res.json({
    success: true,
    data: departments.map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      head: d.head,
      description: d.description,
      employeeCount: d._count.employees,
    })),
  })
})

exports.get = asyncHandler(async (req, res) => {
  const dept = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: { employees: { include: { user: true } } },
  })
  if (!dept) return res.status(404).json({ success: false, message: "Department not found." })
  res.json({
    success: true,
    data: {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      head: dept.head,
      description: dept.description,
      employees: dept.employees.map((e) => ({
        id: e.id,
        name: `${e.user.firstName} ${e.user.lastName}`,
        email: e.user.email,
        designation: e.designation,
        role: e.user.role,
      })),
    },
  })
})
