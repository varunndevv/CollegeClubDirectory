import mongoose from "mongoose"

let isConnected = false

export default async function connectDB() {
  if (isConnected) {
    return mongoose.connection
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.")
  }

  try {
    const dbName = process.env.MONGODB_DB || "college_club_directory"
    await mongoose.connect(uri, { dbName })
    isConnected = true
    console.log(`[DB] Connected to MongoDB database "${dbName}"`)
    return mongoose.connection
  } catch (error) {
    console.error("[DB] MongoDB connection error:", error)
    throw error
  }
}

