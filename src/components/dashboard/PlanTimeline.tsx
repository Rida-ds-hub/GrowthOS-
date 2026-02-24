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
        <h2 className="text-2xl font-semibold text-white mb-4">3-Phase Plan</h2>
        <p className="text-zinc-400">No plan data available</p>
      </div>
    )
  }

  const phases = [
    { ...(gapAnalysis.plan.phase1 || { theme: "", actions: [] }), label: gapAnalysis.plan.phase1?.label || "Phase 1" },
    { ...(gapAnalysis.plan.phase2 || { theme: "", actions: [] }), label: gapAnalysis.plan.phase2?.label || "Phase 2" },
    { ...(gapAnalysis.plan.phase3 || { theme: "", actions: [] }), label: gapAnalysis.plan.phase3?.label || "Phase 3" },
  ]

  // Determine current phase (simplified - would calculate from actual dates)
  const currentPhaseIndex = 0 // This would be calculated based on when onboarding was completed

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-4">3-Phase Plan</h2>
      
      {/* Flow Diagram */}
      <div className="flex items-center justify-center gap-6 md:gap-12 lg:gap-16 mb-8 py-6 overflow-x-auto">
        {phases.map((phase, index) => (
          <div key={index} className="flex items-center gap-6 md:gap-12 lg:gap-16 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`
                w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-base md:text-lg lg:text-xl font-semibold
                ${index === 0 ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-300"}
              `}>
                {index + 1}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-zinc-400 mt-2 md:mt-3 text-center max-w-[120px] md:max-w-[160px] lg:max-w-[200px] leading-tight">
                {phase.theme || `Phase ${index + 1}`}
              </div>
            </div>
            {index < phases.length - 1 && (
              <div className="flex items-center">
                <div className="w-12 md:w-20 lg:w-24 h-0.5 bg-emerald-500/50" />
                <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] lg:border-l-[16px] border-l-emerald-500/50 border-t-[4px] md:border-t-[6px] lg:border-t-[8px] border-t-transparent border-b-[4px] md:border-b-[6px] lg:border-b-[8px] border-b-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible">
        {phases.map((phase, index) => {
          const isCurrentPhase = index === currentPhaseIndex
          return (
            <Card
              key={index}
              className={cn(
                "bg-zinc-900/50 border-zinc-800 rounded-2xl",
                isCurrentPhase && "border-emerald-500 border-2"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                    {phase.label}
                  </CardTitle>
                  {isCurrentPhase && (
                    <span className="text-xs font-medium text-emerald-500">
                      Start here
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-white leading-tight">
                  {phase.theme}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {phase.specificTasks && phase.specificTasks.length > 0 ? (
                  <div>
                    <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-2">
                      Moves You'll Make
                    </div>
                    <ul className="space-y-1.5">
                      {phase.specificTasks.slice(0, 4).map((task, taskIndex) => (
                        <li
                          key={taskIndex}
                          className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
                          <span>{task.replace(/^Task:\s*/i, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : phase.actions && phase.actions.length > 0 ? (
                  <div>
                    <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-2">
                      Moves You'll Make
                    </div>
                    <ul className="space-y-1.5">
                      {phase.actions.slice(0, 4).map((action, actionIndex) => (
                        <li
                          key={actionIndex}
                          className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {phase.deliverables && phase.deliverables.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-2">
                      This Phase's Deliverables
                    </div>
                    <ul className="space-y-1">
                      {phase.deliverables.slice(0, 5).map((deliverable, delIndex) => (
                        <li
                          key={delIndex}
                          className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
