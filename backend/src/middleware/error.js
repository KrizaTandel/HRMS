const { ApiError } = require("../utils/ApiError")

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      code: err.code,
    })
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` })
  }
  if (err.code && String(err.code).startsWith("P")) {
    console.error("Prisma error:", err)
    return res.status(409).json({ success: false, message: "Database operation failed.", code: err.code })
  }
  console.error("Unhandled error:", err)
  return res.status(500).json({ success: false, message: "Internal server error." })
}

module.exports = { notFound, errorHandler }
