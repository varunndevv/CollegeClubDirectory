"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api-client"
import { Check, X, Trash2, Loader2, Shield, Clock } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null)
  const [clubs, setClubs] = useState([])
  const [pendingClubs, setPendingClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem("currentUser")
        if (!stored) { router.push("/sign-in"); return }
        const u = JSON.parse(stored)
        if (u.role !== "pageAdmin") { router.push("/"); return }
        setUser(u)

        const [allData, pendingData] = await Promise.all([
          apiRequest("/clubs?status=all"),
          apiRequest("/clubs?status=pending"),
        ])
        setClubs(allData.clubs || [])
        setPendingClubs(pendingData.clubs || [])
      } catch (err) {
        console.error("Admin load failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleAction = async (clubId, action) => {
    if (action === "delete" && !window.confirm("Are you sure you want to delete this club?")) {
      return
    }

    setActionLoading((prev) => ({ ...prev, [clubId + action]: true }))
    try {
      if (action === "approve" || action === "reject") {
        await apiRequest(`/clubs/${clubId}`, {
          method: "PATCH",
          body: { status: action === "approve" ? "approved" : "rejected" },
        })
      } else if (action === "delete") {
        await apiRequest(`/clubs/${clubId}`, { method: "DELETE" })
      }
      // Refresh
      const [allData, pendingData] = await Promise.all([
        apiRequest("/clubs?status=all"),
        apiRequest("/clubs?status=pending"),
      ])
      setClubs(allData.clubs || [])
      setPendingClubs(pendingData.clubs || [])
    } catch (err) {
      alert(err.message || "Action failed.")
    } finally {
      setActionLoading((prev) => ({ ...prev, [clubId + action]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <InteractiveGlassPanel className="p-6">
              <div className="text-3xl font-bold text-foreground">{clubs.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Clubs</div>
            </InteractiveGlassPanel>
            <InteractiveGlassPanel className="p-6 border-yellow-500/20">
              <div className="text-3xl font-bold text-yellow-400">{pendingClubs.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Pending Approval</div>
            </InteractiveGlassPanel>
            <InteractiveGlassPanel className="p-6">
              <div className="text-3xl font-bold text-primary">
                {clubs.filter((c) => c.status === "approved").length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Approved</div>
            </InteractiveGlassPanel>
          </div>

          {/* Pending Approvals */}
          {pendingClubs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Pending Approvals
              </h2>
              <div className="space-y-3">
                {pendingClubs.map((club) => (
                  <InteractiveGlassPanel
                    key={club.id || club._id}
                    className="flex items-center justify-between p-5 border-yellow-500/20 group"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{club.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {club.category} · {club.description?.substring(0, 80)}...
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-4">
                      <InteractiveButton
                        variant="ghost"
                        onClick={() => handleAction(club.id || club._id, "approve")}
                        disabled={actionLoading[(club.id || club._id) + "approve"]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary text-sm font-medium hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(159,220,200,0.3)] transition-all duration-300 disabled:opacity-50 z-10"
                      >
                        {actionLoading[(club.id || club._id) + "approve"] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </InteractiveButton>
                      <InteractiveButton
                        variant="ghost"
                        onClick={() => handleAction(club.id || club._id, "reject")}
                        disabled={actionLoading[(club.id || club._id) + "reject"]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/20 hover:shadow-[0_0_15px_rgba(229,77,77,0.3)] transition-all duration-300 disabled:opacity-50 z-10"
                      >
                        {actionLoading[(club.id || club._id) + "reject"] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Reject
                      </InteractiveButton>
                    </div>
                  </InteractiveGlassPanel>
                ))}
              </div>
            </section>
          )}

          {/* All Clubs */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">All Clubs</h2>
            <InteractiveGlassPanel interactive={false} className="border-none w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {clubs.map((club) => (
                    <tr key={club.id || club._id} className="hover:bg-primary/5 transition-colors duration-300">
                      <td className="px-5 py-4 text-sm font-medium text-foreground">{club.name}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground hidden sm:table-cell">{club.category}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${club.status === "approved"
                            ? "bg-primary/10 text-primary"
                            : club.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-destructive/10 text-destructive"
                            }`}
                        >
                          {club.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <InteractiveButton
                          variant="ghost"
                          onClick={() => handleAction(club.id || club._id, "delete")}
                          disabled={actionLoading[(club.id || club._id) + "delete"]}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[(club.id || club._id) + "delete"] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </InteractiveButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InteractiveGlassPanel>
          </section>
        </div>
      </div>
    </div>
  )
}
