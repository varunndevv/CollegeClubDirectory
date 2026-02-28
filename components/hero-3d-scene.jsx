"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export function Hero3DScene() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const animationFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!mountRef.current || typeof window === "undefined") return

    try {
      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0a0a0a)
      scene.fog = new THREE.Fog(0x0a0a0a, 10, 50)

      const width = window.innerWidth || 1920
      const height = window.innerHeight || 1080

      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      )
      camera.position.z = 5

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      })
      
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement)
      }

      // Lighting
    const ambientLight = new THREE.AmbientLight(0x9fdcc8, 0.3)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x9fdcc8, 1, 100)
    pointLight1.position.set(5, 5, 5)
    pointLight1.castShadow = true
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xa3635d, 0.8, 100)
    pointLight2.position.set(-5, -5, 5)
    pointLight2.castShadow = true
    scene.add(pointLight2)

    // Objects array for animation
    const objects = []

    // Create rotating gear (college logo representation)
    const createGear = () => {
      const gearGroup = new THREE.Group()
      const gearGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16)
      const gearMaterial = new THREE.MeshStandardMaterial({
        color: 0x9fdcc8,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x9fdcc8,
        emissiveIntensity: 0.2
      })
      
      const mainGear = new THREE.Mesh(gearGeometry, gearMaterial)
      mainGear.castShadow = true
      mainGear.receiveShadow = true
      gearGroup.add(mainGear)

      // Add teeth
      for (let i = 0; i < 8; i++) {
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.3, 0.2),
          gearMaterial
        )
        const angle = (i / 8) * Math.PI * 2
        tooth.position.x = Math.cos(angle) * 0.7
        tooth.position.y = Math.sin(angle) * 0.7
        tooth.castShadow = true
        gearGroup.add(tooth)
      }

      gearGroup.position.set(0, 1.5, 0)
      gearGroup.rotation.x = Math.PI / 2
      scene.add(gearGroup)
      objects.push({ 
        mesh: gearGroup, 
        type: 'gear',
        rotationSpeed: { x: 0, y: 0.01, z: 0 }
      })
    }

    // Create floating geometric shapes
    const createFloatingShapes = () => {
      const shapes = ['hexagon', 'sphere', 'box']
      const colors = [0x9fdcc8, 0xa3635d, 0x22112a]

      for (let i = 0; i < 12; i++) {
        let geometry
        const shapeType = shapes[i % shapes.length]
        
        if (shapeType === 'hexagon') {
          geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 6)
        } else if (shapeType === 'sphere') {
          geometry = new THREE.SphereGeometry(0.15, 16, 16)
        } else {
          geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        }

        const material = new THREE.MeshStandardMaterial({
          color: colors[i % colors.length],
          metalness: 0.5,
          roughness: 0.5,
          transparent: true,
          opacity: 0.8,
          emissive: colors[i % colors.length],
          emissiveIntensity: 0.1
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        
        const angle = (i / 12) * Math.PI * 2
        const radius = 3 + Math.random() * 2
        mesh.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3
        )

        scene.add(mesh)
        objects.push({
          mesh,
          type: 'floating',
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
          },
          floatSpeed: Math.random() * 0.01 + 0.005,
          initialY: mesh.position.y
        })
      }
    }

    // Particle system
    const createParticles = () => {
      const isMobile = (window.innerWidth || 1920) < 768
      const particleCount = isMobile ? 300 : 1000
      const particles = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20
        positions[i + 1] = (Math.random() - 0.5) * 20
        positions[i + 2] = (Math.random() - 0.5) * 20

        const color = new THREE.Color()
        color.setHSL(0.4 + Math.random() * 0.2, 0.7, 0.5 + Math.random() * 0.3)
        colors[i] = color.r
        colors[i + 1] = color.g
        colors[i + 2] = color.b
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })

      const particleSystem = new THREE.Points(particles, particleMaterial)
      scene.add(particleSystem)
      objects.push({
        mesh: particleSystem,
        type: 'particles',
        rotationSpeed: { x: 0, y: 0.0005, z: 0 }
      })
    }

    // Create club category icons (3D representations)
    const createClubIcons = () => {
      const iconTypes = [
        { type: 'robot', color: 0x9fdcc8 },
        { type: 'palette', color: 0xa3635d },
        { type: 'sports', color: 0x9fdcc8 },
        { type: 'tech', color: 0xa3635d }
      ]

      iconTypes.forEach((icon, index) => {
        const iconGroup = new THREE.Group()
        let geometry

        if (icon.type === 'robot') {
          geometry = new THREE.BoxGeometry(0.3, 0.4, 0.3)
        } else if (icon.type === 'palette') {
          geometry = new THREE.ConeGeometry(0.2, 0.4, 8)
        } else if (icon.type === 'sports') {
          geometry = new THREE.SphereGeometry(0.2, 16, 16)
        } else {
          geometry = new THREE.OctahedronGeometry(0.25)
        }

        const material = new THREE.MeshStandardMaterial({
          color: icon.color,
          metalness: 0.6,
          roughness: 0.4,
          emissive: icon.color,
          emissiveIntensity: 0.3
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        iconGroup.add(mesh)

        const angle = (index / iconTypes.length) * Math.PI * 2
        iconGroup.position.set(
          Math.cos(angle) * 2.5,
          -1.5 + (index % 2) * 1,
          Math.sin(angle) * 2.5
        )

        scene.add(iconGroup)
        objects.push({
          mesh: iconGroup,
          type: 'icon',
          rotationSpeed: {
            x: 0.01,
            y: 0.02,
            z: 0.005
          },
          floatSpeed: 0.01,
          initialY: iconGroup.position.y
        })
      })
    }

      // Initialize all objects
      createGear()
      createFloatingShapes()
      createParticles()
      createClubIcons()

      // Mouse movement handler
      const handleMouseMove = (event) => {
        if (typeof window === "undefined") return
        const width = window.innerWidth || 1920
        const height = window.innerHeight || 1080
        mouseRef.current.x = (event.clientX / width) * 2 - 1
        mouseRef.current.y = -(event.clientY / height) * 2 + 1
      }

      // Click ripple effect
      const handleClick = (event) => {
        if (!renderer || !renderer.domElement) return
        try {
          const rect = renderer.domElement.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

          // Create ripple effect
          const rippleGeometry = new THREE.RingGeometry(0.1, 0.2, 32)
          const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0x9fdcc8,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
          })
          const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial)
          
          const worldPosition = new THREE.Vector3(x * 5, y * 5, 0)
          worldPosition.unproject(camera)
          const dir = worldPosition.sub(camera.position).normalize()
          const distance = -camera.position.z / dir.z
          const pos = camera.position.clone().add(dir.multiplyScalar(distance))
          
          ripple.position.copy(pos)
          ripple.lookAt(camera.position)
          scene.add(ripple)

          // Animate ripple
          let scale = 1
          const animateRipple = () => {
            scale += 0.1
            ripple.scale.set(scale, scale, 1)
            rippleMaterial.opacity -= 0.02
            
            if (rippleMaterial.opacity > 0) {
              requestAnimationFrame(animateRipple)
            } else {
              scene.remove(ripple)
              rippleGeometry.dispose()
              rippleMaterial.dispose()
            }
          }
          animateRipple()
        } catch (error) {
          console.error('Error creating ripple:', error)
        }
      }

      if (typeof window !== "undefined") {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('click', handleClick)
      }

      // Animation loop
      let time = 0
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)
        time += 0.01

        // Camera follows mouse with easing
        camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.05
        camera.position.y += (mouseRef.current.y * 0.5 - camera.position.y) * 0.05
        camera.lookAt(0, 0, 0)

        // Animate objects
        objects.forEach((obj) => {
          if (obj.type === 'gear') {
            obj.mesh.rotation.z += obj.rotationSpeed.y
          } else if (obj.type === 'floating' || obj.type === 'icon') {
            obj.mesh.rotation.x += obj.rotationSpeed.x
            obj.mesh.rotation.y += obj.rotationSpeed.y
            obj.mesh.rotation.z += obj.rotationSpeed.z
            
            if (obj.floatSpeed) {
              obj.mesh.position.y = obj.initialY + Math.sin(time * 2 + obj.mesh.position.x) * 0.3
            }
          } else if (obj.type === 'particles') {
            obj.mesh.rotation.y += obj.rotationSpeed.y
            
            // Move particles based on mouse
            try {
              const positions = obj.mesh.geometry.attributes.position.array
              if (positions) {
                for (let i = 0; i < positions.length; i += 3) {
                  positions[i] += mouseRef.current.x * 0.0001
                  positions[i + 1] += mouseRef.current.y * 0.0001
                }
                obj.mesh.geometry.attributes.position.needsUpdate = true
              }
            } catch (error) {
              // Silently handle particle update errors
            }
          }
        })

        // Update lights based on mouse
        pointLight1.position.x = 5 + mouseRef.current.x * 2
        pointLight1.position.y = 5 + mouseRef.current.y * 2
        pointLight2.position.x = -5 - mouseRef.current.x * 2
        pointLight2.position.y = -5 - mouseRef.current.y * 2

        renderer.render(scene, camera)
      }

      animate()
      setIsLoaded(true)
      sceneRef.current = scene

      // Handle resize with debounce for performance
      let resizeTimeout
      const handleResize = () => {
        if (typeof window === "undefined") return
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          const width = window.innerWidth || 1920
          const height = window.innerHeight || 1080
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }, 100)
      }
      if (typeof window !== "undefined") {
        window.addEventListener('resize', handleResize)
      }

      // Store cleanup variables
      const cleanup = () => {
        if (typeof window !== "undefined") {
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('click', handleClick)
          window.removeEventListener('resize', handleResize)
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        // Dispose of all geometries and materials
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry?.dispose()
              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => mat.dispose())
              } else {
                object.material?.dispose()
              }
            }
          })
        }

        if (renderer) {
          renderer.dispose()
          if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement)
          }
        }
      }

      return cleanup

    } catch (error) {
      console.error('Error initializing 3D scene:', error)
      setIsLoaded(false)
      return () => {} // Return empty cleanup on error
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s ease-in',
        willChange: 'opacity'
      }}
    />
  )
}

