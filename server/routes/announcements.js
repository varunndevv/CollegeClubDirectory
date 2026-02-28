import express from "express"
import Announcement from "../models/Announcement.js"
import asyncHandler from "../utils/asyncHandler.js"
import { requireAuth } from "../utils/authMiddleware.js"

const router = express.Router()

const ALLOWED_ANNOUNCEMENT_FIELDS = ["title", "content", "priority"]

router.get(
  "/club/:clubId",
  asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({ clubId: req.params.clubId }).sort({ createdAt: -1 })
    res.json({ announcements })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { clubId, title, content, priority = "medium" } = req.body
    if (!clubId || !title || !content) {
      return res.status(400).json({ message: "Missing required announcement fields." })
    }
    const announcement = await Announcement.create({
      clubId,
      title,
      content,
      priority,
      createdBy: req.user.id,
    })
    res.status(201).json({ announcement })
  })
)

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = {}
    for (const field of ALLOWED_ANNOUNCEMENT_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." })
    }
    res.json({ announcement })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." })
    }
    res.json({ message: "Announcement deleted successfully." })
  })
)

export default router
