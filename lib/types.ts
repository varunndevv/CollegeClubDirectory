// Types for the Club Directory

export type Club = {
  id: string
  slug: string
  name: string
  logoUrl: string
  shortDescription: string
  fullDescription: string
  category: "Sports" | "Tech" | "Arts" | "Community" | "Academic"
  membershipType: "Open" | "Closed"
  email: string
  social?: {
    website?: string
    twitter?: string
    instagram?: string
  }
  meetingTimes: string
  events: Array<{
    id: string
    title: string
    date: string
    time?: string
    location: string
    description?: string
    createdBy?: string
    createdAt?: string
  }>
  images?: string[]
  memberCount?: number
  averageRating?: number
  reviewCount?: number
  status?: "active" | "pending" | "rejected"
  createdBy?: string
  createdAt?: string
}

export type Membership = {
  id: string
  userId: string
  clubId: string
  status: "active" | "pending" | "rejected"
  role: "member" | "officer" | "president"
  joinedAt: string
}

export type EventRSVP = {
  id: string
  eventId: string
  userId: string
  status: "going" | "maybe" | "not_going"
  createdAt: string
}

export type Announcement = {
  id: string
  clubId: string
  title: string
  content: string
  createdBy: string
  createdAt: string
  priority?: "low" | "medium" | "high"
}

export type Review = {
  id: string
  clubId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export type Message = {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  receiverName: string
  content: string
  read: boolean
  createdAt: string
}

export type User = {
  id: string
  name: string
  email: string
  usn: string
  yearOfStudy: string
  phoneNumber: string
  password: string
  role: "user" | "admin"
  assignedClubId?: string
  createdAt: string
}
