"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"
import { ChevronDown } from "lucide-react"

interface GapCardsProps {
  gapAnalysis: GapAnalysis
  forceExpanded?: boolean
}

export function GapCards({ gapAnalysis, forceExpanded = false }: GapCardsProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  if (!gapAnalysis || !gapAnalysis.domainScores) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Gap Details</h2>
        <p className="text-zinc-400">No gap details available</p>
      </div>
    )
  }

  // Define all 5 domains in order
  const allDomains = [
    "System Design Maturity",
    "Execution Scope",
    "Communication & Visibility",
    "Technical Depth",
    "Leadership & Influence",
  ]

  // Get score-based badge (matching Score Breakdowns logic)
  const getDomainBadge = (score: number) => {
    if (score >= 70) {
      return { label: "STRONG", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", scoreColor: "#10b981" }
    } else if (score >= 40) {
      return { label: "MODERATE", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", scoreColor: "#f59e0b" }
    } else {
      return { label: "NEEDS WORK", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", scoreColor: "#ef4444" }
    }
  }

  // Create gap entries for all domains, using LLM gaps where available
  const gapsMap = new Map<string, typeof gapAnalysis.gaps[0]>()
  if (gapAnalysis.gaps) {
    gapAnalysis.gaps.forEach((gap) => {
      gapsMap.set(gap.domain, gap)
    })
  }

  // Build complete gaps array for all 5 domains
  const allGaps = allDomains.map((domain) => {
    const score = (gapAnalysis.domainScores as any)[domain] || 0
    const badge = getDomainBadge(score)
    const existingGap = gapsMap.get(domain)

    // If LLM provided gap data, use it; otherwise create minimal entry
    return {
      domain,
      score,
      badge,
      title: existingGap?.title || `${badge.label === "STRONG" ? "Strong" : badge.label === "MODERATE" ? "Moderate" : "Needs improvement"} in ${domain.split(" ")[0]}`,
      observation: existingGap?.observation || "No detailed gap analysis available for this domain.",
      requirement: existingGap?.requirement || "Target role requires proficiency in this domain.",
      closingAction: existingGap?.closingAction || "Focus on building skills in this area.",
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
          <span className="w-4 h-px bg-zinc-500"></span>
          Gap Details
        </h2>
        {!forceExpanded && (
          <span className="text-xs text-zinc-500">Click any row to expand</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {allGaps.map((gap, index) => {
          const isExpanded = forceExpanded || expanded[index]
          const badge = gap.badge
          
          // Ensure values are strings (handle arrays or other types)
          const observationText = Array.isArray(gap.observation) 
            ? gap.observation.join("\n") 
            : String(gap.observation || "")
          const requirementText = Array.isArray(gap.requirement)
            ? gap.requirement.join("\n")
            : String(gap.requirement || "")
          const closingActionText = Array.isArray(gap.closingAction)
            ? gap.closingAction.join("\n")
            : String(gap.closingAction || "")

          return (
            <div
              key={index}
              className={`
                border border-[#1e1e1e] bg-[#111111] overflow-hidden transition-all
                ${badge.label === "NEEDS WORK" ? "hover:border-red-500/30" : badge.label === "MODERATE" ? "hover:border-amber-500/30" : "hover:border-emerald-500/30"}
              `}
            >
              <div
                className={`flex items-center gap-4 px-4 md:px-5 py-4 transition-colors select-none ${
                  forceExpanded ? "" : "cursor-pointer hover:bg-[#161616]"
                }`}
                onClick={
                  forceExpanded
                    ? undefined
                    : () => setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))
                }
              >
                <div 
                  className="w-0.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: badge.scoreColor }}
                />
                <div className="font-mono text-sm md:text-base font-semibold text-white flex-1">
                  {gap.domain}
                </div>
                <div className="text-xs md:text-sm italic text-zinc-400 flex-2 hidden md:block">
                  {gap.title?.substring(0, 60)}...
                </div>
                <Badge 
                  className={`text-[0.58rem] tracking-[0.15em] uppercase px-2 py-1 flex-shrink-0 ${badge.bg} ${badge.color} border ${badge.border}`}
                >
                  {badge.label}
                </Badge>
                <div 
                  className="font-mono text-sm md:text-base font-semibold flex-shrink-0 min-w-[36px] text-right"
                  style={{ color: badge.scoreColor }}
                >
                  {gap.score}
                </div>
                {!forceExpanded && (
                  <div className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className={`overflow-hidden transition-all ${
                isExpanded ? "max-h-[600px] pb-5" : "max-h-0"
              }`}>
                <div className="px-4 md:px-5 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-[0.62rem] tracking-[0.25em] uppercase text-zinc-500 mb-3 pb-2 border-b border-[#1e1e1e]">
                        Evidence Shows
                      </div>
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {observationText.split("\n").filter(Boolean).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-zinc-500 mt-1 flex-shrink-0">·</span>
                            <span className="leading-relaxed">{item.replace(/^[\s\-•]+/, "").trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[0.62rem] tracking-[0.25em] uppercase text-zinc-500 mb-3 pb-2 border-b border-[#1e1e1e]">
                        Role Expects
                      </div>
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {requirementText.split("\n").filter(Boolean).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-zinc-500 mt-1 flex-shrink-0">·</span>
                            <span className="leading-relaxed">{item.replace(/^[\s\-•]+/, "").trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-emerald-500/10 border-l-2 border-emerald-500">
                    <div className="text-[0.6rem] tracking-[0.25em] uppercase text-emerald-500 opacity-70 mb-2">
                      Next Move
                    </div>
                    <div className="text-sm text-emerald-400 leading-relaxed">
                      {closingActionText.split("\n")[0]?.replace(/^[\s\-•→]+/, "").trim() || "Focus on building skills in this area."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
