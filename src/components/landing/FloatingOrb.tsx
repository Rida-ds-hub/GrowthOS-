"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export function FloatingOrb() {
  // Track scroll progress of entire page
  const { scrollYProgress } = useScroll()

  // Smooth spring animation for the orb movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Orb moves from top to bottom of viewport as you scroll
  const y = useTransform(smoothProgress, [0, 1], ["10vh", "90vh"])
  
  // Orb grows and gets brighter as it reaches the bottom
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.5, 0.7, 1.5])
  const brightness = useTransform(smoothProgress, [0, 0.6, 1], [0.4, 0.7, 1.5])
  const glowSize = useTransform(smoothProgress, [0, 0.6, 1], [150, 250, 600])
  const glowIntensity = useTransform(smoothProgress, [0, 0.6, 1], [0.15, 0.4, 0.8])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          y,
          scale,
        }}
      >
        <motion.div
          className="relative"
          style={{
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
            className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600"
            style={{
              boxShadow: `
                0 0 60px rgba(16, 185, 129, 0.5),
                0 0 120px rgba(16, 185, 129, 0.3),
                inset 0 0 40px rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {/* Inner shine */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-emerald-300"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [
                    Math.cos((i * Math.PI * 2) / 6) * 20,
                    Math.cos((i * Math.PI * 2) / 6) * 40,
                    Math.cos((i * Math.PI * 2) / 6) * 20,
                  ],
                  y: [
                    Math.sin((i * Math.PI * 2) / 6) * 20,
                    Math.sin((i * Math.PI * 2) / 6) * 40,
                    Math.sin((i * Math.PI * 2) / 6) * 20,
                  ],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
