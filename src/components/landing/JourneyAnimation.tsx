"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { TrendingUp, Target, Award, Rocket } from "lucide-react"

const journeyStages = [
  { icon: Target, label: "Plan", color: "text-emerald-400", y: "10%" },
  { icon: TrendingUp, label: "Analyze", color: "text-emerald-400", y: "35%" },
  { icon: Award, label: "Train", color: "text-emerald-400", y: "60%" },
  { icon: Rocket, label: "Promote", color: "text-emerald-500", y: "85%" },
]

function JourneyStage({ 
  stage, 
  index, 
  scrollYProgress 
}: { 
  stage: typeof journeyStages[0]
  index: number
  scrollYProgress: any
}) {
  const Icon = stage.icon
  const stageProgress = index / (journeyStages.length - 1)
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, stageProgress - 0.2), stageProgress, Math.min(1, stageProgress + 0.2)],
    [0.3, 1, 0.3]
  )
  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, stageProgress - 0.2), stageProgress, Math.min(1, stageProgress + 0.2)],
    [0.8, 1.1, 0.8]
  )

  return (
    <motion.div
      className="absolute left-1/2 transform -translate-x-1/2"
      style={{
        top: stage.y,
        opacity,
        scale,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center">
          <Icon className={`w-6 h-6 ${stage.color}`} />
        </div>
        <span className="text-xs font-medium text-emerald-400">
          {stage.label}
        </span>
      </div>
    </motion.div>
  )
}

export function JourneyAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  return (
    <div ref={containerRef} className="relative h-[600px] overflow-hidden">
      {/* Animated journey path */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background path line */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 200 0 Q 200 150 200 300 T 200 600"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            style={{
              pathLength: scrollYProgress,
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated object that follows the journey */}
        <motion.div
          className="absolute"
          style={{
            y,
            opacity,
            scale,
          }}
        >
          <div className="relative">
            {/* Main icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Rocket className="w-8 h-8 text-black" />
            </div>

            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Stage indicators */}
        {journeyStages.map((stage, index) => (
          <JourneyStage
            key={stage.label}
            stage={stage}
            index={index}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  )
}
