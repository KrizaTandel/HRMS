const nodemailer = require("nodemailer")
const { ApiError } = require("../utils/ApiError")

function buildTransporter() {
  if (process.env.MAIL_TRANSPORT === "smtp") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  // Console / preview transport — used by default so no SMTP is required.
  return {
    async sendMail({ to, subject, html, text }) {
      console.log(
        "\n===== [NexusHR EMAIL PREVIEW] =====\n" +
          `To:      ${to}\nSubject: ${subject}\n` +
          `-------- TEXT --------\n${text ?? ""}\n` +
          `-------- HTML (${(html ?? "").length} chars) --------\n` +
          "===================================\n"
      )
      return { messageId: `preview-${Date.now()}`, to, subject }
    },
  }
}

const transporter = buildTransporter()

function company() {
  return {
    name: process.env.COMPANY_NAME || "NexusHR",
    logoUrl: process.env.COMPANY_LOGO_URL || "https://nexushr.io/logo.png",
    signatureName: process.env.HR_SIGNATURE_NAME || "Human Resources Team",
    signatureRole: process.env.HR_SIGNATURE_ROLE || "NexusHR HR Department",
    hrEmail: process.env.HR_EMAIL || "hr@nexushr.io",
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderTemplate({ title, body, cta, ctaUrl, footer }) {
  const brand = company()
  const bodyHtml = Array.isArray(body)
    ? body.map((p) => `<p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.65;">${p}</p>`).join("")
    : `<p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.65;">${body}</p>`
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:26px 32px;">
            <table role="presentation" width="100%"><tr>
              <td style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.4px;">${escapeHtml(brand.name)}</td>
              <td align="right" style="color:#94a3b8;font-size:12px;">HR Portal</td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 18px;color:#0f172a;font-size:20px;font-weight:600;">${escapeHtml(title)}</h1>
          ${bodyHtml}
          ${cta && ctaUrl ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td>
            <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-size:15px;font-weight:600;">${escapeHtml(cta)}</a>
          </td></tr></table>` : ""}
          ${footer ? `<p style="margin:0;color:#64748b;font-size:13px;">${footer}</p>` : ""}
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;color:#334155;font-size:14px;font-weight:600;">${escapeHtml(brand.signatureName)}</p>
          <p style="margin:0;color:#64748b;font-size:13px;">${escapeHtml(brand.signatureRole)} · ${escapeHtml(brand.hrEmail)}</p>
        </td></tr>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px;">This is an automated message from the ${escapeHtml(brand.name)} HR portal.</p>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendMail({ to, subject, body, cta, ctaUrl }) {
  const text = Array.isArray(body) ? body.join("\n\n") : String(body)
  const html = renderTemplate({ title: subject, body, cta, ctaUrl })
  const from = process.env.MAIL_FROM || "NexusHR <no-reply@nexushr.io>"
  try {
    const info = await transporter.sendMail({ from, to, subject, text, html })
    return { ok: true, messageId: info?.messageId ?? null }
  } catch (err) {
    console.error("[email] send failed:", err.message)
    return { ok: false, error: err.message }
  }
}

module.exports = { sendMail, company, renderTemplate }
