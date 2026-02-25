"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { GapAnalysis } from "@/lib/types"

interface GapRadarProps {
  gapAnalysis: GapAnalysis
}

export function GapRadar({ gapAnalysis }: GapRadarProps) {
  const domains = [
    "System Design Maturity",
    "Execution Scope",
    "Communication & Visibility",
    "Technical Depth",
    "Leadership & Influence",
  ]

  // Safely access domainScores with fallback
  const domainScores = gapAnalysis?.domainScores || {}

  const data = domains.map((domain) => ({
    domain: domain.split(" ")[0], // Short name for display
    fullDomain: domain,
    score: domainScores[domain as keyof typeof domainScores] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="#27272a" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#52525b", fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.4}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
