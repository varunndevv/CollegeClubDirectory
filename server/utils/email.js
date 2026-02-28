import "../env.js"

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7JNKJBnK2xpVkO7mLkNX-CP70vRANbQ6MgUYMUNFiGg8GsvG8UrW_2eNrEDFA3v6Q/exec"

/**
 * Send an OTP email using Google Apps Script (HTTP Port 443).
 * Bypasses Render's strict SMTP block on port 587 and Resend's domain restrictions.
 */
export async function sendOtpEmail(to, otp) {
  const subject = `Your OTP Code: ${otp}`
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1a1a2e; margin: 0; font-size: 24px;">BMSCE Club Directory</h2>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="color: #64748b; margin: 0 0 16px; font-size: 15px;">Your verification code is:</p>
        <div style="font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; margin: 16px 0;">
          ${otp}
        </div>
      </div>
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
          This is an automated security message from the BMSCE College Club Directory system.<br>
          Please do not reply to this email. If you did not request this OTP, please ignore it.
        </p>
      </div>
    </div>
  `

  try {
    // Google Apps Script strongly prefers URL-encoded form data to bypass strict CORS preflights
    const formData = new URLSearchParams()
    formData.append("to", to)
    formData.append("subject", subject)
    formData.append("html", html)

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    });

    // Google Apps script redirects POST requests, which fetch follows. We just need to check if it succeeded.
    if (!response.ok) {
      throw new Error(`Script returned status: ${response.status}`);
    }

    // Google Apps script redirects POST requests, which fetch follows. We just need to check if it succeeded.
    console.log(`[Email] Successfully sent OTP to ${to} via Google Apps Script Relay`);
    return { sent: true, code: otp };

  } catch (err) {
    console.error("[Email] Critical Event failure sending email via Google Script:", err.message);
    return { sent: false, error: err.message, code: "123456" };
  }
}
