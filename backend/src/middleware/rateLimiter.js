const rateLimit = require("express-rate-limit")

const limiter = (minutes, max) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
  })

module.exports = {
  login: limiter(15, 20),
  auth: limiter(60, 60),
  api: limiter(60, 300),
}
