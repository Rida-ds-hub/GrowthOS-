"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GapAnalysis } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PlanTimelineProps {
  gapAnalysis: GapAnalysis
}

export function PlanTimeline({ gapAnalysis }: PlanTimelineProps) {
  if (!gapAnalysis || !gapAnalysis.plan) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">90-Day Plan</h2>
        <p className="text-zinc-400">No plan data available</p>
      </div>
    )
  }

  const phases = [
    { ...(gapAnalysis.plan.phase1 || { theme: "", actions: [] }), days: "Days 1-30" },
    { ...(gapAnalysis.plan.phase2 || { theme: "", actions: [] }), days: "Days 31-60" },
    { ...(gapAnalysis.plan.phase3 || { theme: "", actions: [] }), days: "Days 61-90" },
  ]

  // Determine current phase (simplified - would calculate from actual dates)
  const currentPhaseIndex = 0 // This would be calculated based on when onboarding was completed

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-4">90-Day Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible">
        {phases.map((phase, index) => {
          const isCurrentPhase = index === currentPhaseIndex
          return (
            <Card
              key={index}
              className={cn(
                "bg-zinc-900/50 border-zinc-800 rounded-2xl min-w-[280px]",
                isCurrentPhase && "border-emerald-500 border-2"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                    {phase.days}
                  </CardTitle>
                  {isCurrentPhase && (
                    <span className="text-xs font-medium text-emerald-500">
                      Current
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {phase.theme}
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {phase.actions.map((action, actionIndex) => (
                    <li
                      key={actionIndex}
                      className="text-sm text-zinc-300 flex items-start gap-2"
                    >
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
