"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export function JourneyOrb() {
  // Track entire page scroll
  const { scrollYProgress } = useScroll()

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001,
  })

  // Orb follows a curvy path through sections
  // Hero: 0-0.2
  // Features section: 0.2-0.4
  // How It Works: 0.4-0.6
  // CTA section: 0.6-1.0
  
  // X position - curves left and right (curvy path)
  const x = useTransform(
    smoothProgress,
    [0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
    ["50%", "50%", "45%", "55%", "50%", "48%", "52%", "50%", "50%"]
  )

  // Y position - moves down page smoothly
  const y = useTransform(
    smoothProgress,
    [0, 0.2, 0.4, 0.6, 1],
    ["50vh", "80vh", "120vh", "160vh", "calc(100vh - 150px)"]
  )

  // Scale - grows as it moves through sections
  const scale = useTransform(
    smoothProgress,
    [0, 0.2, 0.4, 0.6, 1],
    [0.3, 0.5, 0.8, 1.2, 1.8]
  )

  // Brightness - gets brighter
  const brightness = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [0.4, 0.7, 1.8]
  )

  // Glow size - grows significantly at bottom
  const glowSize = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [80, 200, 500]
  )

  // Glow intensity - very bright at bottom
  const glowIntensity = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [0.15, 0.4, 1]
  )

  return (
    <motion.div
      className="fixed pointer-events-none z-10"
      style={{
        left: x,
        top: y,
        x: "-50%",
        y: "-50%",
        scale,
        filter: `brightness(${brightness})`,
      }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500 blur-3xl"
        style={{
          width: glowSize,
          height: glowSize,
          opacity: glowIntensity,
          x: "-50%",
          y: "-50%",
          left: "50%",
          top: "50%",
        }}
      />

      {/* Main orb */}
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600"
        style={{
          boxShadow: `
            0 0 80px rgba(16, 185, 129, 0.6),
            0 0 160px rgba(16, 185, 129, 0.4),
            inset 0 0 50px rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      </motion.div>
    </motion.div>
  )
}
