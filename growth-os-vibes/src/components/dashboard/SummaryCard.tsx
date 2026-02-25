"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReadinessScore } from "./ReadinessScore"
import { GapAnalysis } from "@/lib/types"

interface SummaryCardProps {
  gapAnalysis: GapAnalysis
}

export function SummaryCard({ gapAnalysis }: SummaryCardProps) {
  const getScoreColor = (score: number) => {
    if (score <= 40) return "text-red-500"
    if (score <= 70) return "text-amber-500"
    return "text-emerald-500"
  }

  if (!gapAnalysis) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
        <CardContent className="p-0">
          <p className="text-zinc-300">No analysis data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <p className="text-zinc-300 text-base leading-relaxed">
              {gapAnalysis.summary || "No summary available"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex flex-col items-end gap-2">
              <div className={getScoreColor(gapAnalysis.readinessScore || 0)}>
                <span className="text-5xl font-bold">
                  {gapAnalysis.readinessScore || 0}
                </span>
              </div>
              <ReadinessScore score={gapAnalysis.readinessScore || 0} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
