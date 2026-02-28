"use client"

import Link from "next/link"
import { useState, useEffect, Suspense, lazy } from "react"
import { ArrowRight, Users, Calendar, Star, Sparkles, Zap, Search, MessagesSquare } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"

const GLSLHills = lazy(() =>
  import("@/components/ui/glsl-hills").then((mod) => ({ default: mod.GLSLHills }))
)

const stats = [
  { label: "Active Clubs", value: "50+", icon: Users },
  { label: "Events Monthly", value: "120+", icon: Calendar },
  { label: "Student Members", value: "3,000+", icon: Star },
]

const features = [
  {
    title: "Discover Clubs",
    description: "Browse and filter clubs by category, rating, and activity level. Find your tribe in seconds.",
    icon: Search,
    gradient: "from-teal-400/20 to-cyan-400/10",
  },
  {
    title: "Join Communities",
    description: "Request membership with one click and connect with like-minded peers instantly.",
    icon: Users,
    gradient: "from-violet-400/20 to-purple-400/10",
  },
  {
    title: "Stay Updated",
    description: "Real-time announcements, events calendar, and RSVP — never miss a beat.",
    icon: Zap,
    gradient: "from-amber-400/20 to-orange-400/10",
  },
  {
    title: "Rate & Review",
    description: "Share your experience, rate clubs, and help the community make better choices.",
    icon: MessagesSquare,
    gradient: "from-pink-400/20 to-rose-400/10",
  },
]

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* GLSL Hills Background for hero */}
        <div className="absolute inset-0 z-[1]">
          <Suspense fallback={<div className="w-full h-full" />}>
            <GLSLHills />
          </Suspense>
          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <div
            className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card-static text-primary text-sm font-medium mb-10 animate-border-glow">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wide">BMS College of Engineering</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.05]">
              Your Gateway to
              <br />
              <span className="bg-gradient-to-r from-primary via-emerald-300 to-primary bg-clip-text text-transparent animate-text-glow bg-[length:200%_auto] animate-gradient">
                Campus Life
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover clubs, join communities, attend events, and make the most
              of your college experience — all in one place.
            </p>

            {/* CTA buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/clubs">
                <InteractiveButton variant="solid" className="px-10 py-4 text-base rounded-xl">
                  Explore Clubs
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </InteractiveButton>
              </Link>
              <Link href="/sign-up">
                <InteractiveButton variant="cyber" className="px-10 py-4 text-base rounded-xl">
                  Create Account
                </InteractiveButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-40" : "opacity-0"
            }`}
        >
          <div className="w-7 h-11 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </section>

      {/* ====== STATS SECTION ====== */}
      <section className="relative py-24 px-6">
        {/* Divider line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`glass-card text-center p-10 rounded-2xl animate-fade-in-up stagger-${i + 1} animate-glow-pulse`}
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <stat.icon className="w-7 h-7 text-primary mx-auto mb-5 animate-pulse-soft" />
              <div className="text-5xl font-bold text-foreground mb-3 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-[0.15em] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== FEATURES SECTION ====== */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">
              A complete platform for managing your campus club experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group glass-card p-10 rounded-2xl animate-fade-in-up stagger-${i + 1}`}
              >
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA SECTION ====== */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-16 rounded-3xl animate-glow-pulse relative overflow-hidden">
            {/* Accent gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />

            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-5 tracking-tight">
                Ready to Get Involved?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                Join thousands of BMSCE students who are already part of thriving campus communities.
              </p>
              <Link href="/sign-up">
                <InteractiveButton variant="solid" className="px-10 py-4 text-base rounded-xl mt-8">
                  Get Started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </InteractiveButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
