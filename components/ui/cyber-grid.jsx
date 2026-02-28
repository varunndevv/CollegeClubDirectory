"use client"

import { useEffect, useRef } from "react"

/**
 * CyberGrid — Full-screen animated background.
 *
 * Renders a Tron-style 3D perspective grid scrolling forward
 * with floating luminous particles drifting above it.
 *
 * Mounted once in layout.jsx — covers all pages.
 */
export default function CyberGrid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let raf
    let w, h

    // ─── Palette ───
    const TEAL = [159, 220, 200]          // #9fdcc8
    const VIOLET = [124, 58, 237]         // #7c3aed
    const BG = [10, 10, 18]              // #0a0a12

    // ─── Grid config ───
    const GRID_LINES = 30                 // horizontal lines receding
    const GRID_COLS = 24                  // vertical columns
    const GRID_SPEED = 0.3                // scroll speed
    let gridOffset = 0

    // ─── Particles ───
    const PARTICLE_COUNT = 60
    let particles = []

    function initParticles() {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2,    // depth 0.2–1.0
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.3 - 0.1,   // drift upward
          size: Math.random() * 2.5 + 0.5,
          pulse: Math.random() * Math.PI * 2,
          type: Math.random() > 0.7 ? "violet" : "teal",
        })
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    // ─── Draw grid ───
    function drawGrid(t) {
      gridOffset = (gridOffset + GRID_SPEED) % (h / GRID_LINES * 2)

      const horizon = h * 0.35           // vanishing point height
      const centerX = w / 2

      // Horizontal lines (receding into distance)
      for (let i = 0; i < GRID_LINES; i++) {
        const progress = (i / GRID_LINES + gridOffset / h) % 1
        // Exponential spacing for perspective
        const perspY = horizon + (h - horizon) * Math.pow(progress, 2.2)
        const alpha = Math.pow(progress, 1.5) * 0.25

        ctx.beginPath()
        ctx.moveTo(0, perspY)
        ctx.lineTo(w, perspY)
        ctx.strokeStyle = `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, ${alpha})`
        ctx.lineWidth = progress > 0.5 ? 1 : 0.5
        ctx.stroke()
      }

      // Vertical lines (converging to vanishing point)
      for (let i = 0; i <= GRID_COLS; i++) {
        const ratio = i / GRID_COLS
        const bottomX = ratio * w
        // Lines converge toward center at horizon
        const topX = centerX + (bottomX - centerX) * 0.05

        const alpha = 0.08 + Math.abs(ratio - 0.5) * 0.1

        ctx.beginPath()
        ctx.moveTo(topX, horizon)
        ctx.lineTo(bottomX, h)
        ctx.strokeStyle = `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Horizon glow line
      const horizGrad = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 20)
      horizGrad.addColorStop(0, `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, 0)`)
      horizGrad.addColorStop(0.3, `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, 0.12)`)
      horizGrad.addColorStop(1, `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, 0)`)
      ctx.fillStyle = horizGrad
      ctx.fillRect(0, horizon - 2, w, 22)

      // Subtle scanline at horizon
      ctx.beginPath()
      ctx.moveTo(0, horizon)
      ctx.lineTo(w, horizon)
      ctx.strokeStyle = `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, 0.15)`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // ─── Draw particles ───
    function drawParticles(t) {
      for (const p of particles) {
        // Move
        p.x += p.vx
        p.y += p.vy * p.z
        p.pulse += 0.02

        // Wrap
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        // Pulsing alpha
        const pulseAlpha = 0.3 + Math.sin(p.pulse) * 0.2
        const rgba = p.type === "teal"
          ? `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, ${pulseAlpha * p.z})`
          : `rgba(${VIOLET[0]}, ${VIOLET[1]}, ${VIOLET[2]}, ${pulseAlpha * p.z * 0.7})`

        const sz = p.size * p.z

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, sz * 3, 0, Math.PI * 2)
        const glowRgba = p.type === "teal"
          ? `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, ${pulseAlpha * p.z * 0.08})`
          : `rgba(${VIOLET[0]}, ${VIOLET[1]}, ${VIOLET[2]}, ${pulseAlpha * p.z * 0.06})`
        ctx.fillStyle = glowRgba
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = rgba
        ctx.fill()
      }
    }

    // ─── Draw connections between close particles ───
    function drawConnections() {
      const maxDist = 120
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08 * particles[i].z * particles[j].z
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${TEAL[0]}, ${TEAL[1]}, ${TEAL[2]}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    // ─── Vignette overlay ───
    function drawVignette() {
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9)
      vigGrad.addColorStop(0, `rgba(${BG[0]}, ${BG[1]}, ${BG[2]}, 0)`)
      vigGrad.addColorStop(1, `rgba(${BG[0]}, ${BG[1]}, ${BG[2]}, 0.5)`)
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, w, h)
    }

    // ─── Main loop ───
    let time = 0
    function frame() {
      time += 0.016
      ctx.fillStyle = `rgb(${BG[0]}, ${BG[1]}, ${BG[2]})`
      ctx.fillRect(0, 0, w, h)

      drawGrid(time)
      drawParticles(time)
      drawConnections()
      drawVignette()

      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener("resize", resize)
    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
