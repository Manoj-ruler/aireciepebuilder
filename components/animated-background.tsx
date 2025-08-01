"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  saturation: number
  lightness: number
  type: "bubble" | "sparkle" | "wave" | "orb" | "trail" | "cooking"
  angle: number
  speed: number
  life: number
  maxLife: number
  trail: { x: number; y: number; opacity: number }[]
  cookingItem?: string
  rotation?: number
}

interface Wave {
  x: number
  y: number
  amplitude: number
  frequency: number
  phase: number
  speed: number
  color: string
  opacity: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const wavesRef = useRef<Wave[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    // Heavily favor cooking items (fruits & vegetables) - 70% chance
    const types: Particle["type"][] = [
      "cooking", "cooking", "cooking", "cooking", "cooking", "cooking", "cooking", // 70% cooking items
      "bubble", "sparkle", "orb" // 30% other subtle effects
    ]
    const type = types[Math.floor(Math.random() * types.length)]
    
    // Only fruits and vegetables for the cooking particle type
    const cookingItems = [
      // Fresh Fruits
      "🍎", "🍊", "🍌", "🍇", "🍓", "🫐", "🍑", "🥝", "🍋", "🥥",
      "🍒", "🍑", "🥭", "🍍", "🫒", "🥑", "🍈", "🍉", "🍐", "🥧",
      
      // Fresh Vegetables  
      "🍅", "🥕", "🌽", "🥒", "🥬", "🥦", "🧄", "🧅", "🌶️", "🫑",
      "🥔", "🍄", "🍆", "🥖", "🌿", "🥗", "🫛", "🌱", "🥜", "🫘"
    ]

    // Beautiful color palette: whites, blues, greens, with golden accents
    const colorPalettes = [
      { hue: 200, saturation: 70, lightness: 85 }, // Soft blue
      { hue: 120, saturation: 60, lightness: 80 }, // Soft green
      { hue: 180, saturation: 50, lightness: 90 }, // Cyan white
      { hue: 45, saturation: 80, lightness: 75 }, // Golden
      { hue: 0, saturation: 0, lightness: 95 }, // Pure white
      { hue: 160, saturation: 40, lightness: 85 }, // Mint
      { hue: 220, saturation: 60, lightness: 80 }, // Sky blue
    ]

    const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)]

    const particle = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: type === "cooking" ? Math.random() * 30 + 20 : Math.random() * 40 + 10,
      opacity: Math.random() * 0.8 + 0.2,
      hue: palette.hue + (Math.random() - 0.5) * 30,
      saturation: palette.saturation + (Math.random() - 0.5) * 20,
      lightness: palette.lightness + (Math.random() - 0.5) * 15,
      type,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 2 + 0.5,
      life: 0,
      maxLife: Math.random() * 1000 + 500,
      trail: [],
      cookingItem: type === "cooking" ? cookingItems[Math.floor(Math.random() * cookingItems.length)] : undefined,
      rotation: type === "cooking" ? Math.random() * Math.PI * 2 : undefined,
    }

    return particle
  }, [])

  const createWave = useCallback((canvas: HTMLCanvasElement): Wave => {
    const colors = [
      "rgba(135, 206, 235, 0.1)", // Sky blue
      "rgba(144, 238, 144, 0.1)", // Light green
      "rgba(255, 255, 255, 0.05)", // White
      "rgba(173, 216, 230, 0.1)", // Light blue
      "rgba(152, 251, 152, 0.1)", // Pale green
    ]

    return {
      x: 0,
      y: Math.random() * canvas.height,
      amplitude: Math.random() * 100 + 50,
      frequency: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.3 + 0.1,
    }
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, time: number) => {
    ctx.save()

    const color = `hsl(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%)`

    switch (particle.type) {
      case "bubble":
        // Animated bubble with gradient and glow
        const bubbleRadius = Math.max(1, particle.size + Math.sin(time * 0.01 + particle.angle) * 5)
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, Math.max(1, particle.size))
        gradient.addColorStop(
          0,
          `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity})`,
        )
        gradient.addColorStop(
          0.7,
          `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness - 20}%, ${particle.opacity * 0.5})`,
        )
        gradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness - 40}%, 0)`)

        ctx.fillStyle = gradient
        ctx.shadowBlur = 20
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, bubbleRadius, 0, Math.PI * 2)
        ctx.fill()
        break

      case "sparkle":
        // Twinkling sparkle effect
        const sparkleSize = Math.max(1, particle.size * (0.5 + Math.sin(time * 0.02 + particle.angle) * 0.5))
        ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity})`
        ctx.shadowBlur = 15
        ctx.shadowColor = color

        // Draw star shape
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          const radius = Math.max(1, i % 2 === 0 ? sparkleSize : sparkleSize * 0.4)
          const x = particle.x + Math.cos(angle + time * 0.01) * radius
          const y = particle.y + Math.sin(angle + time * 0.01) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        break

      case "orb":
        // Pulsating orb with energy rings
        const orbSize = Math.max(1, particle.size + Math.sin(time * 0.015 + particle.angle) * 10)

        // Energy rings
        for (let i = 0; i < 3; i++) {
          const ringSize = Math.max(1, orbSize + i * 15 + Math.sin(time * 0.02 + i) * 5)
          ctx.strokeStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity * (0.3 - i * 0.1)})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, ringSize, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Core orb
        const coreGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, Math.max(1, orbSize))
        coreGradient.addColorStop(
          0,
          `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness + 20}%, ${particle.opacity})`,
        )
        coreGradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness - 30}%, 0)`)

        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, orbSize, 0, Math.PI * 2)
        ctx.fill()
        break

      case "trail":
        // Particle with trailing effect
        if (particle.trail.length > 0) {
          ctx.strokeStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity * 0.5})`
          ctx.lineWidth = particle.size * 0.1
          ctx.beginPath()
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
          }
          ctx.stroke()
        }

        // Main particle
        ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity})`
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, Math.max(1, particle.size * 0.5), 0, Math.PI * 2)
        ctx.fill()
        break

      case "cooking":
        // Cooking items (fruits, vegetables, kitchen utensils)
        if (particle.cookingItem && particle.rotation !== undefined) {
          ctx.save()
          
          // Move to particle position
          ctx.translate(particle.x, particle.y)
          
          // Apply rotation for natural floating effect
          ctx.rotate(particle.rotation + time * 0.001)
          
          // Set font size based on particle size
          const fontSize = Math.max(16, particle.size * 0.8)
          ctx.font = `${fontSize}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Add subtle glow effect
          ctx.shadowBlur = 8
          ctx.shadowColor = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0.3)`
          
          // Draw the cooking item emoji
          ctx.globalAlpha = particle.opacity * 0.8
          ctx.fillText(particle.cookingItem, 0, 0)
          
          ctx.restore()
        }
        break
    }

    ctx.restore()
  }, [])

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, wave: Wave, time: number, canvas: HTMLCanvasElement) => {
    ctx.save()
    ctx.strokeStyle = wave.color
    ctx.lineWidth = 3
    ctx.shadowBlur = 10
    ctx.shadowColor = wave.color

    ctx.beginPath()
    for (let x = 0; x <= canvas.width; x += 2) {
      const y = wave.y + Math.sin(x * wave.frequency + wave.phase + time * wave.speed) * wave.amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.restore()
  }, [])

  const updateParticle = useCallback(
    (particle: Particle, canvas: HTMLCanvasElement, time: number, mouseX: number, mouseY: number) => {
      // Skip mouse interaction for maximum performance
      // Mouse interaction removed to prevent lag

      // Physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.angle += 0.02
      particle.life++

      // Smoother gentle drift for cooking items
      if (particle.type === "cooking") {
        particle.vx += (Math.random() - 0.5) * 0.05 // Gentler movement for fruits/vegetables
        particle.vy += (Math.random() - 0.5) * 0.05
        particle.vx *= 0.995 // Less damping for smoother float
        particle.vy *= 0.995
        
        // Update rotation for smooth spinning
        if (particle.rotation !== undefined) {
          particle.rotation += 0.005 // Slow, smooth rotation
        }
      } else {
        // Regular drift for other particles
        particle.vx += (Math.random() - 0.5) * 0.1
        particle.vy += (Math.random() - 0.5) * 0.1
        particle.vx *= 0.99
        particle.vy *= 0.99
      }

      // Trail effect for trail particles
      if (particle.type === "trail") {
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity })
        if (particle.trail.length > 20) {
          particle.trail.shift()
        }
      }

      // Boundary wrapping
      if (particle.x < -50) particle.x = canvas.width + 50
      if (particle.x > canvas.width + 50) particle.x = -50
      if (particle.y < -50) particle.y = canvas.height + 50
      if (particle.y > canvas.height + 50) particle.y = -50

      // Life cycle
      if (particle.life > particle.maxLife) {
        particle.life = 0
        particle.opacity = Math.random() * 0.8 + 0.2
      }

      // Breathing opacity
      particle.opacity = Math.max(0.1, particle.opacity + Math.sin(time * 0.01 + particle.angle) * 0.1)
    },
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const initParticles = () => {
      particlesRef.current = []
      wavesRef.current = []

      // Create multiple static fruits and vegetables for visual appeal
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push(createParticle(canvas))
      }

      // No waves for maximum performance
      wavesRef.current = []
    }

    const animate = () => {
      timeRef.current += 0.05 // Very slow time increment
      const time = timeRef.current

      // Static background - no gradient calculations
      ctx.fillStyle = '#f0f9ff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw all particles with minimal animation
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i]
        
        // Very gentle movement to avoid lag
        particle.x += particle.vx * 0.2
        particle.y += particle.vy * 0.2
        
        // Simple boundary wrapping
        if (particle.x < -50) particle.x = canvas.width + 50
        if (particle.x > canvas.width + 50) particle.x = -50
        if (particle.y < -50) particle.y = canvas.height + 50
        if (particle.y > canvas.height + 50) particle.y = -50
        
        // Draw only cooking items (fruits & vegetables)
        if (particle.type === "cooking" && particle.cookingItem) {
          ctx.font = '28px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.globalAlpha = 0.8
          ctx.fillText(particle.cookingItem, particle.x, particle.y)
          ctx.globalAlpha = 1
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animationRef.current = requestAnimationFrame(animate)

    window.addEventListener("resize", resizeCanvas)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createParticle, createWave, drawParticle, drawWave, updateParticle])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f0fdf4 50%, #fefce8 75%, #f8fafc 100%)",
      }}
    />
  )
}
