"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api-client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Social",
  "Academic",
  "Arts",
  "Media",
  "Entrepreneurship",
]

export default function CreateClubPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const data = await apiRequest("/clubs", {
        method: "POST",
        body: form,
      })

      if (data.club) {
        setSuccess("Club submitted for approval! You'll be notified once it's reviewed.")
        setTimeout(() => router.push("/clubs"), 2000)
      }
    } catch (err) {
      setError(err.message || "Failed to create club.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <div className="animate-fade-in-up">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Clubs
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Create a Club</h1>
          <p className="text-muted-foreground mb-8">
            Submit a new club proposal for admin review.
          </p>

          <div className="bg-card border border-border/50 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Club Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. Robotics Club"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:border-primary/50"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Tell us about your club, its mission, and activities..."
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Image URL (optional)</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  placeholder="https://example.com/club-logo.png"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit for Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
