"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo/Logo"
import { ChevronRight, TrendingUp } from "lucide-react"

const journeySteps = [
  { label: "Plan", progress: 0 },
  { label: "Analyze", progress: 25 },
  { label: "Train", progress: 50 },
  { label: "Build", progress: 75 },
  { label: "Promote", progress: 100 },
]

export function AnimatedHeader() {
  const pathname = usePathname()
  const isOnboarding = pathname?.includes("/onboarding")
  const isDashboard = pathname?.includes("/dashboard")

  // Calculate progress based on current page
  let currentProgress = 0
  if (isDashboard) currentProgress = 100
  else if (isOnboarding) currentProgress = 50

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="nav" size="nav" />
          </Link>

          {/* Journey Progress */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-8">
            {journeySteps.map((step, index) => {
              const isActive = currentProgress >= step.progress
              const isCurrent = index === journeySteps.findIndex(s => s.progress === currentProgress)
              
              return (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                        transition-all duration-300
                        ${
                          isActive
                            ? "bg-emerald-500 text-black"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }
                      `}
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                    >
                      {isActive ? "✓" : index + 1}
                    </motion.div>
                    <span
                      className={`
                        text-xs font-medium transition-colors
                        ${isActive ? "text-emerald-400" : "text-zinc-500"}
                      `}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < journeySteps.length - 1 && (
                    <motion.div
                      className="flex-1 h-0.5 mx-2"
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? "#10b981" : "#27272a",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <Link
                href="/onboarding"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4" />
                Start Journey
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 bg-zinc-900 relative overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${currentProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </header>
  )
}
