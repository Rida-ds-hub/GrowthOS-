"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SignInButton } from "./SignInButton"

export function CTA() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: buttonRef,
    offset: ["start end", "end start"],
  })

  // Glow intensifies as orb reaches this section (when scroll is near end)
  const glowIntensity = useTransform(scrollYProgress, [0.7, 1], [0, 1])
  const glowSize = useTransform(scrollYProgress, [0.7, 1], [0, 200])
  const buttonScale = useTransform(scrollYProgress, [0.7, 1], [1, 1.1])
  const borderGlowSize = useTransform(scrollYProgress, [0.7, 1], [0, 60])
  const borderGlowOpacity = useTransform(scrollYProgress, [0.7, 1], [0, 1])

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="border-t-2 border-emerald-500 bg-zinc-950 rounded-2xl p-12 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop guessing. Start building evidence.
          </h2>
          <div ref={buttonRef} className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
            {/* Glow effect that intensifies */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-emerald-500 blur-3xl"
              style={{
                opacity: glowIntensity,
                scale: glowSize,
              }}
            />
            <motion.div
              style={{
                scale: buttonScale,
              }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  boxShadow: useTransform(
                    [borderGlowSize, borderGlowOpacity],
                    ([size, opacity]) => `0 0 ${size}px rgba(16, 185, 129, ${opacity})`
                  ),
                }}
              />
              <Button asChild size="lg" className="relative bg-emerald-500 text-black hover:bg-emerald-400 font-semibold border-2 border-emerald-400">
                <Link href="/onboarding">Run your gap analysis free →</Link>
              </Button>
            </motion.div>
            <SignInButton />
          </div>
        </div>
      </div>
    </section>
  )
}
