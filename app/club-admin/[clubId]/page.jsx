"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  getClubs,
  getMembershipsByClub,
  updateMembership,
  deleteMembershipById,
  getEventsByClub,
  saveEvent,
  deleteEvent,
  getAnnouncementsByClub,
  saveAnnouncement,
  deleteAnnouncement,
} from "@/lib/data-utils"
import { apiRequest } from "@/lib/api-client"
import { Users, Calendar, Bell, Plus, Trash2, Check, X, Loader2 } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"

export default function ClubAdminPage() {
  const router = useRouter()
  const { clubId } = useParams()

  const [currentUser, setCurrentUser] = useState(null)
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("members")

  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", time: "", location: "" })

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", priority: "medium" })

  const loadData = useCallback(async () => {
    const [mem, evt, ann] = await Promise.all([
      getMembershipsByClub(clubId),
      getEventsByClub(clubId),
      getAnnouncementsByClub(clubId),
    ])
    setMembers(mem)
    setEvents(evt)
    setAnnouncements(ann)
  }, [clubId])

  useEffect(() => {
    const init = async () => {
      const cachedUser = JSON.parse(localStorage.getItem("currentUser") || "null")
      const cachedUserId = cachedUser?.id || cachedUser?._id
      if (!cachedUserId) { router.push("/sign-in"); return }

      setCurrentUser(cachedUser)

      try {
        const { user } = await apiRequest(`/users/id/${cachedUserId}`)
        const isClubAdminRole = user?.role === "clubAdmin"

        let hasClubAccess = false;
        if (isClubAdminRole) {
          try {
            const memberships = await getMembershipsByClub(clubId)
            hasClubAccess = memberships.some(m => String(m.userId) === String(user.id) && ["admin", "officer"].includes(m.role) && m.status === "joined")
          } catch (e) {
            console.error("Failed to check memberships for admin access.")
          }
        }

        if (!isClubAdminRole || !hasClubAccess) {
          router.push("/")
          return
        }
        setCurrentUser(user)
      } catch {
        router.push("/sign-in")
        return
      }

      const clubs = await getClubs()
      const foundClub = clubs.find((c) => String(c.id || c._id) === String(clubId))
      if (!foundClub) { setError("Club not found"); return }

      setClub(foundClub)
      await loadData()
      setLoading(false)
    }
    init()
  }, [clubId, router, loadData])

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000) }

  const handleApproveMember = async (id) => {
    await updateMembership(id, { status: "joined" })
    await loadData()
    flash("Member approved.")
  }

  const handleRejectMember = async (id) => {
    await updateMembership(id, { status: "rejected" })
    await loadData()
    flash("Member rejected.")
  }

  const handleRemoveMember = async (id) => {
    if (!confirm("Remove this member from the club?")) return
    await deleteMembershipById(id)
    await loadData()
    flash("Member removed.")
  }

  const handleCreateEvent = async () => {
    setError("")
    try {
      await saveEvent({
        clubId: String(clubId),
        ...eventForm,
        createdBy: currentUser?.id || currentUser?._id || "",
      })
      setShowEventForm(false)
      setEventForm({ title: "", description: "", date: "", time: "", location: "" })
      await loadData()
      flash("Event created.")
    } catch (err) {
      setError(err.message || "Failed to save event.")
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return
    try {
      await deleteEvent(id)
      await loadData()
      flash("Event deleted.")
    } catch (err) {
      setError(err.message || "Failed to delete event.")
    }
  }

  const handleCreateAnnouncement = async () => {
    setError("")
    try {
      await saveAnnouncement({
        clubId: String(clubId),
        ...announcementForm,
        createdBy: currentUser?.email || "",
      })
      setShowAnnouncementForm(false)
      setAnnouncementForm({ title: "", content: "", priority: "medium" })
      await loadData()
      flash("Announcement created.")
    } catch (err) {
      setError(err.message || "Failed to save announcement.")
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Delete this announcement?")) return
    try {
      await deleteAnnouncement(id)
      await loadData()
      flash("Announcement deleted.")
    } catch (err) {
      setError(err.message || "Failed to delete announcement.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  const pendingMembers = members.filter((m) => m.status === "pending")
  const activeMembers = members.filter((m) => m.status === "joined")

  const tabs = [
    { id: "members", label: "Members", icon: Users, count: pendingMembers.length },
    { id: "events", label: "Events", icon: Calendar, count: events.length },
    { id: "announcements", label: "Announcements", icon: Bell, count: announcements.length },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">{club?.name}</h1>
        <p className="text-muted-foreground mb-8">Club Administration Panel</p>

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm animate-fade-in">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 glass-panel p-1 border-none w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-primary/20" : "bg-muted"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-fade-in">
            {/* Pending */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                Pending Requests
                {pendingMembers.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                    {pendingMembers.length}
                  </span>
                )}
              </h2>
              {pendingMembers.length === 0 ? (
                <div className="p-6 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground">
                  No pending requests.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingMembers.map((m) => (
                    <InteractiveGlassPanel key={m.id} className="flex items-center justify-between p-4 border-yellow-500/20 hover:border-yellow-400/40 group">
                      <div>
                        <div className="text-sm font-medium text-foreground">{m.userName}</div>
                        <div className="text-xs text-muted-foreground">{m.userEmail}</div>
                      </div>
                      <div className="flex gap-2">
                        <InteractiveButton
                          variant="ghost"
                          onClick={() => handleApproveMember(m.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-primary text-xs font-medium hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(159,220,200,0.3)] transition-all duration-300 z-10"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </InteractiveButton>
                        <InteractiveButton
                          variant="ghost"
                          onClick={() => handleRejectMember(m.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-destructive text-xs font-medium hover:bg-destructive/20 hover:shadow-[0_0_12px_rgba(229,77,77,0.3)] transition-all duration-300 z-10"
                        >
                          <X className="w-3 h-3" /> Reject
                        </InteractiveButton>
                      </div>
                    </InteractiveGlassPanel>
                  ))}
                </div>
              )}
            </div>

            {/* Active */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Active Members ({activeMembers.length})
              </h2>
              {activeMembers.length === 0 ? (
                <div className="p-6 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground">
                  No active members.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeMembers.map((m) => (
                    <InteractiveGlassPanel key={m.id} className="flex items-center justify-between p-4 border-none group">
                      <div className="text-sm font-medium text-foreground">{m.userName}</div>
                      <InteractiveButton
                        variant="ghost"
                        onClick={() => handleRemoveMember(m.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </InteractiveButton>
                    </InteractiveGlassPanel>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Events</h2>
              <InteractiveButton
                variant="solid"
                onClick={() => setShowEventForm(!showEventForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Event
              </InteractiveButton>
            </div>

            {showEventForm && (
              <InteractiveGlassPanel interactive={false} className="mb-6 p-6 border border-primary/20 border-t-primary/40 shadow-[0_4px_30px_rgba(159,220,200,0.1)] animate-fade-in w-full overflow-visible">
                <h3 className="text-sm font-semibold text-foreground mb-4">New Event</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                  />
                  <textarea
                    placeholder="Description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50 resize-none"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      placeholder="Date (e.g. 2026-03-15)"
                      value={eventForm.date}
                      onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                    <input
                      placeholder="Time (e.g. 3:00 PM)"
                      value={eventForm.time}
                      onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                    <input
                      placeholder="Location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <InteractiveButton
                      variant="ghost"
                      onClick={() => setShowEventForm(false)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </InteractiveButton>
                    <InteractiveButton
                      variant="solid"
                      onClick={handleCreateEvent}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium"
                    >
                      Save Event
                    </InteractiveButton>
                  </div>
                </div>
              </InteractiveGlassPanel>
            )}

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="p-6 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground">
                  No events yet. Create your first event above.
                </div>
              ) : (
                events.map((evt) => (
                  <InteractiveGlassPanel key={evt.id || evt._id} className="flex items-start justify-between p-5 border-none group">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{evt.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {evt.date}{evt.time ? ` · ${evt.time}` : ""}{evt.location ? ` · ${evt.location}` : ""}
                      </div>
                      {evt.description && (
                        <div className="text-sm text-muted-foreground mt-2">{evt.description}</div>
                      )}
                    </div>
                    <InteractiveButton
                      variant="ghost"
                      onClick={() => handleDeleteEvent(evt.id || evt._id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:shadow-[0_0_10px_rgba(229,77,77,0.2)] transition-all duration-300 shrink-0 ml-4 z-10"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </InteractiveButton>
                  </InteractiveGlassPanel>
                ))
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === "announcements" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Announcements</h2>
              <InteractiveButton
                variant="solid"
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Announcement
              </InteractiveButton>
            </div>

            {showAnnouncementForm && (
              <InteractiveGlassPanel interactive={false} className="mb-6 p-6 border border-primary/20 border-t-primary/40 shadow-[0_4px_30px_rgba(159,220,200,0.1)] animate-fade-in w-full overflow-visible">
                <h3 className="text-sm font-semibold text-foreground mb-4">New Announcement</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                  />
                  <textarea
                    placeholder="Content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm((p) => ({ ...p, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50 resize-none"
                  />
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm((p) => ({ ...p, priority: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <InteractiveButton
                      variant="ghost"
                      onClick={() => setShowAnnouncementForm(false)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </InteractiveButton>
                    <InteractiveButton
                      variant="solid"
                      onClick={handleCreateAnnouncement}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium"
                    >
                      Post Announcement
                    </InteractiveButton>
                  </div>
                </div>
              </InteractiveGlassPanel>
            )}

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-6 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground">
                  No announcements yet.
                </div>
              ) : (
                announcements.map((a) => (
                  <InteractiveGlassPanel key={a.id || a._id} className="flex items-start justify-between p-5 border-none group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{a.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${a.priority === "high"
                          ? "bg-destructive/10 text-destructive"
                          : a.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-muted text-muted-foreground"
                          }`}>
                          {a.priority}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{a.content}</div>
                    </div>
                    <InteractiveButton
                      variant="ghost"
                      onClick={() => handleDeleteAnnouncement(a.id || a._id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:shadow-[0_0_10px_rgba(229,77,77,0.2)] transition-all duration-300 shrink-0 ml-4 z-10"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </InteractiveButton>
                  </InteractiveGlassPanel>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
