"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const quotes = [
  "Join a community, find your passion.",
  "Be part of something bigger than yourself.",
  "Discover new talents, make lasting friendships.",
  "Your journey to leadership starts here.",
  "Transform ideas into action with like-minded peers.",
]

export function Hero3DContent() {
  const [randomQuote, setRandomQuote] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const contentRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)] || quotes[0])
      setIsClient(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleMouseMove = (e) => {
      if (contentRef.current) {
        try {
          const rect = contentRef.current.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
          setMousePosition({ x, y })
        } catch (error) {
          console.error('Error handling mouse move:', error)
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  if (!isClient) return null

  return (
    <div 
      ref={contentRef}
      className="relative z-20 mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20"
      style={{
        transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div className="space-y-10 text-center">
        {/* Badge with glassmorphism */}
        <div className="inline-block animate-fade-in">
          <span 
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border-2 backdrop-blur-md"
            style={{ 
              backgroundColor: 'rgba(159, 220, 200, 0.2)',
              color: 'var(--foreground)',
              borderColor: 'rgba(159, 220, 200, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span 
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--primary)' }}
            ></span>
            Welcome to Student Life
          </span>
        </div>

        {/* Main Heading with 3D effect */}
        <h1 
          className="text-balance text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground animate-slide-in"
          style={{
            textShadow: `
              0 0 10px rgba(159, 220, 200, 0.3),
              0 0 20px rgba(159, 220, 200, 0.2),
              2px 2px 4px rgba(0, 0, 0, 0.3)
            `,
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          Explore{" "}
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-float"
            style={{
              backgroundSize: '200% auto',
              WebkitTextStroke: '1px rgba(159, 220, 200, 0.3)',
              filter: 'drop-shadow(0 0 8px rgba(159, 220, 200, 0.5))'
            }}
          >
            Student Clubs
          </span>
        </h1>

        {/* Subheading */}
        <p 
          className="text-pretty text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Discover communities of passionate students. Find your tribe, develop skills, and create memories that last
          a lifetime.
        </p>

        {/* Quote Section with glassmorphism */}
        <div 
          className="rounded-3xl p-8 md:p-12 backdrop-blur-md border-2 mx-auto max-w-3xl animate-scale-in"
          style={{ 
            backgroundColor: 'rgba(159, 220, 200, 0.1)',
            borderColor: 'rgba(159, 220, 200, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            animationDelay: '0.3s'
          }}
        >
          <p 
            className="text-xl md:text-2xl font-semibold italic text-foreground"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            "{randomQuote}"
          </p>
        </div>

        {/* CTA Buttons with 3D lift effect */}
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in" 
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/clubs"
            className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
            style={{
              transform: 'translateZ(20px)',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateZ(30px) translateY(-4px) scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(20px) translateY(0) scale(1)'
            }}
          >
            <span className="relative z-10">Start Exploring</span>
            <svg className="ml-2 w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }}
            />
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center justify-center px-8 py-4 border-2 rounded-xl font-semibold border-secondary text-secondary transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(163, 99, 93, 0.1)',
              transform: 'translateZ(20px)',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateZ(30px) translateY(-4px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(163, 99, 93, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(20px) translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span className="relative z-10">Learn More</span>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

