"use client"

import { useRef, ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowingButtonProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function GlowingButton({ children, className, href, onClick }: GlowingButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const { scrollYProgress } = useScroll({
    target: buttonRef,
    offset: ["start end", "center center"],
  })

  // Glow intensifies as orb approaches (when scroll progress is high)
  const glowIntensity = useTransform(scrollYProgress, [0.7, 1], [0, 1])
  const glowSize = useTransform(scrollYProgress, [0.7, 1], [0, 100])
  const scale = useTransform(scrollYProgress, [0.7, 1], [1, 1.05])

  const Component = href ? "a" : "button"

  return (
    <motion.div
      ref={buttonRef as any}
      style={{
        scale,
      }}
      className="relative inline-block"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-emerald-500 blur-xl"
        style={{
          opacity: glowIntensity,
          scale: glowSize,
        }}
      />
      
      <Component
        href={href}
        onClick={onClick}
        className={cn(
          "relative bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-lg px-6 py-3 transition-colors",
          className
        )}
      >
        {children}
      </Component>
    </motion.div>
  )
}
