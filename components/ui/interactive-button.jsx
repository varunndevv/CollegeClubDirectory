"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const InteractiveButton = React.forwardRef(({ className, variant = "cyber", children, ...props }, ref) => {
  const buttonRef = React.useRef(null)
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  let baseClass = ""
  let glowColor = "rgba(159, 220, 200, 0.4)" // primary cyber green

  if (variant === "cyber") {
    baseClass = "btn-cyber"
  } else if (variant === "solid") {
    baseClass = "btn-cyber-solid"
    glowColor = "rgba(255, 255, 255, 0.4)"
  } else if (variant === "destructive") {
    glowColor = "rgba(229, 77, 77, 0.4)"
  } else if (variant === "ghost" || variant === "outline") {
    glowColor = "rgba(159, 220, 200, 0.2)"
  }

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(baseClass, "relative overflow-hidden group", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* We use inline styles for the tracking glow so it moves with the cursor */}
      {isHovered && (
        <div
          className={cn(
            "pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100",
            variant !== "solid" ? "rounded-xl" : ""
          )}
          style={{
            background: `radial-gradient(${variant === "solid" ? "100px" : "120px"} circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
            zIndex: variant === "solid" ? 0 : -1,
            borderRadius: "inherit"
          }}
        />
      )}

      {/* The actual content of the button */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
})
InteractiveButton.displayName = "InteractiveButton"

export { InteractiveButton }
