const { prisma } = require("../config/prisma")

async function notifyUser(userId, payload) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        description: payload.description,
        category: payload.category ?? "general",
        tone: payload.tone ?? "info",
      },
    })
  } catch (err) {
    console.error("[notify] failed to create notification:", err.message)
  }
}

async function notifyMany(userIds, payload) {
  await Promise.all(userIds.map((id) => notifyUser(id, payload)))
}

async function notifyAllEmployees(payload, { prismaClient = prisma } = {}) {
  const users = await prismaClient.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  })
  await notifyMany(users.map((u) => u.id), payload)
}

module.exports = { notifyUser, notifyMany, notifyAllEmployees }
