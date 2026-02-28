import express from "express"
import Event from "../models/Event.js"
import asyncHandler from "../utils/asyncHandler.js"
import { requireAuth } from "../utils/authMiddleware.js"

const router = express.Router()

const ALLOWED_EVENT_FIELDS = ["title", "description", "date", "time", "location"]

router.get(
  "/club/:clubId",
  asyncHandler(async (req, res) => {
    const events = await Event.find({ clubId: req.params.clubId }).sort({ date: 1 })
    res.json({ events })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { clubId, title, description, date, location } = req.body
    if (!clubId || !title || !date) {
      return res.status(400).json({ message: "Missing required event fields." })
    }
    const event = await Event.create({ clubId, title, description, date, location })
    res.status(201).json({ event })
  })
)

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = {}
    for (const field of ALLOWED_EVENT_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }
    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!event) return res.status(404).json({ message: "Event not found." })
    res.json({ event })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ message: "Event not found." })
    res.json({ message: "Event deleted successfully." })
  })
)

export default router
