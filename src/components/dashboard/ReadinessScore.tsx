"use client"

import { cn } from "@/lib/utils"

interface ReadinessScoreProps {
  score: number
  className?: string
}

export function ReadinessScore({ score, className }: ReadinessScoreProps) {
  const getColor = () => {
    if (score <= 40) return "text-red-500"
    if (score <= 70) return "text-amber-500"
    return "text-emerald-500"
  }

  const circumference = 2 * Math.PI * 18 // radius = 18
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-zinc-800"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={getColor()}
            style={{
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-semibold", getColor())}>
            {score}%
          </span>
        </div>
      </div>
    </div>
  )
}
