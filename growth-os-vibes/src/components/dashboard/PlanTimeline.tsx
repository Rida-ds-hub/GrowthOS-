"use client"

import { useState } from "react"
import { GapAnalysis } from "@/lib/types"

interface PlanTimelineProps {
  gapAnalysis: GapAnalysis
  timeline?: string
  forceExpanded?: boolean
}

export function PlanTimeline({ gapAnalysis, timeline, forceExpanded = false }: PlanTimelineProps) {
  const [activePhase, setActivePhase] = useState(0)

  const parseMonthsFromTimeline = (value?: string): number => {
    if (!value) return 12
    const match = value.match(/(\d+)/)
    if (!match) return 12
    const months = parseInt(match[1], 10)
    if (!Number.isFinite(months) || months <= 0) return 12
    return Math.min(24, months)
  }

  const totalMonths = parseMonthsFromTimeline(timeline)

  const makeRangeLabel = (start: number, end: number) => {
    if (start === end) return `Month ${start}`
    return `Months ${start}–${end}`
  }

  // Compute phase ranges across totalMonths
  const p1End = Math.max(1, Math.round(totalMonths / 3))
  const p2Start = Math.min(totalMonths, p1End + 1)
  const p2End = Math.max(p2Start, Math.round((2 * totalMonths) / 3))
  const p3Start = Math.min(totalMonths, p2End + 1)
  const p3End = totalMonths

  const phaseRanges = [
    makeRangeLabel(1, p1End),
    makeRangeLabel(p2Start, p2End),
    makeRangeLabel(p3Start, p3End),
  ]

  if (!gapAnalysis || !gapAnalysis.plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
            <span className="w-4 h-px bg-zinc-500"></span>
            Your 3-Phase Plan
          </h2>
        </div>
        <p className="text-zinc-400">No plan data available</p>
      </div>
    )
  }

  const phases = [
    { 
      ...(gapAnalysis.plan.phase1 || { theme: "", actions: [], deliverables: [] }), 
      months: phaseRanges[0],
      num: 1
    },
    { 
      ...(gapAnalysis.plan.phase2 || { theme: "", actions: [], deliverables: [] }), 
      months: phaseRanges[1],
      num: 2
    },
    { 
      ...(gapAnalysis.plan.phase3 || { theme: "", actions: [], deliverables: [] }), 
      months: phaseRanges[2],
      num: 3
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
          <span className="w-4 h-px bg-zinc-500"></span>
          Your 3-Phase Plan
        </h2>
        <span className="text-xs text-emerald-500">
          {totalMonths} month{totalMonths !== 1 ? "s" : ""} · 3 phases
        </span>
      </div>

      {/* Tab Switcher (hidden in export mode) */}
      {!forceExpanded && (
        <div className="grid grid-cols-3 gap-px bg-[#1e1e1e] border border-[#1e1e1e] border-b-0">
          {phases.map((phase, index) => (
            <button
              key={index}
              onClick={() => setActivePhase(index)}
              className={`
                bg-[#111111] px-4 md:px-6 py-4 md:py-5 text-left transition-colors relative
                ${activePhase === index ? "bg-[#161616]" : "hover:bg-[#161616]"}
              `}
            >
              {activePhase === index && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 z-10" />
              )}
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs md:text-sm font-semibold transition-all
                  ${activePhase === index 
                    ? "bg-emerald-500 text-black" 
                    : "bg-[#27272a] text-zinc-500 border border-[#2a2a2a]"
                  }
                `}>
                  {phase.num}
                </div>
                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-zinc-500">
                  {phase.months}
                </div>
              </div>
              <div className={`font-mono text-xs md:text-sm font-semibold leading-snug transition-opacity ${
                activePhase === index ? "opacity-100 text-white" : "opacity-50 text-white"
              }`}>
                {phase.theme || `Phase ${index + 1}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Phase Panel(s) */}
      {phases.map((phase, index) => {
        const visible = forceExpanded || activePhase === index
        if (!visible) return null

        return (
        <div
          key={index}
          className="
            bg-[#161616] border border-[#1e1e1e] p-6 md:p-8 mb-6
          "
        >
          <div className="flex items-start justify-between mb-6 md:mb-7 gap-4">
            <div>
              <div className="text-[0.6rem] tracking-[0.3em] uppercase text-emerald-500 mb-2 flex items-center gap-2">
                <span className="w-3.5 h-px bg-emerald-500"></span>
                Phase {phase.num} · {phase.months}
              </div>
              <div className="font-mono text-lg md:text-xl font-semibold text-white leading-tight">
                {phase.theme || `Phase ${phase.num}`}
              </div>
            </div>
            {index === 0 && (
              <div className="text-[0.62rem] tracking-[0.15em] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 flex-shrink-0">
                Start here
              </div>
            )}
          </div>

          {/* Move Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 md:mb-7">
            {(phase.specificTasks || phase.actions || []).slice(0, 4).map((task: any, taskIndex: number) => {
              // Handle both new structured format and legacy string format
              let emoji = "→"
              let title = "Action"
              let description = ""
              let effort = "medium"
              let timeline = ""
              
              if (typeof task === "object" && task !== null) {
                emoji = task.emoji || "→"
                title = task.title || "Action"
                description = task.description || ""
                effort = task.effort || "medium"
                timeline = task.timeline || ""
              } else {
                // Legacy string format - parse it
                const actionText = String(task).replace(/^Task:\s*/i, '').replace(/^Action:\s*/i, '')
                const verbMatch = actionText.match(/^(\w+)/)
                title = verbMatch ? verbMatch[1] : "Action"
                description = verbMatch ? actionText.substring(verbMatch[0].length).trim() : actionText
                // Try to infer emoji from verb
                emoji = title === "Validate" ? "🎙️" : title === "Build" || title === "Deploy" ? "🚀" : title === "Launch" ? "🌐" : title === "Publish" ? "📣" : title === "Architect" ? "⚙️" : title === "Network" ? "🤝" : title === "Plan" ? "📋" : title === "Test" ? "🧪" : title === "Fundraise" ? "💰" : title === "Pitch" ? "🎤" : title === "Iterate" ? "📊" : "→"
              }
              
              const effortColor = effort === "high" ? "bg-red-500" : effort === "low" ? "bg-emerald-500" : "bg-amber-500"
              const effortLabel = effort === "high" ? "High" : effort === "low" ? "Low" : "Medium"
              
              return (
                <div
                  key={taskIndex}
                  className="bg-[#111111] border border-[#1e1e1e] p-4 md:p-5 flex gap-3 md:gap-4 items-start transition-all hover:border-[#2a2a2a] hover:bg-[#161616] relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  <div className="w-8 h-8 flex-shrink-0 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs md:text-sm font-semibold text-emerald-500 tracking-[0.1em] uppercase mb-1">
                      {title}
                    </div>
                    <div className="text-sm text-zinc-300 leading-relaxed">
                      {description || (typeof task === "string" ? task.replace(/^Task:\s*/i, '').replace(/^Action:\s*/i, '') : "")}
                    </div>
                    <div className="text-[0.62rem] text-zinc-500 mt-2 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${effortColor}`}></span>
                      {effortLabel} effort{timeline ? ` · ${timeline}` : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Deliverables */}
          {phase.deliverables && phase.deliverables.length > 0 && (
            <div className="border-t border-[#1e1e1e] pt-5 md:pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[0.62rem] tracking-[0.3em] uppercase text-zinc-500">
                  Phase deliverables
                </div>
                <div className="text-[0.62rem] text-zinc-500 bg-[#111111] border border-[#1e1e1e] px-2 py-1">
                  {phase.deliverables.length} outputs
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {phase.deliverables.map((deliverable: string, delIndex: number) => (
                  <div
                    key={delIndex}
                    className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-[#111111] border border-[#1e1e1e] text-sm text-zinc-300 leading-relaxed"
                  >
                    <div className="w-4 h-4 flex-shrink-0 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-500 mt-0.5">
                      ✓
                    </div>
                    <span>{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )})}
    </div>
  )
}
