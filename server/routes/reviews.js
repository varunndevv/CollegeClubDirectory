import express from "express"
import Review from "../models/Review.js"
import asyncHandler from "../utils/asyncHandler.js"
import { requireAuth } from "../utils/authMiddleware.js"

const router = express.Router()

const ALLOWED_REVIEW_FIELDS = ["rating", "comment"]

router.get(
  "/club/:clubId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ clubId: req.params.clubId }).sort({ createdAt: -1 })
    res.json({ reviews })
  })
)

router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 })
    res.json({ reviews })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { clubId, rating, comment } = req.body
    if (!clubId || !rating) {
      return res.status(400).json({ message: "Missing required review fields." })
    }
    const review = await Review.create({
      clubId,
      userId: req.user.id,
      userName: req.body.userName || "",
      rating,
      comment,
    })
    res.status(201).json({ review })
  })
)

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = {}
    for (const field of ALLOWED_REVIEW_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!review) return res.status(404).json({ message: "Review not found." })
    res.json({ review })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ message: "Review not found." })
    res.json({ message: "Review deleted successfully." })
  })
)

export default router
