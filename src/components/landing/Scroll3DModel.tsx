"use client"

import { useScroll, useTransform, motion } from "framer-motion"

export function Scroll3DModel() {
  // Track entire page scroll
  const { scrollYProgress } = useScroll()

  // Transform scroll progress to Y position (follows page length)
  // Calculate based on viewport height - moves from top to bottom of page
  const y = useTransform(scrollYProgress, [0, 1], ["10vh", "90vh"])
  
  // Rotation based on scroll
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360])
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 720])
  const rotateZ = useTransform(scrollYProgress, [0, 1], [0, 180])
  
  // Scale animation - grows in middle, shrinks at ends
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1.3, 1.3, 0.8])
  
  // Opacity fade - visible through most of scroll
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])

  return (
    <motion.div
      className="fixed right-[8%] w-80 h-80 md:w-96 md:h-96 pointer-events-none z-0"
      style={{
        y,
        rotateX,
        rotateY,
        rotateZ,
        scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
        {/* 3D Geometric Structure */}
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          {/* Main Torus Ring */}
          <motion.div
            className="absolute inset-0"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              style={{ filter: "drop-shadow(0 0 40px rgba(16, 185, 129, 0.6))" }}
            >
              <defs>
                <linearGradient id="torusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
                  <stop offset="50%" stopColor="rgba(34, 197, 94, 0.6)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.8)" />
                </linearGradient>
              </defs>
              {/* Outer ring */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#torusGradient)"
                strokeWidth="3"
                opacity="0.8"
              />
              {/* Inner ring */}
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="url(#torusGradient)"
                strokeWidth="2"
                opacity="0.6"
              />
              {/* Center dot */}
              <circle
                cx="100"
                cy="100"
                r="8"
                fill="rgba(16, 185, 129, 1)"
                style={{ filter: "blur(2px)" }}
              />
            </svg>
          </motion.div>

          {/* Orbiting particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(16, 185, 129, 1), rgba(16, 185, 129, 0.3))",
                left: "50%",
                top: "50%",
                transformOrigin: `${80 + i * 10}px 0px`,
                filter: "blur(1px)",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Connecting lines */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
            style={{ opacity: 0.4 }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8
              const x1 = 100 + 70 * Math.cos((angle * Math.PI) / 180)
              const y1 = 100 + 70 * Math.sin((angle * Math.PI) / 180)
              const x2 = 100 + 50 * Math.cos((angle * Math.PI) / 180)
              const y2 = 100 + 50 * Math.sin((angle * Math.PI) / 180)
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                />
              )
            })}
          </motion.svg>
        </div>
    </motion.div>
  )
}
