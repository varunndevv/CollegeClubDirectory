"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"
import { User, Mail, Hash, Phone, GraduationCap, Edit2, Save, X, Loader2, Shield, LogOut } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem("currentUser")
        if (!stored) {
          router.push("/sign-in")
          return
        }

        let userData = JSON.parse(stored)
        const userId = userData.id || userData._id

        try {
          const freshUserRes = await apiRequest(`/users/id/${userId}`)
          if (freshUserRes.user) {
            userData = freshUserRes.user
            localStorage.setItem("currentUser", JSON.stringify(userData))
          }
        } catch (e) {
          console.error("Failed to fetch fresh user data:", e)
        }

        setUser(userData)
        setForm({
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || "",
          yearOfStudy: userData.yearOfStudy || "",
        })

        if (userId) {
          try {
            const memData = await apiRequest(`/memberships/user/${userId}`)
            setMemberships(memData.memberships || [])
          } catch {
            // ignore
          }
        }
      } catch {
        router.push("/sign-in")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const userId = user.id || user._id
      const data = await apiRequest(`/users/id/${userId}`, {
        method: "PATCH",
        body: form,
      })

      if (data.user) {
        setUser(data.user)
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        setSuccess("Profile updated successfully.")
        setEditing(false)
      }
    } catch (err) {
      setError(err.message || "Update failed.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"}/users/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // ignore
    }
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    window.dispatchEvent(new Event("auth-change"))
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const roleBadge = {
    pageAdmin: "Admin",
    clubAdmin: "Club Admin",
    admin: "Admin",
    user: "Member",
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <InteractiveButton
              variant="ghost"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </InteractiveButton>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
              {success}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Shield className="w-3 h-3" />
                    {roleBadge[user.role] || "Member"}
                  </span>
                </div>
              </div>

              {!editing ? (
                <InteractiveButton
                  variant="ghost"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </InteractiveButton>
              ) : (
                <div className="flex gap-2">
                  <InteractiveButton
                    variant="solid"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </InteractiveButton>
                  <InteractiveButton
                    variant="ghost"
                    onClick={() => {
                      setEditing(false)
                      setForm({
                        name: user.name || "",
                        phoneNumber: user.phoneNumber || "",
                        yearOfStudy: user.yearOfStudy || "",
                      })
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </InteractiveButton>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                  <div className="text-sm text-foreground">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">USN</div>
                  <div className="text-sm text-foreground">{user.usn || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Name</div>
                  {editing ? (
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                    />
                  ) : (
                    <div className="text-sm text-foreground">{user.name}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Phone</div>
                  {editing ? (
                    <input
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                      placeholder="Optional"
                    />
                  ) : (
                    <div className="text-sm text-foreground">{user.phoneNumber || "—"}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Year of Study</div>
                  {editing ? (
                    <select
                      value={form.yearOfStudy}
                      onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                    >
                      <option value="">Select</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  ) : (
                    <div className="text-sm text-foreground">
                      {user.yearOfStudy ? `${user.yearOfStudy}${["st", "nd", "rd", "th"][Math.min(user.yearOfStudy - 1, 3)]} Year` : "—"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Memberships */}
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">My Clubs</h3>
            {memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven&apos;t joined any clubs yet.</p>
            ) : (
              <div className="space-y-3">
                {memberships.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border border-border/30"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{m.clubId?.name || m.clubName || m.clubId}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{m.role || "member"}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "joined"
                            ? "bg-primary/10 text-primary"
                            : m.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-destructive/10 text-destructive"
                            }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </div>
                    {m.status === "joined" && m.clubId?.slug && (
                      <Link
                        href={`/clubs/${m.clubId.slug}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                      >
                        Go to Club
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
