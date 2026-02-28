"use client"

import { useEffect } from "react"

export function CursorEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const cursor = document.createElement("div")
    cursor.className = "custom-cursor"
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid var(--primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.1s ease-out;
      mix-blend-mode: difference;
      display: none;
    `
    document.body.appendChild(cursor)

    const cursorFollower = document.createElement("div")
    cursorFollower.className = "custom-cursor-follower"
    cursorFollower.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: transform 0.15s ease-out;
      mix-blend-mode: difference;
      display: none;
    `
    document.body.appendChild(cursorFollower)

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let followerX = 0
    let followerY = 0

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1
      cursorY += (mouseY - cursorY) * 0.1
      followerX += (mouseX - followerX) * 0.05
      followerY += (mouseY - followerY) * 0.05

      cursor.style.left = cursorX + "px"
      cursor.style.top = cursorY + "px"
      cursorFollower.style.left = followerX + "px"
      cursorFollower.style.top = followerY + "px"

      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseEnter = () => {
      cursor.style.display = "block"
      cursorFollower.style.display = "block"
    }

    const handleMouseLeave = () => {
      cursor.style.display = "none"
      cursorFollower.style.display = "none"
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        cursor.style.transform = "scale(1.5)"
        cursor.style.borderColor = "var(--primary)"
      } else {
        cursor.style.transform = "scale(1)"
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleMouseOver)
    updateCursor()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleMouseOver)
      cursor.remove()
      cursorFollower.remove()
    }
  }, [])

  return null
}

