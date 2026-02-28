import "./env.js"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"

import fs from "fs"
import path from "path"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"

import authRoutes from "./routes/auth.js"
import clubsRoutes from "./routes/clubs.js"
import membershipsRoutes from "./routes/memberships.js"
import eventsRoutes from "./routes/events.js"
import rsvpsRoutes from "./routes/rsvps.js"
import announcementsRoutes from "./routes/announcements.js"
import reviewsRoutes from "./routes/reviews.js"

const app = express()

const dev = process.env.NODE_ENV !== "production"

const nextRootCandidates = [
  process.cwd(),
  path.resolve(process.cwd(), ".."),
]

const nextRoot = nextRootCandidates.find((dir) => fs.existsSync(path.join(dir, ".next")))

let nextApp = null
let nextHandler = null

/* =====================
   SECURITY & OPTIMIZATION
===================== */
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // Disable strict CSP to allow Next.js inline hydration scripts
}))
app.use(compression())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later." }
})
app.use("/api", apiLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Max 10 attempts per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." }
})

/* =====================
   BODY PARSERS
===================== */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

/* =====================
   CORS
===================== */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : null

const corsOptions = {
  origin: allowedOrigins
    ? (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    }
    : true, // Allow all in dev when ALLOWED_ORIGINS is not set
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-approver-email",
    "x-user-id",
  ],
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

/* =====================
   HEALTH CHECK
===================== */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
  })
})

/* =====================
   ROUTES
===================== */
console.log("🗄️ Running with MongoDB")
app.use("/api/users/login", authLimiter)
app.use("/api/users/register", authLimiter)
app.use("/api/users/forgot-password", authLimiter)
app.use("/api/users/reset-password", authLimiter)

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
// In production, Express serves the Next.js app too.
// In dev, `dev:full` runs `next dev` separately, so skip integration here.
if (!dev && nextRoot) {
  const { default: next } = await import("next")
  nextApp = next({ dev: false, dir: nextRoot })
  nextHandler = nextApp.getRequestHandler()
  await nextApp.prepare()
  app.all("*", (req, res) => nextHandler(req, res))
}

/* =====================
   ERROR HANDLER (JSON ONLY)
===================== */
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    console.error(`[CastError Debug] PATH: ${err.path}, MODEL: ${err.model?.modelName}, VALUE: ${err.value}`);
    console.error(err.stack);
    return res.status(400).json({
      message: "Invalid ID format provided.",
    })
  }

  console.error("[Server Error]", err)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  })
})

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err)
    process.exit(1)
  })
