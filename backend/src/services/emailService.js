const { sendMail } = require("../config/email")
const { prisma } = require("../config/prisma")

async function deliverEmail({ to, category, subject, body, createdBy = null }) {
  const result = await sendMail({ to, subject, body })
  await prisma.emailOutbox.create({
    data: {
      to,
      category,
      subject,
      body: Array.isArray(body) ? body.join("\n\n") : String(body),
      status: result.ok ? "sent" : "failed",
      createdBy,
    },
  })
  return result
}

module.exports = { deliverEmail }
