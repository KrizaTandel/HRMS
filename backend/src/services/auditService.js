const { prisma } = require("../config/prisma")

async function addAudit({ actor, action, detail, entity, userId, req }) {
  try {
    await prisma.auditLog.create({
      data: {
        actor: actor ?? "System",
        action,
        detail,
        entity,
        userId: userId ?? null,
        ip: req?.ip ?? null,
      },
    })
  } catch (err) {
    console.error("[audit] failed to write log:", err.message)
  }
}

module.exports = { addAudit }
