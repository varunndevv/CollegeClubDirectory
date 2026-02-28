"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"
import { Eye, EyeOff, Mail, Lock, User, Hash, ArrowLeft, Loader2 } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"

export default function SignUpPage() {
  const [step, setStep] = useState("register") // register | otp
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    usn: "",
    yearOfStudy: "",
    phoneNumber: "",
  })
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState("")
  const router = useRouter()

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/register", {
        method: "POST",
        body: form,
      })

      if (data.otpRequired) {
        setStep("otp")
        if (data.otp) setDevOtp(data.otp)
        setMessage(data.message || "OTP sent to your email.")
      }
    } catch (err) {
      setError(err.message || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await apiRequest("/users/register", {
        method: "POST",
        body: { ...form, otp },
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

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16 pb-12">
      <div className="w-full max-w-md">
        <div className="animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {step === "otp" ? "Verify Email" : "Create Account"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {step === "otp" ? "Enter the OTP sent to your email" : "Join the campus club community"}
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

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="your.name@bmsce.ac.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">USN</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.usn}
                      onChange={(e) => updateForm("usn", e.target.value)}
                      placeholder="1BM22CS001"
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
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min 6 chars, 1 uppercase, 1 number, 1 special character
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Year of Study</label>
                    <select
                      value={form.yearOfStudy}
                      onChange={(e) => updateForm("yearOfStudy", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                    >
                      <option value="">Select</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => updateForm("phoneNumber", e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>

                <InteractiveButton
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send OTP
                </InteractiveButton>
              </form>
            )}

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
                  Verify & Create Account
                </InteractiveButton>

                <button
                  type="button"
                  onClick={() => { setStep("register"); setOtp(""); setError(""); setMessage(""); setDevOtp("") }}
                  className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
