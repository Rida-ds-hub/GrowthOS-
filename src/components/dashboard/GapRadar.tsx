"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const getGapSeverity = (score: number): "high" | "medium" | "low" => {
    if (score < 40) return "high"
    if (score < 70) return "medium"
    return "low"
  }

  const getGapLabel = (severity: "high" | "medium" | "low"): string => {
    // "low" severity means low gap (good), "high" means high gap (needs work)
    if (severity === "low") return "Strong"
    if (severity === "medium") return "Moderate"
    return "Needs Work"
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white">
          Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={400}>
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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {data.map((item) => {
              const severity = getGapSeverity(item.score)
              return (
                <div
                  key={item.fullDomain}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {item.score}
                    </div>
                    <Badge variant={severity} className="text-xs">
                      {getGapLabel(severity)}
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-300 text-center leading-tight">
                    {item.fullDomain}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
