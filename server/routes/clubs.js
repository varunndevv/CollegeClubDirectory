import express from "express"
import mongoose from "mongoose"
import Club from "../models/Club.js"
import Event from "../models/Event.js"
import Announcement from "../models/Announcement.js"
import Review from "../models/Review.js"
import RSVP from "../models/RSVP.js"
import Membership from "../models/Membership.js"
import User from "../models/User.js"
import asyncHandler from "../utils/asyncHandler.js"
import { buildClubStats } from "../utils/stats.js"
import { requireAuth, requireRole } from "../utils/authMiddleware.js"
import { hasAssignedClub } from "../utils/hasAssignedClub.js"

const router = express.Router()

function enrichClub(rawClub) {
  const club = { ...rawClub }
  if (club.description && typeof club.description === "string") {
    try {
      const parsed = JSON.parse(club.description)
      if (parsed && typeof parsed === "object") {
        club.shortDescription = parsed.shortDescription || club.shortDescription
        club.fullDescription = parsed.fullDescription || club.fullDescription
        club.membershipType = parsed.membershipType || club.membershipType
        club.email = parsed.contactEmail || club.email
        club.meetingTimes = parsed.meetingTimes || club.meetingTimes
        club.social = parsed.social || club.social
      }
    } catch {
      // ignore
    }
  }
  return club
}

const APPROVER_EMAILS = (process.env.APPROVER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/* =====================================================
   GET ALL CLUBS (PUBLIC)
===================================================== */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.query.slug) {
      const club = await Club.findOne({ slug: req.query.slug })
      if (!club) {
        return res.json({ clubs: [] })
      }

      const stats = await buildClubStats([club._id])
      return res.json({
        clubs: [
          {
            ...enrichClub(club.toObject()),
            id: club._id,
            stats: stats[club._id] || {
              memberCount: 0,
              rating: 0,
              reviewCount: 0,
            },
          },
        ],
      })
    }

    const statusFilter = req.query.status || "approved"
    const clubs = await Club.find(
      statusFilter === "all" ? {} : { status: statusFilter }
    )
      .sort({ name: 1 })
      .lean()

    const stats = await buildClubStats(clubs.map((c) => c._id))

    res.json({
      clubs: clubs.map((club) => ({
        ...enrichClub(club),
        id: club._id,
        stats: {
          memberCount: stats[club._id]?.memberCount || 0,
          rating: stats[club._id]?.rating || 0,
          reviewCount: stats[club._id]?.reviewCount || 0,
        },
      })),
    })
  })
)

/* =====================================================
   GET CLUB BY ID OR SLUG (PUBLIC)
===================================================== */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    let club = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      club = await Club.findById(id)
    }

    if (!club) {
      club = await Club.findOne({ slug: id })
    }

    if (!club) {
      return res.status(404).json({ message: "Club not found." })
    }

    const clubId = club._id.toString()
    const events = (await Event.find({ clubId }).lean()).map((e) => ({
      ...e,
      id: e._id,
    }))
    const announcements = (await Announcement.find({ clubId }).lean()).map((a) => ({
      ...a,
      id: a._id,
    }))
    const reviews = (await Review.find({ clubId }).lean()).map((r) => ({
      ...r,
      id: r._id,
    }))
    const stats = await buildClubStats([club._id])

    res.json({
      club: {
        ...enrichClub(club.toObject()),
        id: club._id,
        stats: stats[club._id] || {
          memberCount: 0,
          rating: 0,
          reviewCount: 0,
        },
      },
      events,
      announcements,
      reviews,
    })
  })
)

/* =====================================================
   CREATE CLUB (AUTH REQUIRED)
===================================================== */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, description, category, image, slug } = req.body

    if (!name || !description || !category) {
      return res.status(400).json({ message: "Missing required fields." })
    }

    const safeSlug = slug || String(name).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
    const createdBy = req.user.id

    const existingClub = await Club.findOne({
      $or: [{ slug: safeSlug }, { name }],
    })

    if (existingClub) {
      if (existingClub.status === "rejected") {
        existingClub.name = name
        existingClub.slug = safeSlug
        existingClub.description = description
        existingClub.category = category
        if (image !== undefined) existingClub.image = image
        existingClub.createdBy = createdBy
        existingClub.status = "pending"

        await existingClub.save()
        return res.status(200).json({ club: existingClub })
      }

      return res.status(409).json({
        message:
          existingClub.status === "pending"
            ? "This club request is already pending approval."
            : "This club already exists.",
      })
    }

    try {
      const club = await Club.create({
        name,
        slug: safeSlug,
        description,
        category,
        image,
        createdBy,
        status: "pending",
      })

      return res.status(201).json({ club })
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({
          message: "A club with the same name/slug already exists.",
        })
      }
      throw err
    }
  })
)

/* =====================================================
   APPROVE / REJECT / UPDATE CLUB (AUTH REQUIRED)
===================================================== */
router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, approverEmail, ...rest } = req.body

    // Approval / rejection — requires page admin
    if (status === "approved" || status === "rejected") {
      const actor = await User.findById(req.user.id)
      if (!actor) return res.status(401).json({ message: "Invalid user." })

      const isPageAdmin = actor.role === "pageAdmin"
      if (!isPageAdmin) {
        return res.status(403).json({ message: "Only page admins can approve/reject clubs." })
      }

      if (APPROVER_EMAILS.length > 0 && !APPROVER_EMAILS.includes(actor.email.toLowerCase())) {
        return res.status(403).json({ message: "You are not authorized to approve clubs." })
      }
    }

    // Field whitelisting for club updates
    const allowedFields = ["name", "description", "category", "image", "status", "shortDescription", "fullDescription", "email", "meetingTimes", "social", "membershipType"]
    const updateDoc = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateDoc[field] = req.body[field]
      }
    }
    if (status) updateDoc.status = status

    const club = await Club.findByIdAndUpdate(req.params.id, updateDoc, {
      new: true,
      runValidators: true,
    })

    if (!club) {
      return res.status(404).json({ message: "Club not found." })
    }

    // If approved, promote creator to club admin and create their membership record
    if (status === "approved" && club.createdBy) {
      await User.findByIdAndUpdate(club.createdBy, {
        role: "clubAdmin",
      })
      await Membership.findOneAndUpdate(
        { userId: club.createdBy, clubId: club._id },
        {
          role: "admin",
          status: "joined",
          userName: actor.name,
          userEmail: actor.email
        },
        { upsert: true }
      )
    }

    res.json({ club })
  })
)

/* =====================================================
   DELETE CLUB (PAGE ADMIN ONLY)
===================================================== */
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const actor = await User.findById(req.user.id)
    if (!actor) {
      return res.status(401).json({ message: "Invalid user." })
    }

    const isPageAdmin = actor.role === "pageAdmin"
    if (!isPageAdmin) {
      return res.status(403).json({ message: "Only page admins can delete clubs." })
    }

    const isHexObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && String(req.params.id).length === 24

    let club = null

    // 1. Try standard Mongoose lookups
    if (isHexObjectId) {
      club = await Club.findById(req.params.id)
    } else {
      club = await Club.findOne({ slug: req.params.id })
    }

    // 2. If not found, it might be a manually inserted club with a literal string _id (e.g. "1")
    if (!club && !isHexObjectId) {
      club = await mongoose.connection.collection("clubs").findOne({ _id: req.params.id })
    }

    if (!club) {
      return res.status(404).json({ message: "Club not found." })
    }

    const clubId = club._id // Could be ObjectId object or a literal string
    const stringClubId = clubId.toString()

    // 3. Delete the club using the raw driver to avoid schema casting issues
    await mongoose.connection.collection("clubs").deleteOne({ _id: clubId })

    // 4. Only attempt to clean up related collections if clubId is a valid Hex ObjectId.
    // Otherwise, Mongoose will throw a CastError looking for it across relational tables.
    if (mongoose.Types.ObjectId.isValid(stringClubId) && stringClubId.length === 24) {
      const eventIds = (await Event.find({ clubId }).select("_id").lean()).map((e) => e._id.toString())

      await Promise.all([
        Membership.deleteMany({ clubId }),
        Announcement.deleteMany({ clubId }),
        Review.deleteMany({ clubId }),
        RSVP.deleteMany({ clubId }),
        eventIds.length > 0 ? RSVP.deleteMany({ eventId: { $in: eventIds } }) : Promise.resolve(),
        Event.deleteMany({ clubId }),
      ])
    }


    res.json({ message: "Club deleted successfully." })
  })
)

export default router
