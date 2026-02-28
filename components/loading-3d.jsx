"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function Loading3D({ onComplete }) {
  const mountRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current || typeof window === "undefined") return

    const mountNode = mountRef.current

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, 200 / 200, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(200, 200)
      mountNode.appendChild(renderer.domElement)

      const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.7, 16, 16),
        new THREE.OctahedronGeometry(0.7),
        new THREE.TetrahedronGeometry(0.7),
      ]

      const material = new THREE.MeshStandardMaterial({
        color: 0x9fdcc8,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x9fdcc8,
        emissiveIntensity: 0.3,
      })

      const mesh = new THREE.Mesh(geometries[0], material)
      scene.add(mesh)

      const light = new THREE.PointLight(0x9fdcc8, 1, 100)
      light.position.set(5, 5, 5)
      scene.add(light)

      const ambientLight = new THREE.AmbientLight(0x9fdcc8, 0.3)
      scene.add(ambientLight)

      camera.position.z = 3

      let time = 0
      let geometryIndex = 0
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)
        time += 0.02

        mesh.rotation.x += 0.01
        mesh.rotation.y += 0.01

        if (Math.floor(time * 0.5) !== geometryIndex) {
          geometryIndex = Math.floor(time * 0.5) % geometries.length
          mesh.geometry.dispose()
          mesh.geometry = geometries[geometryIndex]
        }

        renderer.render(scene, camera)

        if (time > 3 && onComplete) {
          onComplete()
        }
      }

      animate()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        geometries.forEach((geo) => geo.dispose())
        material.dispose()
        renderer.dispose()
        if (mountNode && renderer.domElement && mountNode.contains(renderer.domElement)) {
          mountNode.removeChild(renderer.domElement)
        }
      }
    } catch (error) {
      console.error("Error initializing loading animation:", error)
      return () => {}
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div ref={mountRef} className="flex items-center justify-center" />
    </div>
  )
}

