"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnalysisLoaderProps {
  onComplete: () => void
  targetRole?: string
}

export function AnalysisLoader({ onComplete, targetRole = "target role" }: AnalysisLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const messages = [
    { text: "Connecting profile data...", delay: 0 },
    { text: "Reading your GitHub activity...", delay: 1500 },
    { text: "Parsing your experience...", delay: 3300 },
    { text: `Mapping gaps to ${targetRole}...`, delay: 4800 },
    { text: "Building your 90-day plan...", delay: 0 }, // Set dynamically after AI response
  ]

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Message 1: "Connecting profile data..." (0s)
    setCurrentMessageIndex(0)

    // Message 2: "Reading your GitHub activity..." (1.5s)
    const timer2 = setTimeout(() => {
      setCurrentMessageIndex(1)
    }, 1500)
    timers.push(timer2)

    // Message 3: "Parsing your experience..." (3.3s)
    const timer3 = setTimeout(() => {
      setCurrentMessageIndex(2)
    }, 3300)
    timers.push(timer3)

    // Message 4: "Mapping gaps to [Target Role]..." (4.8s) - AI call fires here
    const timer4 = setTimeout(() => {
      setCurrentMessageIndex(3)
    }, 4800)
    timers.push(timer4)

    // Message 5: "Building your 90-day plan..." (after AI response, ~2-3s later)
    const timer5 = setTimeout(() => {
      setCurrentMessageIndex(4)
      // Show completion after brief display
      setTimeout(() => {
        setIsComplete(true)
        setTimeout(onComplete, 800)
      }, 1000)
    }, 7500) // Total ~7.5s for full flow
    timers.push(timer5)

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [onComplete, targetRole])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <p className="text-xl text-white font-medium">
              {messages[currentMessageIndex]?.text || "Processing..."}
            </p>
            {isComplete && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-emerald-500"
              >
                Analysis complete!
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
