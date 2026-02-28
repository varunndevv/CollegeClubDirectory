import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./server/config/db.js"

import authRoutes from "./server/routes/auth.js"
import clubsRoutes from "./server/routes/clubs.js"
import membershipsRoutes from "./server/routes/memberships.js"
import eventsRoutes from "./server/routes/events.js"
import rsvpsRoutes from "./server/routes/rsvps.js"
import announcementsRoutes from "./server/routes/announcements.js"
import reviewsRoutes from "./server/routes/reviews.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-approver-email", "x-user-id"],
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use("/api/users", authRoutes)
app.use("/api/clubs", clubsRoutes)
app.use("/api/memberships", membershipsRoutes)
app.use("/api/events", eventsRoutes)
app.use("/api/rsvps", rsvpsRoutes)
app.use("/api/announcements", announcementsRoutes)
app.use("/api/reviews", reviewsRoutes)

app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() })
})

app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  })
})

const PORT = 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} (API ONLY)`)
    })
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err)
    process.exit(1)
  })
