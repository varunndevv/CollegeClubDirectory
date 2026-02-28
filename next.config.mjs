/**
 * Next.js rewrites proxy /api/* requests to the Express backend.
 * This enables same-origin API calls from the browser, eliminating CORS.
 *
 * In dev:  browser → localhost:3000/api/clubs → rewrite → localhost:4000/api/clubs
 * In prod: Express serves both API and Next.js on the same port (no rewrite needed).
 */
const API_SERVER_URL = process.env.API_SERVER_URL || "http://localhost:4000"

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