import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export const InteractiveGlassPanel = React.forwardRef(({ className, children, interactive = true, ...props }, ref) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const panelRef = useRef(null)

  // Track cursor position for the spotlight effect
  const handleMouseMove = (e) => {
    if (!interactive) return
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  return (
    <div
      ref={(node) => {
        panelRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden transition-all duration-300 rounded-xl",
        "border border-border/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        "bg-gradient-to-br from-[rgba(30,30,45,0.7)] to-[rgba(18,18,30,0.9)]",
        "backdrop-blur-[20px] saturate-150",
        interactive && "hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(159,220,200,0.12)] hover:-translate-y-1 hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Glow Layer */}
      {interactive && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(159, 220, 200, 0.08), transparent 80%)`,
            zIndex: 0,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
})

InteractiveGlassPanel.displayName = "InteractiveGlassPanel"
