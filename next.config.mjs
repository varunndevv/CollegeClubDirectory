/**
 * Next.js rewrites proxy /api/* requests to the Express backend.
 * This enables same-origin API calls from the browser, eliminating CORS.
 *
 * In dev:  browser → localhost:3000/api/clubs → rewrite → localhost:4000/api/clubs
 * In prod: Express serves both API and Next.js on the same port (no rewrite needed).
 */
const API_SERVER_URL = process.env.API_SERVER_URL || "http://localhost:4000"

if (!process.env.API_SERVER_URL) {
  console.warn(
    "\n⚠️  WARNING: API_SERVER_URL is not set! Falling back to http://localhost:4000.\n" +
    "   This will cause a browser privacy prompt for ALL users in production.\n" +
    "   Set API_SERVER_URL in your environment variables (e.g. on Render).\n"
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_SERVER_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig