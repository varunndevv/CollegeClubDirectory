"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

/**
 * @param {Object} props
 * @param {string} props.query
 * @param {Function} props.setQuery
 * @param {string} props.category
 * @param {Function} props.setCategory
 * @param {string} props.membership
 * @param {Function} props.setMembership
 * @param {string[]} props.categories
 * @param {string[]} props.memberships
 * @param {string} props.sortBy
 * @param {Function} props.setSortBy
 * @param {string} props.minRating
 * @param {Function} props.setMinRating
 */
export function SearchFilters({
  query,
  setQuery,
  category,
  setCategory,
  membership,
  setMembership,
  categories,
  memberships,
  sortBy = "name",
  setSortBy,
  minRating = "0",
  setMinRating,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const clearFilters = () => {
    setQuery("")
    setCategory("All")
    setMembership("All")
    setSortBy("name")
    setMinRating("0")
  }

  const hasActiveFilters = query || category !== "All" || membership !== "All" || sortBy !== "name" || minRating !== "0"

  return (
    <section 
      aria-label="Search and filters" 
      className="rounded-xl border-2 p-6 shadow-sm bg-card border-primary/20"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Membership</Label>
          <Select value={membership} onValueChange={setMembership}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select membership" />
            </SelectTrigger>
            <SelectContent>
              {memberships.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="text-sm">
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t pt-4">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Min rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </section>
  )
}
