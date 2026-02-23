"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"

interface GapCardsProps {
  gapAnalysis: GapAnalysis
}

export function GapCards({ gapAnalysis }: GapCardsProps) {
  if (!gapAnalysis || !gapAnalysis.gaps || gapAnalysis.gaps.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Gap Details</h2>
        <p className="text-zinc-400">No gap details available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-4">Gap Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gapAnalysis.gaps.map((gap, index) => (
          <Card
            key={index}
            className="bg-zinc-900/50 border-zinc-800 rounded-2xl"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">
                  {gap.domain}
                </CardTitle>
                <Badge variant={gap.gap}>{gap.gap}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                  Observation
                </div>
                <p className="text-sm text-zinc-300">{gap.observation}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                  Requirement
                </div>
                <p className="text-sm text-zinc-300">{gap.requirement}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                  Closing Action
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  {gap.closingAction}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
