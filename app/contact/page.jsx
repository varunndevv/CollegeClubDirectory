"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, MapPin, Shield, HelpCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

const contacts = [
  {
    icon: Mail,
    title: "General Inquiries",
    description: "For general questions about the platform.",
    link: "mailto:clubdirectory@bmsce.ac.in",
    linkText: "clubdirectory@bmsce.ac.in",
  },
  {
    icon: Shield,
    title: "Page Administrator",
    description: "Club approvals, account issues, or technical support.",
    link: "mailto:admin@bmsce.ac.in",
    linkText: "admin@bmsce.ac.in",
  },
  {
    icon: HelpCircle,
    title: "Technical Support",
    description: "Report bugs or request new features.",
    link: "mailto:support@bmsce.ac.in",
    linkText: "support@bmsce.ac.in",
  },
]

const faqs = [
  {
    q: "How do I create a new club?",
    a: "Sign up, then navigate to \"Create Club\" in the header. Fill out the form and submit for admin approval.",
  },
  {
    q: "Who can approve club requests?",
    a: "Only designated page administrators with admin privileges can approve or reject club requests.",
  },
  {
    q: "Can I join multiple clubs?",
    a: "Yes! Students can join as many clubs as they want.",
  },
  {
    q: "How do I contact a specific club?",
    a: "Visit the club's detail page to find their contact email and social media links.",
  },
]

export default function ContactPage() {
  const [user, setUser] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    try {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const quickActions = user
    ? [
      { href: "/create-club", label: "Create Club" },
      { href: "/clubs", label: "Browse Clubs" },
      { href: "/profile", label: "Profile" },
    ]
    : [
      { href: "/clubs", label: "Browse Clubs" },
      { href: "/sign-up", label: "Sign Up" },
      { href: "/sign-in", label: "Sign In" },
    ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground">Contact</h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Get in touch for support, questions, or feedback about the Club Directory.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {contacts.map((c, i) => (
            <div
              key={c.title}
              className={`p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift animate-fade-in-up stagger-${i + 1}`}
            >
              <c.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
              <a href={c.link} className="text-sm text-primary font-medium hover:underline">
                {c.linkText}
              </a>
            </div>
          ))}
        </div>

        {/* College Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 mb-12 animate-fade-in-up">
          <h2 className="text-xl font-semibold text-foreground mb-4">BMS College of Engineering</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">Address</div>
                <div className="text-sm text-muted-foreground">
                  P.O. Box No. 1908, Bull Temple Road,<br />
                  Basavanagudi, Bangalore - 560 019
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">Phone</div>
                <div className="text-sm text-muted-foreground">+91-80-26622130-35</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">Email</div>
                <a href="mailto:info@bmsce.ac.in" className="text-sm text-primary hover:underline">
                  info@bmsce.ac.in
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">Website</div>
                <a href="https://www.bmsce.ac.in" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  www.bmsce.ac.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-primary/20 rounded-2xl p-8 mb-12 animate-fade-in-up">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isClient && quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-foreground text-center hover:bg-muted hover:border-primary/20 transition-colors"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-semibold text-foreground mb-6">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
