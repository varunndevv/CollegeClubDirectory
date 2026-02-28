"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Users, Calendar, MapPin, Mail, ExternalLink, ArrowLeft, Loader2, X } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"
import {
  getClubDetail,
  getMembershipsByUser,
  saveMembership,
  deleteMembership,
  saveEventRSVP,
  getEventRSVPsByUser,
  saveReview,
  getAverageRating,
} from "@/lib/data-utils"

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [club, setClub] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [pendingMembership, setPendingMembership] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [events, setEvents] = useState([])
  const [reviews, setReviews] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [rating, setRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [rsvps, setRsvps] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      if (!params?.slug) { router.push("/clubs"); return }
      setLoading(true)
      try {
        const detail = await getClubDetail(params.slug)
        if (!mounted) return
        const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentUser") || "null") : null
        setCurrentUser(user)
        setClub(detail.club)
        setMemberCount(detail.club?.stats?.memberCount || 0)
        setEvents(detail.events || [])
        setReviews(detail.reviews || [])
        setAnnouncements(detail.announcements || [])
        setRating(detail.club?.stats?.rating || 0)

        if (user) {
          const userId = user.id || user._id
          const memberships = await getMembershipsByUser(userId)
          if (!mounted) return
          const clubId = String(detail.club?.id || detail.club?._id || "")
          const active = memberships.find((m) => String(m.clubId) === clubId && m.status === "joined")
          const pending = memberships.find((m) => String(m.clubId) === clubId && m.status === "pending")
          setIsMember(!!active)
          setPendingMembership(!!pending)

          const userRsvps = await getEventRSVPsByUser(userId)
          if (!mounted) return
          const rsvpMap = {}
          userRsvps.forEach((r) => { rsvpMap[r.eventId] = r.status })
          setRsvps(rsvpMap)
        }
        setError("")
      } catch (err) {
        setError(err.message || "Unable to load club.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [params.slug, router])

  // Poll membership status
  useEffect(() => {
    if (!currentUser || !club) return
    const check = async () => {
      try {
        const userId = currentUser.id || currentUser._id
        const memberships = await getMembershipsByUser(userId)
        const clubId = String(club.id || club._id || "")
        const active = memberships.find((m) => String(m.clubId) === clubId && m.status === "joined")
        const pending = memberships.find((m) => String(m.clubId) === clubId && m.status === "pending")
        const newIsMember = !!active
        const newPending = !!pending
        if (newIsMember !== isMember || newPending !== pendingMembership) {
          setIsMember(newIsMember)
          setPendingMembership(newPending)
          if (newIsMember && !isMember) {
            const updated = await getClubDetail(params.slug)
            if (updated?.club?.stats?.memberCount !== undefined) setMemberCount(updated.club.stats.memberCount)
          }
        }
      } catch { }
    }
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [currentUser, club, isMember, pendingMembership, params.slug])

  const handleJoinClub = async () => {
    if (!currentUser || !club) { router.push("/sign-in"); return }
    try {
      await saveMembership({
        userId: currentUser.id || currentUser._id,
        clubId: club.id || club._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: "pending",
        role: "member",
        joinedAt: new Date().toISOString(),
      })
      setPendingMembership(true)
      setIsMember(false)
      const updated = await getClubDetail(params.slug)
      if (updated?.club?.stats?.memberCount !== undefined) setMemberCount(updated.club.stats.memberCount)
    } catch (err) {
      if (err.status === 409 || err.message?.includes("already")) {
        alert("You are already a member of this club!")
      } else {
        alert("Failed to join club. Please try again.")
      }
    }
  }

  const handleLeaveClub = async () => {
    if (!currentUser || !club) return
    try {
      await deleteMembership(currentUser.id || currentUser._id, club.id || club._id)
      setIsMember(false)
      setMemberCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRSVP = async (eventId, status) => {
    if (!currentUser) { router.push("/sign-in"); return }
    const previousStatus = rsvps[eventId]
    try {
      const event = events.find((e) => (e.id || `${e.title}-${e.date}`) === eventId)
      await saveEventRSVP({
        eventId, userId: currentUser.id || currentUser._id, status,
        clubId: club.id, clubName: club.name,
        eventTitle: event?.title, eventDate: event?.date, eventTime: event?.time, eventLocation: event?.location,
      })
      setRsvps((prev) => ({ ...prev, [eventId]: status }))
      setEvents((prev) =>
        prev.map((e) => {
          if ((e.id || `${e.title}-${e.date}`) !== eventId) return e
          let delta = 0
          if (status === "going" && previousStatus !== "going") delta = 1
          if (status !== "going" && previousStatus === "going") delta = -1
          return { ...e, rsvpCount: Math.max(0, (e.rsvpCount || 0) + delta) }
        })
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !club || !reviewComment.trim()) return
    try {
      const saved = await saveReview({
        clubId: club.id, userId: currentUser.id || currentUser._id,
        userName: currentUser.name, rating: reviewRating,
        comment: reviewComment, createdAt: new Date().toISOString(),
      })
      setReviews((prev) => [saved, ...prev])
      const newRating = await getAverageRating(club.id)
      setRating(parseFloat(newRating) || 0)
      setShowReviewForm(false)
      setReviewComment("")
      setReviewRating(5)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen pt-24 px-6 text-center">
        <p className="text-destructive text-lg">{error || "Club not found"}</p>
        <Link href="/clubs" className="text-primary hover:underline text-sm mt-4 inline-block">Back to Clubs</Link>
      </div>
    )
  }

  const clubId = club.id || club._id
  let isClubAdminForThisClub = false;
  if (currentUser && currentUser.role === "clubAdmin") {
    const activeAdminMembership = memberships?.find(m => String(m.clubId) === String(clubId) && ["admin", "officer"].includes(m.role) && m.status === "joined")
    if (activeAdminMembership) isClubAdminForThisClub = true;
  }
  const canViewMemberContent = isMember || isClubAdminForThisClub

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/clubs" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Clubs
          </Link>
          <span>/</span>
          <span className="text-foreground">{club.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 border border-border/50 flex items-center justify-center overflow-hidden">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{club.name?.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-3">{club.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {club.category && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  {club.category}
                </span>
              )}
              {club.membershipType && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {club.membershipType}
                </span>
              )}
              {rating > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400" /> {rating} ({reviews.length})
                </span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">{club.shortDescription}</p>

            <div className="flex items-center gap-5 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {memberCount} members
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {rating > 0 ? `${rating} rating` : "No reviews"}
              </span>
            </div>

            {currentUser && (
              <div>
                {!isMember && !pendingMembership && (
                  <InteractiveButton
                    variant="solid"
                    onClick={handleJoinClub}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    {club.membershipType === "Open" ? "Join Club" : "Request to Join"}
                  </InteractiveButton>
                )}
                {pendingMembership && (
                  <button disabled className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium opacity-60 cursor-not-allowed">
                    Request Pending...
                  </button>
                )}
                {isMember && (
                  <InteractiveButton
                    variant="outline"
                    onClick={handleLeaveClub}
                    className="px-6 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    Leave Club
                  </InteractiveButton>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Member-only notice */}
        {!canViewMemberContent && (
          <InteractiveGlassPanel interactive={false} className="p-5 border-none mb-8">
            <p className="text-sm text-muted-foreground">Events and announcements are available only to approved members of this club.</p>
          </InteractiveGlassPanel>
        )}

        {/* Announcements */}
        {canViewMemberContent && announcements.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <InteractiveGlassPanel key={a.id} interactive={false} className="p-5 border-none group">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </InteractiveGlassPanel>
              ))}
            </div>
          </section>
        )}

        {/* Full Description */}
        {club.fullDescription && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{club.fullDescription}</p>
          </section>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <InteractiveGlassPanel interactive={false} className="p-5 border-none">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Calendar className="w-4 h-4 text-primary" /> Meeting Times
            </div>
            <p className="text-sm text-muted-foreground">{club.meetingTimes || "Not specified"}</p>
          </InteractiveGlassPanel>

          <InteractiveGlassPanel interactive={false} className="p-5 border-none">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Mail className="w-4 h-4 text-primary" /> Contact
            </div>
            <div className="space-y-1">
              {club.email && (
                <a href={`mailto:${club.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {club.email}
                </a>
              )}
              {club.social?.website && (
                <a href={club.social.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Website
                </a>
              )}
              {club.social?.instagram && (
                <a href={club.social.instagram} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Instagram
                </a>
              )}
              {club.social?.twitter && (
                <a href={club.social.twitter} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Twitter
                </a>
              )}
            </div>
          </InteractiveGlassPanel>
        </div>

        {/* Events */}
        {canViewMemberContent && events.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {events.map((event) => {
                const eventId = event.id || `${event.title}-${event.date}`
                const userRSVP = rsvps[eventId]
                return (
                  <InteractiveGlassPanel key={eventId} interactive={false} className="p-5 border-none group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {event.date}{event.time ? ` at ${event.time}` : ""}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </span>
                          )}
                          {event.rsvpCount > 0 && <span>{event.rsvpCount} going</span>}
                        </div>
                      </div>
                      {currentUser && (
                        <div className="ml-4 shrink-0 z-10 relative">
                          {userRSVP === "going" ? (
                            <InteractiveButton
                              variant="outline"
                              onClick={() => handleRSVP(eventId, "not_going")}
                              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                              Cancel RSVP
                            </InteractiveButton>
                          ) : (
                            <InteractiveButton
                              variant="solid"
                              onClick={() => handleRSVP(eventId, "going")}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            >
                              RSVP
                            </InteractiveButton>
                          )}
                        </div>
                      )}
                    </div>
                  </InteractiveGlassPanel>
                )
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Reviews & Ratings</h2>
            {currentUser && (
              <InteractiveButton
                variant="solid"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Write Review
              </InteractiveButton>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6 p-6 rounded-xl bg-card border border-primary/20 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Your Review</h3>
                <button onClick={() => setShowReviewForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50 resize-none"
                  />
                </div>
                <InteractiveButton
                  variant="solid"
                  onClick={handleSubmitReview}
                  className="w-full py-2 rounded-lg text-sm font-medium mt-4"
                >
                  Submit Review
                </InteractiveButton>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <InteractiveGlassPanel key={review.id} interactive={false} className="p-5 border-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">{review.userName}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]" : "text-muted-foreground/30"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </InteractiveGlassPanel>
              ))}
            </div>
          )}
        </section>

        {/* Gallery */}
        {club.images?.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {club.images.map((src, i) => (
                <img
                  key={i}
                  src={src || "/placeholder.svg"}
                  alt={`Gallery image ${i + 1} for ${club.name}`}
                  className="h-28 w-full rounded-xl border border-border/50 object-cover"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
