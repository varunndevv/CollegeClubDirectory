import { apiRequest } from "./api-client"
import { clubs as staticClubs } from "./clubs"

/* =======================
   CLUBS
======================= */

export const getClubs = async () => {
  try {
    const data = await apiRequest("/clubs")
    return data?.clubs?.length ? data.clubs : staticClubs
  } catch (error) {
    console.error("getClubs failed, using static data", error)
    return staticClubs
  }
}

export const getClubDetail = async (slug) => {
  if (!slug) return null;

  try {
    const lookup = await apiRequest(`/clubs?slug=${encodeURIComponent(slug)}`)
    const dbClub = lookup?.clubs?.[0]

    if (!dbClub) {
      const fallback = staticClubs.find((c) => c.slug === slug)
      return fallback ? { club: fallback, stats: {}, events: [], reviews: [], announcements: [] } : null
    }

    const clubId = dbClub.id || dbClub._id
    if (!clubId) {
      const fallback = staticClubs.find((c) => c.slug === slug)
      return fallback ? { club: fallback, stats: {}, events: [], reviews: [], announcements: [] } : null
    }

    const detail = await apiRequest(`/clubs/${clubId}`)

    // Ensure stats exists even if detail endpoint doesn't include it
    if (detail?.club && !detail.club.stats && dbClub.stats) {
      detail.club.stats = dbClub.stats
    }

    return detail
  } catch (error) {
    console.error("getClubDetail failed:", error);
    // Fallback to static data on error
    const fallback = staticClubs.find((c) => c.slug === slug)
    return fallback ? { club: fallback, stats: {}, events: [], reviews: [], announcements: [] } : null
  }
}

export const saveClub = async (club) => {
  const data = await apiRequest("/clubs", {
    method: "POST",
    body: club,
  })
  return data.club
}

export const updateClub = async (clubId, updates) => {
  const data = await apiRequest(`/clubs/${clubId}`, {
    method: "PATCH",
    body: updates,
  })
  return data.club
}

export const deleteClub = async (clubId) => {
  await apiRequest(`/clubs/${clubId}`, { method: "DELETE" })
}

export const getAllClubs = async () => {
  const data = await apiRequest("/clubs?status=all")
  return data.clubs || []
}

/* =======================
   MEMBERSHIPS
======================= */

export const getMembershipsByUser = async (userId) => {
  if (!userId) return []
  const data = await apiRequest(`/memberships/user/${userId}`)
  return data.memberships || []
}

export const getMembershipsByClub = async (clubId) => {
  if (!clubId) return []
  const data = await apiRequest(`/memberships/club/${clubId}`)
  return data.memberships || []
}

export const saveMembership = async (membership) => {
  const data = await apiRequest("/memberships", {
    method: "POST",
    body: membership,
  })
  return data.membership
}

export const updateMembership = async (membershipId, updates) => {
  const data = await apiRequest(`/memberships/${membershipId}`, {
    method: "PATCH",
    body: updates,
  })
  return data.membership
}

export const deleteMembership = async (userId, clubId) => {
  if (!userId || !clubId) return

  const memberships = await getMembershipsByUser(userId)

  const membership = memberships.find(
    (m) => String(m.clubId) === String(clubId)
  )

  if (!membership) return

  await apiRequest(
    `/memberships/${membership.id || membership._id}`,
    { method: "DELETE" }
  )
}

export const deleteMembershipById = async (membershipId) => {
  if (!membershipId) return
  await apiRequest(`/memberships/${membershipId}`, { method: "DELETE" })
}

/* =======================
   EVENTS
======================= */

export const getEventsByClub = async (clubId) => {
  if (!clubId) return []
  const data = await apiRequest(`/events/club/${clubId}`)
  return data.events || []
}

export const saveEvent = async (event) => {
  if (event.id || event._id) {
    const data = await apiRequest(`/events/${event.id || event._id}`, {
      method: "PUT",
      body: event,
    })
    return data.event
  }

  const data = await apiRequest("/events", {
    method: "POST",
    body: event,
  })
  return data.event
}

export const deleteEvent = async (eventId) => {
  if (!eventId) return
  await apiRequest(`/events/${eventId}`, { method: "DELETE" })
}

/* =======================
   RSVPs
======================= */

export const getEventRSVPsByUser = async (userId) => {
  if (!userId) return []
  const data = await apiRequest(`/rsvps/user/${userId}`)
  return data.rsvps || []
}

export const saveEventRSVP = async (rsvp) => {
  const data = await apiRequest("/rsvps", {
    method: "POST",
    body: rsvp,
  })
  return data.rsvp
}

/* =======================
   ANNOUNCEMENTS
======================= */

export const getAnnouncementsByClub = async (clubId) => {
  if (!clubId) return []
  const data = await apiRequest(`/announcements/club/${clubId}`)
  return data.announcements || []
}

export const saveAnnouncement = async (announcement) => {
  if (announcement.id || announcement._id) {
    const data = await apiRequest(
      `/announcements/${announcement.id || announcement._id}`,
      { method: "PUT", body: announcement }
    )
    return data.announcement
  }

  const data = await apiRequest("/announcements", {
    method: "POST",
    body: announcement,
  })
  return data.announcement
}

export const deleteAnnouncement = async (announcementId) => {
  if (!announcementId) return
  await apiRequest(`/announcements/${announcementId}`, { method: "DELETE" })
}

/* =======================
   REVIEWS
======================= */

export const getReviewsByClub = async (clubId) => {
  if (!clubId) return []
  const data = await apiRequest(`/reviews/club/${clubId}`)
  return data.reviews || []
}

export const getReviewsByUser = async (userId) => {
  if (!userId) return []
  const data = await apiRequest(`/reviews/user/${userId}`)
  return data.reviews || []
}

export const saveReview = async (review) => {
  const data = await apiRequest("/reviews", {
    method: "POST",
    body: review,
  })
  return data.review
}

export const getAverageRating = async (clubId) => {
  const reviews = await getReviewsByClub(clubId)
  if (!reviews.length) return 0
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0)
  return Number((sum / reviews.length).toFixed(1))
}
