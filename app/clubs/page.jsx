"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"
import { Search, Star, Users, X, ArrowRight, Loader2, Eye } from "lucide-react"
import { ClubModal } from "@/components/club-modal"

const CATEGORIES = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Social",
  "Academic",
  "Arts",
  "Media",
  "Entrepreneurship",
]

export default function ClubsPage() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [sortBy, setSortBy] = useState("name")
  const [selectedClub, setSelectedClub] = useState(null)

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await apiRequest("/clubs")
        setClubs(data.clubs || [])
      } catch (err) {
        console.error("Failed to fetch clubs:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClubs()
  }, [])

  const filtered = clubs
    .filter((club) => {
      const matchesSearch =
        !search ||
        club.name?.toLowerCase().includes(search.toLowerCase()) ||
        club.description?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === "All" || club.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "")
      if (sortBy === "rating") return (b.stats?.rating || 0) - (a.stats?.rating || 0)
      if (sortBy === "members") return (b.stats?.memberCount || 0) - (a.stats?.memberCount || 0)
      return 0
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Clubs
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Discover and join student organizations at BMSCE
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card-static p-4 rounded-2xl mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-primary/50 focus:bg-muted/70"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:border-primary/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:border-primary/50"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="members">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {loading ? "Loading..." : `${filtered.length} club${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No clubs found</p>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((club, i) => (
              <div
                key={club.id || club._id}
                className={`group glass-card block p-7 rounded-2xl animate-fade-in-up stagger-${Math.min(i + 1, 6)} relative`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-lg font-semibold text-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_rgba(159,220,200,0.15)] transition-all duration-300">
                    {club.image ? (
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      club.name?.charAt(0)?.toUpperCase() || "C"
                    )}
                  </div>
                  {club.category && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary/80 font-medium border border-primary/10">
                      {club.category}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-1">
                  {club.name}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
                  {club.shortDescription || club.description?.substring(0, 120) || "No description available."}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {club.stats?.memberCount || 0} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {club.stats?.rating ? club.stats.rating.toFixed(1) : "—"}
                  </span>

                  <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedClub(club)
                      }}
                      className="flex items-center gap-1 text-primary hover:text-primary/70 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </button>
                    <Link
                      href={`/clubs/${club.slug || club.id || club._id}`}
                      className="flex items-center gap-1 text-primary hover:text-primary/70 transition-colors"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClubModal
        open={!!selectedClub}
        onOpenChange={(isOpen) => !isOpen && setSelectedClub(null)}
        club={selectedClub}
      />
    </div>
  )
}
