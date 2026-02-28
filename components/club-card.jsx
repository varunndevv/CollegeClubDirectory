"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"
import { Star } from "lucide-react"

/**
 * @param {Object} props
 * @param {Object} props.club
 * @param {Function} [props.onOpen]
 */
export function ClubCard({ club, onOpen }) {
  const memberCount = club.stats?.memberCount || 0
  const rating = club.stats?.rating || 0

  return (
    <InteractiveGlassPanel className="p-0 border-none group cursor-pointer transition-all duration-300">
      <div className="flex flex-row items-center gap-3 p-6 pb-2">
        <img
          src={club.logoUrl || "/placeholder.svg"}
          alt={`${club.name} logo`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg border-2 object-cover"
          style={{ borderColor: '#9fdcc8' }}
        />
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground leading-none tracking-tight">{club.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="transition-all duration-300 hover:scale-105">
              {club.category}
            </Badge>
            <Badge className="transition-all duration-300 hover:scale-105">
              {club.membershipType}
            </Badge>
            {rating > 0 && (
              <Badge variant="outline" className="gap-1 transition-all duration-300 hover:scale-105">
                <Star className="h-3 w-3 fill-current" />
                {rating}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 space-y-3 mt-4">
        <p className="text-sm text-muted-foreground">{club.shortDescription}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{memberCount} members</span>
          <div className="flex items-center gap-2">
            <button
              className="text-sm font-medium text-primary transition-all duration-300 hover:underline hover:scale-105 active:scale-95"
              onClick={() => onOpen?.(club)}
              aria-label={`Quick view ${club.name}`}
            >
              Quick view
            </button>
            <span className="text-primary">•</span>
            <Link
              className="text-sm font-medium text-primary transition-all duration-300 hover:underline hover:scale-105 active:scale-95"
              href={`/clubs/${club.slug}`}
              aria-label={`View details page for ${club.name}`}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </InteractiveGlassPanel>
  )
}
