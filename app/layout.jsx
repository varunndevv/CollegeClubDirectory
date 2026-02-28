import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import CyberGrid from "@/components/ui/cyber-grid"
import { Suspense } from "react"

export const metadata = {
  title: "BMS College Club Directory",
  description: "Explore student clubs and communities at BMS College of Engineering",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Animated cyberpunk background — renders on every page */}
        <CyberGrid />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <SiteHeader />
          <main className="relative" style={{ zIndex: 1 }}>{children}</main>
          <SiteFooter />
          <ScrollToTop />
        </Suspense>
      </body>
    </html>
  )
}
