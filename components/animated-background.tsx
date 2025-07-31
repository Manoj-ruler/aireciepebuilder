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
  type: "bubble" | "sparkle" | "wave" | "orb" | "trail"
  angle: number
  speed: number
  life: number
  maxLife: number
  trail: { x: number; y: number; opacity: number }[]
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
    const types: Particle["type"][] = ["bubble", "sparkle", "wave", "orb", "trail"]
    const type = types[Math.floor(Math.random() * types.length)]

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

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 40 + 10,
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
    }
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
      // Mouse interaction
      const dx = mouseX - particle.x
      const dy = mouseY - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        const force = (150 - distance) / 150
        particle.vx += (dx / distance) * force * 0.5
        particle.vy += (dy / distance) * force * 0.5
      }

      // Physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.angle += 0.02
      particle.life++

      // Gentle drift
      particle.vx += (Math.random() - 0.5) * 0.1
      particle.vy += (Math.random() - 0.5) * 0.1

      // Damping
      particle.vx *= 0.99
      particle.vy *= 0.99

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

      // Create particles
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(createParticle(canvas))
      }

      // Create waves
      for (let i = 0; i < 5; i++) {
        wavesRef.current.push(createWave(canvas))
      }
    }

    const animate = () => {
      timeRef.current += 1
      const time = timeRef.current

      // Create beautiful gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `hsl(${200 + Math.sin(time * 0.001) * 20}, 60%, 95%)`)
      gradient.addColorStop(0.3, `hsl(${180 + Math.sin(time * 0.0015) * 15}, 50%, 92%)`)
      gradient.addColorStop(0.6, `hsl(${160 + Math.sin(time * 0.002) * 10}, 40%, 90%)`)
      gradient.addColorStop(1, `hsl(${140 + Math.sin(time * 0.0025) * 25}, 45%, 88%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated waves
      wavesRef.current.forEach((wave) => {
        wave.phase += wave.speed
        drawWave(ctx, wave, time, canvas)
      })

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, canvas, time, mouseRef.current.x, mouseRef.current.y)
        drawParticle(ctx, particle, time)
      })

      // Add new particles occasionally
      if (Math.random() < 0.02 && particlesRef.current.length < 100) {
        particlesRef.current.push(createParticle(canvas))
      }

      // Connection lines between nearby particles
      ctx.save()
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = ((120 - distance) / 120) * 0.2
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animate()

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
