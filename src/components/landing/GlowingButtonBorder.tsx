"use client"

import { motion } from "framer-motion"

export function GlowingButtonBorder() {
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
      {/* Rotating gradient that travels around perimeter */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 240deg,
            rgba(16, 185, 129, 0.6) 240deg,
            rgba(16, 185, 129, 1) 280deg,
            rgba(16, 185, 129, 0.6) 320deg,
            transparent 360deg
          )`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Inner mask to create border effect */}
      <div className="absolute inset-[3px] rounded-md bg-[#0a0a0a]" />
    </div>
  )
}
