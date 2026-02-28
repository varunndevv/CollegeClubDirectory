import express from "express"
import Membership from "../models/Membership.js"
import User from "../models/User.js"
import asyncHandler from "../utils/asyncHandler.js"
import { requireAuth } from "../utils/authMiddleware.js"
import { hasAssignedClub } from "../utils/hasAssignedClub.js"

const router = express.Router()

const ALLOWED_MEMBERSHIP_FIELDS = ["status", "role"]

/* =========================
   USER ROUTES
========================= */

// Get memberships by user
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const memberships = await Membership.find({ userId: req.params.userId })
      .populate("clubId", "name slug")
      .sort({ createdAt: -1 })
    res.json({ memberships })
  })
)

// Update membership (used by club-admin panel)
router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [actor, current] = await Promise.all([
      User.findById(req.user.id),
      Membership.findById(req.params.id),
    ])

    if (!actor) {
      return res.status(401).json({ message: "Invalid user context." })
    }

    if (!current) {
      return res.status(404).json({ message: "Membership not found." })
    }

    const isPageAdmin = actor.role === "pageAdmin"
    let isClubAdmin = false

    if (!isPageAdmin) {
      const actorMembership = await Membership.findOne({
        userId: actor.id,
        clubId: current.clubId,
        role: { $in: ["admin", "officer"] },
        status: "joined"
      })
      isClubAdmin = !!actorMembership
    }

    const isSelf = String(actor.id) === String(current.userId)

    if (!isPageAdmin && !isClubAdmin && !isSelf) {
      return res.status(403).json({ message: "Not authorized." })
    }

    // Field whitelisting
    const updates = {}
    for (const field of ALLOWED_MEMBERSHIP_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    const membership = await Membership.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." })
    }

    res.json({ membership })
  })
)

// Get memberships by club
router.get(
  "/club/:clubId",
  asyncHandler(async (req, res) => {
    const memberships = await Membership.find({ clubId: req.params.clubId })
      .sort({ createdAt: -1 })
    res.json({ memberships })
  })
)

// Create membership (Join club)
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { clubId } = req.body
    const userId = req.user.id

    if (!clubId) {
      return res.status(400).json({ message: "Missing required clubId." })
    }

    const desiredStatus = "pending"

    const existingMembership = await Membership.findOne({ userId, clubId })
    if (existingMembership) {
      if (existingMembership.status === "rejected") {
        existingMembership.status = desiredStatus
        existingMembership.userName = req.body.userName || existingMembership.userName
        existingMembership.userEmail = req.body.userEmail || existingMembership.userEmail
        existingMembership.role = req.body.role || existingMembership.role || "member"
        existingMembership.joinedAt = req.body.joinedAt || new Date().toISOString()
        await existingMembership.save()
        return res.status(200).json({ membership: existingMembership })
      }

      return res.status(409).json({ message: "User is already a member or has a pending request." })
    }

    const membership = await Membership.create({
      userId,
      clubId,
      userName: req.body.userName || "",
      userEmail: req.body.userEmail || "",
      role: req.body.role || "member",
      status: desiredStatus,
    })

    res.status(201).json({ membership })
  })
)

/* =========================
   ADMIN ROUTES
========================= */

// Admin – View pending join requests
router.get(
  "/admin",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status = "pending" } = req.query

    const memberships = await Membership.find({ status })
      .populate("userId", "name email")
      .populate("clubId", "name")

    res.json({ memberships })
  })
)

// Admin – Approve membership
router.patch(
  "/admin/:id/approve",
  requireAuth,
  asyncHandler(async (req, res) => {
    const membership = await Membership.findById(req.params.id)

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." })
    }

    membership.status = "joined"
    await membership.save()

    res.json({
      membership,
      message: "Membership approved."
    })
  })
)

// Admin – Reject membership
router.patch(
  "/admin/:id/reject",
  requireAuth,
  asyncHandler(async (req, res) => {
    const membership = await Membership.findById(req.params.id)

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." })
    }

    membership.status = "rejected"
    await membership.save()

    res.json({
      message: "Membership rejected."
    })
  })
)

// Delete membership (leave club)
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [actor, existing] = await Promise.all([
      User.findById(req.user.id),
      Membership.findById(req.params.id),
    ])

    if (!actor) {
      return res.status(401).json({ message: "Invalid user context." })
    }

    if (!existing) {
      return res.status(404).json({ message: "Membership not found." })
    }

    const isPageAdmin = actor.role === "pageAdmin"
    let isClubAdmin = false

    if (!isPageAdmin) {
      const actorMembership = await Membership.findOne({
        userId: actor.id,
        clubId: existing.clubId,
        role: { $in: ["admin", "officer"] },
        status: "joined"
      })
      isClubAdmin = !!actorMembership
    }

    const isSelf = String(actor.id) === String(existing.userId)

    if (!isPageAdmin && !isClubAdmin && !isSelf) {
      return res.status(403).json({ message: "Not authorized." })
    }

    const membership = await Membership.findByIdAndDelete(req.params.id)
    if (!membership) {
      return res.status(404).json({ message: "Membership not found." })
    }
    res.json({ message: "Membership deleted successfully." })
  })
)

export default router
