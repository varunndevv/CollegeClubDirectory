"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"

export default function SignInPage() {
  const [step, setStep] = useState("credentials") // credentials | otp | forgot | reset
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: { email, password },
      })

      if (data.otpRequired) {
        setStep("otp")
        if (data.otp) setDevOtp(data.otp)
        setMessage(data.message || "OTP sent to your email.")
      } else if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("authToken", data.token)
        }
        window.dispatchEvent(new Event("auth-change"))
        router.push("/clubs")
      }
    } catch (err) {
      setError(err.message || "Login failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: { email, password, otp },
      })

      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("authToken", data.token)
        }
        window.dispatchEvent(new Event("auth-change"))
        router.push("/clubs")
      }
    } catch (err) {
      setError(err.message || "OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/forgot-password", {
        method: "POST",
        body: { email },
      })
      if (data.otp) setDevOtp(data.otp)
      setMessage(data.message || "If the email exists, an OTP has been sent.")
      setStep("reset")
    } catch (err) {
      setError(err.message || "Request failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/reset-password", {
        method: "POST",
        body: { email, otp, newPassword },
      })
      setMessage(data.message || "Password reset successfully.")
      setTimeout(() => {
        setStep("credentials")
        setOtp("")
        setNewPassword("")
        setDevOtp("")
      }, 2000)
    } catch (err) {
      setError(err.message || "Reset failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md">
        <div className="animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {step === "forgot" || step === "reset" ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {step === "credentials" && "Sign in to your account"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "forgot" && "Enter your email to receive a reset code"}
              {step === "reset" && "Enter the OTP and your new password"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                {message}
                {devOtp && (
                  <span className="block mt-1 font-mono font-bold">DEV OTP: {devOtp}</span>
                )}
              </div>
            )}

            {/* CREDENTIALS FORM */}
            {step === "credentials" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@bmsce.ac.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <InteractiveButton
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In / Get OTP
                </InteractiveButton>

                <button
                  type="button"
                  onClick={() => { setStep("forgot"); setError(""); setMessage("") }}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </form>
            )}

            {/* OTP FORM */}
            {step === "otp" && (
              <form onSubmit={handleOtpVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm text-center tracking-[0.5em] font-mono text-lg focus:border-primary/50"
                  />
                </div>

                <InteractiveButton
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Sign In
                </InteractiveButton>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtp(""); setError(""); setMessage(""); setDevOtp("") }}
                  className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {step === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@bmsce.ac.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>

                <InteractiveButton
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Reset Code
                </InteractiveButton>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); setMessage("") }}
                  className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm text-center tracking-[0.5em] font-mono text-lg focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min 6 chars, 1 uppercase, 1 number, 1 special character
                  </p>
                </div>

                <InteractiveButton
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </InteractiveButton>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtp(""); setNewPassword(""); setError(""); setMessage(""); setDevOtp("") }}
                  className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
