"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"
import { Star } from "lucide-react"

/**
 * @param {Object} props
 * @param {Object} props.club
 * @param {Function} [props.onOpen]
 */
export function ClubCard3D({ club, onOpen }) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const cardRef = useRef(null)

  const memberCount = club.stats?.memberCount || 0
  const rating = club.stats?.rating || 0

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isHovered) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      setTransform({
        rotateX,
        rotateY,
        scale: 1.05,
      })
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      ref={cardRef}
      className="perspective-1000 animate-fade-in"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <InteractiveGlassPanel
        interactive={false} // We handle our own 3D mouse logic
        className="transition-all duration-300 border-none cursor-pointer relative overflow-hidden group p-0"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale}) translateZ(20px)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
          boxShadow: isHovered
            ? `0 ${20 + transform.rotateX * 2}px ${40 + Math.abs(transform.rotateY) * 2}px rgba(0, 0, 0, 0.4),
               0 0 40px rgba(159, 220, 200, 0.4)`
            : "0 8px 16px rgba(0, 0, 0, 0.2)",
          pointerEvents: "auto",
        }}
      >
        {/* 3D Glow Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at ${transform.rotateY * 10 + 50}% ${transform.rotateX * 10 + 50}%, rgba(159, 220, 200, 0.25), transparent 70%)`,
            transform: `translateZ(-10px)`,
            filter: "blur(20px)",
          }}
        />

        {/* Edge Highlight */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{
            background: `linear-gradient(${135 + transform.rotateY * 2
              }deg, transparent, rgba(159, 220, 200, 0.15) 50%, transparent)`,
            transform: `translateZ(5px)`,
          }}
        />

        {/* Card Content */}
        <div style={{ transform: "translateZ(10px)" }}>
          <div className="flex flex-row items-center gap-3 relative z-10 p-6 pb-2">
            <div
              className="relative"
              style={{
                transform: `translateZ(20px) rotateY(${transform.rotateY * 0.5}deg)`,
              }}
            >
              <img
                src={club.logoUrl || "/placeholder.svg"}
                alt={`${club.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-110"
                style={{
                  borderColor: "var(--primary)",
                  boxShadow: isHovered ? "0 4px 12px rgba(159, 220, 200, 0.4)" : "none",
                }}
              />
            </div>
            <div className="flex-1">
              <h3
                className="text-base font-bold text-foreground transition-all duration-300"
                style={{
                  transform: `translateZ(15px)`,
                  textShadow: isHovered ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "none",
                }}
              >
                {club.name || 'Unnamed Club'}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="transition-all duration-300 hover:scale-110"
                  style={{
                    transform: `translateZ(10px) rotateY(${transform.rotateY * 0.3}deg)`,
                  }}
                >
                  {club.category || 'Uncategorized'}
                </Badge>
                <Badge
                  className="transition-all duration-300 hover:scale-110"
                  style={{
                    transform: `translateZ(10px) rotateY(${transform.rotateY * 0.3}deg)`,
                  }}
                >
                  {club.membershipType || 'Open'}
                </Badge>
                {rating > 0 && (
                  <Badge
                    variant="outline"
                    className="gap-1 transition-all duration-300 hover:scale-110"
                    style={{
                      transform: `translateZ(10px) rotateY(${transform.rotateY * 0.3}deg)`,
                    }}
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {rating}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 pt-0 space-y-3 relative z-10 mt-4" style={{ pointerEvents: 'auto' }}>
            <p
              className="text-sm text-muted-foreground line-clamp-2"
              style={{
                transform: `translateZ(5px)`,
              }}
            >
              {club.shortDescription || club.fullDescription || 'No description available'}
            </p>
            <div
              className="flex items-center justify-between text-xs text-muted-foreground"
              style={{
                transform: `translateZ(8px)`,
              }}
            >
              <span className="font-medium">{memberCount} members</span>
              <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}>
                <button
                  className="text-sm font-medium text-primary transition-all duration-300 hover:underline hover:scale-110 active:scale-95"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onOpen?.(club)
                  }}
                  aria-label={`Quick view ${club.name || 'club'}`}
                  style={{ position: 'relative', zIndex: 100 }}
                >
                  Quick view
                </button>
                <span className="text-primary" style={{ position: 'relative', zIndex: 100 }}>•</span>
                <Link
                  className="text-sm font-medium text-primary transition-all duration-300 hover:underline hover:scale-110 active:scale-95"
                  href={`/clubs/${club.slug || club.id || club._id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  aria-label={`View details page for ${club.name || 'club'}`}
                  style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
          style={{
            background: `linear-gradient(${45 + transform.rotateY * 2
              }deg, transparent 30%, rgba(159, 220, 200, 0.15) 50%, transparent 70%)`,
            transform: `translateZ(30px)`,
          }}
        />
      </InteractiveGlassPanel>
    </div>
  )
}

