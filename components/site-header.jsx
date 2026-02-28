"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, User, BookOpen } from "lucide-react"
import { InteractiveButton } from "@/components/ui/interactive-button"

export function SiteHeader() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const stored = localStorage.getItem("currentUser")
        let parsedUser = stored ? JSON.parse(stored) : null

        // Fetch fresh user to sync external DB changes
        if (parsedUser) {
          try {
            const freshUserRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"}/users/id/${parsedUser.id || parsedUser._id}`)
            if (freshUserRes.ok) {
              const json = await freshUserRes.json()
              if (json.user) {
                parsedUser = json.user
                localStorage.setItem("currentUser", JSON.stringify(parsedUser))
              }
            }
          } catch (e) {
            console.error("Failed to sync auth in header")
          }
        }
        setUser(parsedUser)
      } catch {
        setUser(null)
      }
    }

    checkUser()

    const handleStorage = () => checkUser()
    const handleAuth = () => checkUser()

    window.addEventListener("storage", handleStorage)
    window.addEventListener("auth-change", handleAuth)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("auth-change", handleAuth)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // ignore
    }
    localStorage.removeItem("currentUser")
    setUser(null)
    window.dispatchEvent(new Event("auth-change"))
    router.push("/")
  }

  const isActive = (path) => pathname === path

  const navLinks = [
    { href: "/clubs", label: "Clubs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const userLinks = user
    ? [
      { href: "/create-club", label: "Create Club" },
      ...(user.role === "pageAdmin" || user.role === "admin"
        ? [{ href: "/admin/dashboard", label: "Dashboard" }]
        : []),
      ...(user.role === "clubAdmin"
        ? [{ href: "/club-admin", label: "My Club" }]
        : []),
      { href: "/profile", label: "Profile" },
    ]
    : []

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/60 backdrop-blur-2xl border-b border-primary/10 shadow-lg shadow-black/20"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_rgba(159,220,200,0.2)] transition-all duration-300">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight hidden sm:block">
            ClubDirectory
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {userLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <InteractiveButton
              variant="ghost"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </InteractiveButton>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <InteractiveButton
                  variant="solid"
                  className="px-4 py-2 rounded-lg text-sm"
                >
                  Sign Up
                </InteractiveButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-background/70 backdrop-blur-2xl border-t border-primary/10">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {userLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border/50 mt-2 pt-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center mt-1"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
