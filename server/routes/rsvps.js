import express from "express"
import RSVP from "../models/RSVP.js"
import Event from "../models/Event.js"
import asyncHandler from "../utils/asyncHandler.js"
import { requireAuth } from "../utils/authMiddleware.js"

const router = express.Router()

router.get(
  "/event/:eventId",
  asyncHandler(async (req, res) => {
    const rsvps = await RSVP.find({ eventId: req.params.eventId })
    res.json({ rsvps })
  })
)

router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const rsvps = await RSVP.find({ userId: req.params.userId })
    res.json({ rsvps })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { eventId } = req.body
    if (!eventId) {
      return res.status(400).json({ message: "Missing required RSVP fields." })
    }
    const status = req.body.status || "going"

    const rsvp = await RSVP.findOneAndUpdate(
      { userId: req.user.id, eventId },
      { userId: req.user.id, eventId, status },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    // Update rsvpCount on Event
    if (/^[a-f0-9]{24}$/i.test(String(eventId))) {
      const goingCount = await RSVP.countDocuments({ eventId: String(eventId), status: "going" })
      await Event.findByIdAndUpdate(eventId, { rsvpCount: goingCount })
    }

    res.status(201).json({ rsvp })
  })
)

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = {}
    if (req.body.status !== undefined) {
      updates.status = req.body.status
    }
    const rsvp = await RSVP.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!rsvp) return res.status(404).json({ message: "RSVP not found." })
    res.json({ rsvp })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rsvp = await RSVP.findByIdAndDelete(req.params.id)
    if (!rsvp) return res.status(404).json({ message: "RSVP not found." })
    res.json({ message: "RSVP deleted successfully." })
  })
)

export default router
