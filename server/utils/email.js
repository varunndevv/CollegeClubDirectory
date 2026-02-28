import "../env.js"

import { Resend } from "resend"

// Use Resend's required onboarding domain if the user hasn't verified their own custom domain yet
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev"
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send an OTP email using Resend (HTTP Port 443).
 * Bypasses Render's strict SMTP block on port 587.
 * Falls back to simulation mode only if RESEND_API_KEY is not set.
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
      </div>
    </div>
  `

  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("[Email] Resend API error:", error.message);
        return { sent: false, error: error.message, code: "123456" };
      }

      console.log(`[Email] Successfully sent OTP to ${to} via Resend (id: ${data.id})`);
      return { sent: true, code: otp };
    } catch (err) {
      console.error("[Email] Critical Resend failure:", err.message);
      return { sent: false, error: err.message, code: "123456" };
    }
  }

  console.warn("[Email] Warning: RESEND_API_KEY not configured, skipping actual OTP send.");
  return { sent: false, error: "Credentials not configured", code: "123456" };
}
