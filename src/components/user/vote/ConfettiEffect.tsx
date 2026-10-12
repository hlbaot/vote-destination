"use client"

import React, { useEffect, useRef } from "react"

export default function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    const height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const colors = ["#E05A36", "#D4AF37", "#0F3D34", "#2A9D8F", "#E9C46A", "#F4A261"]
    const particleCount = 45

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.4) - 20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2.5 + 2,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 6,
      opacity: 1,
    }))

    const startTime = Date.now()
    const duration = 3500 // 3.5s

    const render = () => {
      const elapsed = Date.now() - startTime
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height)
        return
      }

      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vRotation
        p.opacity = Math.max(0, 1 - elapsed / duration)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 w-full h-full"
      aria-hidden="true"
    />
  )
}
