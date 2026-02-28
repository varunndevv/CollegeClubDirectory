"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { InteractiveGlassPanel } from "@/components/ui/interactive-glass-panel"
import { Star, Users, Calendar, MapPin, Mail, Globe, Twitter, Instagram } from "lucide-react"
import { getClubDetail } from "@/lib/data-utils"

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 * @param {Object} [props.club]
 */
export function ClubModal({ open, onOpenChange, club }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!club?.slug && !club?.id && !club?._id) {
      setDetail(null)
      return
    }
    let mounted = true
    setLoading(true)
    const clubIdentifier = club.slug || club.id || club._id
    getClubDetail(club.slug || club.id || club._id)
      .then((data) => {
        if (mounted) setDetail(data)
      })
      .catch(() => {
        if (mounted) setDetail(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [club?.slug, club?.id, club?._id])

  const stats = detail?.stats || club?.stats || {}
  const memberCount = stats.memberCount || 0
  const rating = stats.rating || 0
  const reviewCount = stats.reviewCount || 0
  const events = detail?.events?.length ? detail.events : club?.events || []

  if (!club) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background/60 backdrop-blur-3xl border-primary/20 shadow-[0_0_80px_-15px_rgba(159,220,200,0.25)] sm:rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-primary/10 to-transparent">
          <DialogTitle className="text-3xl font-bold tracking-tight text-balance">{club.name || 'Unnamed Club'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 p-8 pt-2 overflow-y-auto max-h-[85vh]">
          {loading && <p className="text-sm text-muted-foreground">Loading club details...</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 text-sm">{club.category || 'Uncategorized'}</Badge>
            <Badge className="px-3 py-1 text-sm">{club.membershipType || 'Open'}</Badge>
            {rating > 0 && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                {rating} <span className="text-muted-foreground opacity-70">({reviewCount})</span>
              </Badge>
            )}
            <span className="text-sm font-medium text-primary/90 flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Users className="h-4 w-4" />
              {memberCount} members
            </span>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">{club.fullDescription || club.shortDescription || 'No description available'}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <InteractiveGlassPanel interactive={false} className="p-5 border-none">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Meeting Times
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{club.meetingTimes || 'Not specified'}</p>
            </InteractiveGlassPanel>

            <InteractiveGlassPanel interactive={false} className="p-5 border-none">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Contact
              </h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" href={`mailto:${club.email || 'contact@example.com'}`}>
                    <Mail className="w-3.5 h-3.5" />
                    {club.email || 'No email available'}
                  </a>
                </li>
                {club.social?.website && (
                  <li>
                    <a
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      href={club.social.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  </li>
                )}
                {club.social?.twitter && (
                  <li>
                    <a
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      href={club.social.twitter}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      Twitter
                    </a>
                  </li>
                )}
                {club.social?.instagram && (
                  <li>
                    <a
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      href={club.social.instagram}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </InteractiveGlassPanel>
          </div>

          {events.length > 0 ? (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Upcoming Events
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {events.map((e, i) => {
                  const eventId = e.id || `${e.title}-${e.date}`
                  return (
                    <InteractiveGlassPanel key={eventId} className="p-4 border-none group">
                      <div className="flex-1">
                        <span className="font-semibold text-foreground block mb-1 group-hover:text-primary transition-colors">{e.title}</span>
                        {e.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 my-2">{e.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5 bg-primary/10 text-primary/90 px-2 py-1 rounded-md">
                            <Calendar className="h-3.5 w-3.5" />
                            {e.date} {e.time && `at ${e.time}`}
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                            <MapPin className="h-3.5 w-3.5" />
                            {e.location}
                          </span>
                        </div>
                      </div>
                    </InteractiveGlassPanel>
                  )
                })}
              </div>
            </div>
          ) : null}

          {club.images?.length ? (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {club.images.map((src, i) => (
                  <img
                    key={i}
                    src={src || "/placeholder.svg"}
                    alt={`Gallery image ${i + 1} for ${club.name}`}
                    className="h-24 w-full rounded-md border object-cover"
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
