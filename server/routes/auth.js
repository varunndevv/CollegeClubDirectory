import express from "express"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import asyncHandler from "../utils/asyncHandler.js"
import sanitizeUser from "../utils/sanitizeUser.js"
import { sendOtpEmail } from "../utils/email.js"
import { signToken, requireAuth } from "../utils/authMiddleware.js"
import { hasAssignedClub } from "../utils/hasAssignedClub.js"
import { validateRequest, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/index.js"

const router = express.Router()

const APPROVED_DOMAIN = "@bmsce.ac.in"
const OTP_EXPIRY_MINUTES = 10

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// Whitelisted fields for user profile updates
const ALLOWED_PROFILE_FIELDS = ["name", "phoneNumber", "yearOfStudy", "profilePicture"]

/* =====================================================
   REGISTER
===================================================== */
router.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      usn,
      yearOfStudy,
      phoneNumber,
      otp,
    } = req.body

    const trimmedUsn = usn.trim()

    /* ---------- OTP VERIFICATION ---------- */
    if (otp) {
      const user = await User.findOne({ email }).select(
        "+otpCode +otpExpiresAt"
      )

      if (!user) {
        return res.status(404).json({
          message: "Registration session not found.",
        })
      }

      if (user.otpCode !== otp || user.otpExpiresAt < Date.now()) {
        return res.status(400).json({
          message: "Invalid or expired OTP.",
        })
      }

      user.otpCode = undefined
      user.otpExpiresAt = undefined
      user.isVerified = true
      await user.save()

      // Issue JWT token
      const token = signToken(user)
      res.cookie("auth_token", token, COOKIE_OPTIONS)

      return res.status(201).json({
        user: sanitizeUser(user),
        token,
      })
    }

    const existing = await User.findOne({ email })

    // Allow re-sending OTP if user exists but hasn't completed OTP verification
    if (existing && !existing.otpCode) {
      return res.status(400).json({
        message: "Email already registered.",
      })
    }

    // USN uniqueness check
    if (!existing) {
      const existingUsn = await User.findOne({ usn: trimmedUsn })
      if (existingUsn) {
        return res.status(400).json({
          message: "USN already registered.",
        })
      }
    }

    const otpCode = generateOtp()
    const passwordHash = await bcrypt.hash(password, 10)

    if (existing) {
      existing.name = name
      existing.passwordHash = passwordHash
      existing.usn = trimmedUsn
      existing.yearOfStudy = yearOfStudy
      existing.phoneNumber = phoneNumber
      existing.otpCode = otpCode
      existing.otpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60000
      )
      await existing.save()
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        usn: trimmedUsn,
        yearOfStudy,
        phoneNumber,
        role: "user",
        otpCode,
        otpExpiresAt: new Date(
          Date.now() + OTP_EXPIRY_MINUTES * 60000
        ),
      })
    }

    const emailResult = await sendOtpEmail(email, otpCode)
    const exposeOtp = process.env.SHOW_DEV_OTP === "true"

    const devOtp = exposeOtp ? otpCode : undefined
    return res.status(200).json({
      otpRequired: true,
      message: devOtp
        ? `OTP sent to your college email. (DEV OTP: ${devOtp})`
        : "OTP sent to your college email.",
      otp: devOtp || undefined,
    })
  })
)

/* =====================================================
   LOGIN
===================================================== */
router.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body

    const user = await User.findOne({ email }).select(
      "+passwordHash +otpCode +otpExpiresAt"
    )

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
      })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
      })
    }

    /* ---------- OTP VERIFICATION ---------- */
    if (otp) {
      if (user.otpCode !== otp || user.otpExpiresAt < Date.now()) {
        return res.status(400).json({
          message: "Invalid or expired OTP.",
        })
      }

      // Club admin validation will now happen strictly on protected routes via Membership lookups

      user.otpCode = undefined
      user.otpExpiresAt = undefined
      user.isVerified = true
      await user.save()

      // Issue JWT token
      const token = signToken(user)
      res.cookie("auth_token", token, COOKIE_OPTIONS)

      return res.json({
        user: sanitizeUser(user),
        token,
      })
    }

    const otpCode = generateOtp()
    user.otpCode = otpCode
    user.otpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60000
    )
    await user.save()

    const emailResult = await sendOtpEmail(email, otpCode)
    const exposeOtp = process.env.SHOW_DEV_OTP === "true"

    const devOtp = exposeOtp ? otpCode : undefined

    return res.json({
      otpRequired: true,
      message: devOtp
        ? `OTP sent to your college email. (DEV OTP: ${devOtp})`
        : "OTP sent to your college email.",
      otp: devOtp || undefined,
    })
  })
)

/* =====================================================
   LOGOUT
===================================================== */
router.post("/logout", (_req, res) => {
  res.clearCookie("auth_token", COOKIE_OPTIONS)
  res.json({ message: "Logged out successfully." })
})

/* =====================================================
   GET CURRENT USER (from JWT)
===================================================== */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    res.json({ user: sanitizeUser(user) })
  })
)

/* =====================================================
   GET USER BY ID
===================================================== */
router.get(
  "/id/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      })
    }
    res.json({
      user: sanitizeUser(user),
    })
  })
)

/* =====================================================
   UPDATE USER (field-whitelisted)
===================================================== */
router.patch(
  "/id/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const actor = await User.findById(req.user.id)
    if (!actor) {
      return res.status(401).json({ message: "Invalid user context." })
    }

    const isPageAdmin = actor.role === "pageAdmin"
    const isSelf = String(actor.id) === String(req.params.id)

    if (!isSelf && !isPageAdmin) {
      return res.status(403).json({ message: "Not authorized." })
    }

    // Field whitelisting — only allow safe fields
    const updates = {}
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    // Page admins can also update role and assignedClubId
    if (isPageAdmin) {
      if (req.body.role !== undefined && req.body.role !== "pageAdmin") {
        updates.role = req.body.role
      }
      if (req.body.assignedClubId !== undefined) {
        updates.assignedClubId = req.body.assignedClubId
      }
    }

    if (req.body.password) {
      updates.passwordHash = await bcrypt.hash(req.body.password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      })
    }

    res.json({
      user: sanitizeUser(user),
    })
  })
)

/* =====================================================
   FORGOT PASSWORD REQUEST
===================================================== */
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email }).select("+otpCode +otpExpiresAt")

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: "If an account with this email exists, a password reset OTP has been sent.",
      })
    }

    const otpCode = generateOtp()
    user.otpCode = otpCode
    user.otpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60000
    )
    await user.save()

    const emailResult = await sendOtpEmail(email, otpCode)
    const exposeOtp = process.env.SHOW_DEV_OTP === "true"

    const devOtp = exposeOtp ? otpCode : undefined

    return res.json({
      message: devOtp
        ? `Password reset OTP sent to your college email. (DEV OTP: ${devOtp})`
        : "Password reset OTP sent to your college email.",
      otp: devOtp || undefined,
    })
  })
)

/* =====================================================
   RESET PASSWORD CONFIRMATION
===================================================== */
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body

    const user = await User.findOne({ email }).select(
      "+otpCode +otpExpiresAt"
    )

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      })
    }

    if (user.otpCode !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    user.passwordHash = passwordHash
    user.otpCode = undefined
    user.otpExpiresAt = undefined
    await user.save()

    return res.json({
      message: "Password reset successfully. You can now sign in with your new password.",
    })
  })
)

export default router
