const { Router } = require("express")
const { body } = require("express-validator")
const ctrl = require("../controllers/authController")
const { handleValidation } = require("../middleware/validate")
const { requireAuth, requireRole } = require("../middleware/auth")
const rateLimiter = require("../middleware/rateLimiter")

const router = Router()

const passwordRule = body("password")
  .isLength({ min: 12 })
  .withMessage("Password must be at least 12 characters.")
  .matches(/[A-Z]/)
  .withMessage("Add at least one uppercase letter.")
  .matches(/[a-z]/)
  .withMessage("Add at least one lowercase letter.")
  .matches(/[0-9]/)
  .withMessage("Add at least one number.")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Add at least one special character.")
  .not()
  .matches(/\s/)
  .withMessage("Password must not contain spaces.")

router.post(
  "/register",
  rateLimiter.auth,
  [
    body("firstName").trim().notEmpty().withMessage("First name is required."),
    body("lastName").trim().notEmpty().withMessage("Last name is required."),
    body("email").trim().isEmail().withMessage("Enter a valid email address.").toLowerCase(),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("employeeCode").trim().notEmpty().withMessage("Employee ID is required."),
    body("department").optional().trim(),
    body("designation").optional().trim(),
    body("role").optional().isIn(["employee", "admin"]).withMessage("Invalid role."),
    passwordRule,
  ],
  handleValidation,
  ctrl.register
)

router.post(
  "/verify-email",
  rateLimiter.auth,
  [body("token").trim().notEmpty().withMessage("Verification token is required.")],
  handleValidation,
  ctrl.verifyEmail
)

router.post(
  "/resend-verification",
  rateLimiter.auth,
  [body("email").trim().isEmail().withMessage("Enter a valid email address.")],
  handleValidation,
  ctrl.resendVerification
)

router.post(
  "/login",
  rateLimiter.login,
  [
    body("email").trim().isEmail().withMessage("Enter a valid email address."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  handleValidation,
  ctrl.login
)

router.post("/refresh", rateLimiter.auth, ctrl.refresh)
router.post("/logout", ctrl.logout)

router.get(
  "/approvals/pending",
  requireAuth,
  requireRole("admin"),
  ctrl.pendingApprovals
)
router.post(
  "/approvals/:id/approve",
  requireAuth,
  requireRole("admin"),
  [body("comment").optional().trim()],
  handleValidation,
  ctrl.approve
)
router.post(
  "/approvals/:id/reject",
  requireAuth,
  requireRole("admin"),
  [body("reason").trim().notEmpty().withMessage("A rejection reason is required.")],
  handleValidation,
  ctrl.reject
)

router.get("/me", requireAuth, ctrl.me)

router.post(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    passwordRule,
  ],
  handleValidation,
  ctrl.changePassword
)

router.post(
  "/forgot-password",
  rateLimiter.auth,
  [body("email").trim().isEmail().withMessage("Enter a valid email address.")],
  handleValidation,
  ctrl.forgotPassword
)

router.post(
  "/reset-password",
  rateLimiter.auth,
  [
    body("token").trim().notEmpty().withMessage("Reset token is required."),
    passwordRule,
  ],
  handleValidation,
  ctrl.resetPassword
)

module.exports = router
