"use client"

import { motion } from "framer-motion"

// Generate 20 orbs with random shooting star paths
const generateOrbs = () => {
  const orbs = []
  for (let i = 0; i < 20; i++) {
    // Random starting position (from edges of screen)
    const startSide = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
    let startX, startY, endX, endY

    switch (startSide) {
      case 0: // Top
        startX = Math.random() * 100
        startY = -10
        endX = Math.random() * 100
        endY = 110
        break
      case 1: // Right
        startX = 110
        startY = Math.random() * 100
        endX = -10
        endY = Math.random() * 100
        break
      case 2: // Bottom
        startX = Math.random() * 100
        startY = 110
        endX = Math.random() * 100
        endY = -10
        break
      case 3: // Left
        startX = -10
        startY = Math.random() * 100
        endX = 110
        endY = Math.random() * 100
        break
    }

    orbs.push({
      size: 4 + Math.random() * 12, // 4-16px
      startX,
      startY,
      endX,
      endY,
      duration: 3 + Math.random() * 4, // 3-7 seconds
      delay: Math.random() * 5, // 0-5 seconds
      opacity: 0.3 + Math.random() * 0.5, // 0.3-0.8
    })
  }
  return orbs
}

const orbs = generateOrbs()

export function OrbitingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${orb.startX}%`,
            top: `${orb.startY}%`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: `${orb.endX - orb.startX}vw`,
            y: `${orb.endY - orb.startY}vh`,
            opacity: [0, orb.opacity, orb.opacity, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "linear",
            delay: orb.delay,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          <motion.div
            className="rounded-full bg-gradient-to-br from-emerald-400/60 via-emerald-500/60 to-emerald-600/60 backdrop-blur-sm"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              boxShadow: `0 0 ${orb.size * 2}px rgba(16, 185, 129, 0.4)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
