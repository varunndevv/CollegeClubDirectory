"use client"

import { Users, Calendar, Lightbulb, Trophy, Palette, Newspaper, Rocket, BookOpen } from "lucide-react"

const categories = [
  { name: "Technical", icon: Lightbulb, description: "Coding, robotics, and tech innovation" },
  { name: "Cultural", icon: Palette, description: "Music, dance, drama, and literary arts" },
  { name: "Sports", icon: Trophy, description: "Athletics, team sports, and fitness" },
  { name: "Social", icon: Users, description: "Community service and social impact" },
  { name: "Media", icon: Newspaper, description: "Journalism, photography, and design" },
  { name: "Entrepreneurship", icon: Rocket, description: "Startups, business, and innovation" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground">About</h1>
          <p className="mt-3 text-muted-foreground text-lg leading-relaxed max-w-2xl">
            The College Club Directory is a centralized platform for students of BMS College of Engineering to discover, join, and manage campus clubs and organizations.
          </p>
        </div>

        {/* About BMSCE */}
        <section className="mb-16 animate-fade-in-up">
          <div className="p-8 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">BMS College of Engineering</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 1946, BMSCE is one of India&apos;s premier engineering institutions located in Bengaluru. With over 4,000 students and 50+ active clubs, the campus pulses with creativity, innovation, and community spirit. Our clubs span technical, cultural, sports, social, and entrepreneurial domains — offering something for every student.
            </p>
          </div>
        </section>

        {/* Club Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Club Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className={`p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift animate-fade-in-up stagger-${i + 1}`}
              >
                <cat.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Create an Account", desc: "Sign up with your @bmsce.ac.in email and verify via OTP." },
              { step: "2", title: "Browse & Discover", desc: "Explore clubs by category, rating, or search. Read reviews." },
              { step: "3", title: "Join a Club", desc: "Request to join — club admins will review and approve." },
              { step: "4", title: "Stay Connected", desc: "Get announcements, RSVP to events, and write reviews." },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
