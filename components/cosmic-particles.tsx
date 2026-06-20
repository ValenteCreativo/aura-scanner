'use client'

import { useRef, useEffect } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; baseSize: number
  opacity: number
  hue: number
  life: number; lifeSpeed: number
  trail: { x: number; y: number }[]
}

export default function CosmicParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let w = 0, h = 0
    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // More particles, more alive
    const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 8000))
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      baseSize: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      hue: Math.random() < 0.3
        ? Math.random() * 30 + 30   // Gold tones (30-60)
        : Math.random() * 80 + 250, // Violet-magenta (250-330)
      life: Math.random() * Math.PI * 2,
      lifeSpeed: Math.random() * 0.03 + 0.008,
      trail: [],
    }))

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }
    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Touch support
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, active: true }
      }
    }
    const handleTouchEnd = () => { mouseRef.current.active = false }
    window.addEventListener('touchmove', handleTouch)
    window.addEventListener('touchend', handleTouchEnd)

    const animate = () => {
      // Subtle fade instead of full clear (creates trails)
      ctx.fillStyle = 'rgba(8, 6, 4, 0.15)'
      ctx.fillRect(0, 0, w, h)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (const p of particles) {
        p.life += p.lifeSpeed

        // === MOUSE INTERACTION ===
        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 250) {
            const force = (250 - dist) / 250
            // Orbit around cursor (tangential + radial force)
            const angle = Math.atan2(dy, dx)
            const tangentX = -Math.sin(angle) * force * 0.8
            const tangentY = Math.cos(angle) * force * 0.8
            const pullX = dx / dist * force * 0.3
            const pullY = dy / dist * force * 0.3

            p.vx += (tangentX + pullX) * 0.02
            p.vy += (tangentY + pullY) * 0.02

            // Grow near mouse
            p.size = p.baseSize * (1 + force * 2)
            p.opacity = Math.min(1, p.opacity + force * 0.05)
          } else {
            p.size += (p.baseSize - p.size) * 0.05
          }
        } else {
          p.size += (p.baseSize - p.size) * 0.02
        }

        // Physics
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy *= 0.985

        // Wrap
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Trail
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 6) p.trail.shift()

        const currentOpacity = p.opacity * (0.5 + Math.sin(p.life) * 0.5)

        // Draw trail
        if (p.trail.length > 2) {
          ctx.beginPath()
          ctx.moveTo(p.trail[0].x, p.trail[0].y)
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y)
          }
          ctx.strokeStyle = `hsla(${p.hue}, 60%, 55%, ${currentOpacity * 0.2})`
          ctx.lineWidth = p.size * 0.5
          ctx.stroke()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${currentOpacity})`
        ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, ${currentOpacity})`
        ctx.shadowBlur = p.size * 4
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Draw connections (golden sacred geometry style)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08
            // Golden connections
            ctx.strokeStyle = `hsla(40, 60%, 50%, ${alpha})`
            ctx.lineWidth = 0.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Mouse glow
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150)
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.03)')
        grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.015)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
