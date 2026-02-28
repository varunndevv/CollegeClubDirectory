import "../env.js"

import nodemailer from "nodemailer"

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@collegeclubdirectory.com"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Send an OTP email using Resend.
 * Falls back to simulation mode when RESEND_API_KEY is not set.
 */
export async function sendOtpEmail(to, otp) {
  const subject = `Your OTP Code: ${otp}`
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1a1a2e; margin: 0;">College Club Directory</h2>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="color: #64748b; margin: 0 0 16px;">Your verification code is:</p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0;">
          This code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html,
      })

      console.log(`[Email] Sent OTP to ${to} via Nodemailer (id: ${result.messageId})`)
      return { sent: true, code: otp }
    } catch (err) {
      console.error("[Email] Nodemailer send failed:", err.message)
      return { sent: false, error: err.message, code: otp }
    }
  }

  console.warn("[Email] Warning: Email credentials not configured, skipping OTP send.");
  return { sent: false, error: "Credentials not configured", code: otp }
}
