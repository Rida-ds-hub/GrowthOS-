"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { OrbitingOrbs } from "./OrbitingOrbs"
import { GlowingButtonBorder } from "./GlowingButtonBorder"

const words = [
  { text: "Build", color: "text-white" },
  { text: "the", color: "text-white" },
  { text: "evidence.", color: "text-white relative inline-block" },
  { text: "Earn", color: "text-white" },
  { text: "the", color: "text-white" },
  { text: "promotion.", color: "text-emerald-500" },
]

export function Hero() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { scrollYProgress } = useScroll({
    target: buttonRef,
    offset: ["start start", "center center"],
  })

  const handleStartJourney = () => {
    // Allow users to start journey without signing in
    router.push("/onboarding")
  }

  // Dynamic glow for hero button
  const glowIntensity = useTransform(scrollYProgress, [0, 0.3], [0.5, 0])
  const glowPulse = useTransform(scrollYProgress, [0, 0.3], [1, 1.2])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Orbiting orbs around hero - universe effect */}
      <OrbitingOrbs />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight relative"
          initial="hidden"
          animate="visible"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              className={`inline-block mr-2 ${word.color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.35 }}
            >
              {word.text}
              {word.text === "evidence." && (
                <svg
                  className="absolute -bottom-1 left-0 w-full h-3 pointer-events-none"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 5 10 Q 40 8, 80 10 Q 120 12, 160 10 Q 180 9, 190 12"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    className="text-emerald-400"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ delay: index * 0.08 + 0.4, duration: 0.6, ease: "easeOut" }}
                  />
                </svg>
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-zinc-300 mb-8 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
        >
          Career growth engineered for tech professionals.
        </motion.p>

        <motion.div
          ref={buttonRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 relative"
        >
          <div className="relative inline-block">
            {/* Traveling perimeter glow */}
            <GlowingButtonBorder />
            {/* Box glow */}
            <div className="absolute inset-0 rounded-lg bg-emerald-500 blur-xl opacity-50 -z-10" />
            <Button 
              size="lg" 
              onClick={handleStartJourney}
              className="relative z-10 bg-emerald-500 text-zinc-100 hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/50"
            >
              Start your journey →
            </Button>
          </div>
        </motion.div>
      </div>

    </section>
  )
}
