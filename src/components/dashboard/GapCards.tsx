"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"
import { ChevronDown } from "lucide-react"

interface GapCardsProps {
  gapAnalysis: GapAnalysis
}

export function GapCards({ gapAnalysis }: GapCardsProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  if (!gapAnalysis || !gapAnalysis.gaps || gapAnalysis.gaps.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Gap Details</h2>
        <p className="text-zinc-400">No gap details available</p>
      </div>
    )
  }

  const parseBullets = (text: string, maxItems = 3): { items: string[]; hasMore: boolean } => {
    // Handle cases where text might not be a string
    if (!text || typeof text !== "string") {
      return { items: [], hasMore: false }
    }

    const bullets = text
      .split("\n")
      .map((line) => line.replace(/^[\s\-•]+/, "").trim())
      .filter(Boolean)

    return {
      items: bullets.slice(0, maxItems),
      hasMore: bullets.length > maxItems,
    }
  }

  const getGapLabel = (gap: string) => {
    switch (gap) {
      case "high": return "High Gap"
      case "medium": return "Moderate Gap"
      case "low": return "Low Gap"
      default: return gap
    }
  }

  const getGapSeverity = (gap: string) => {
    if (gap === "high") return "high"
    if (gap === "medium") return "mod"
    return "low"
  }

  const getGapScore = (domain: string) => {
    const domainScores = gapAnalysis?.domainScores || {}
    return (domainScores as any)[domain] || 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
          <span className="w-4 h-px bg-zinc-500"></span>
          Gap Details
        </h2>
        <span className="text-xs text-zinc-500">Click any row to expand</span>
      </div>
      <div className="flex flex-col gap-2">
        {gapAnalysis.gaps.map((gap, index) => {
          const isExpanded = expanded[index]
          const severity = getGapSeverity(gap.gap)
          const score = getGapScore(gap.domain)
          
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
                ${severity === "high" ? "hover:border-red-500/30" : severity === "mod" ? "hover:border-amber-500/30" : "hover:border-emerald-500/30"}
              `}
            >
              <div
                className="flex items-center gap-4 px-4 md:px-5 py-4 cursor-pointer hover:bg-[#161616] transition-colors select-none"
                onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
              >
                <div className={`w-0.5 h-8 rounded-full flex-shrink-0 ${
                  severity === "high" ? "bg-red-500" : severity === "mod" ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                <div className="font-mono text-sm md:text-base font-semibold text-white flex-1">
                  {gap.domain}
                </div>
                <div className="text-xs md:text-sm italic text-zinc-400 flex-2 hidden md:block">
                  {(gap as any).title || observationText.split("\n")[0]?.substring(0, 60)}...
                </div>
                <Badge 
                  className={`text-[0.58rem] tracking-[0.15em] uppercase px-2 py-1 flex-shrink-0 ${
                    severity === "high"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : severity === "mod"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {getGapLabel(gap.gap)}
                </Badge>
                <div className={`font-mono text-sm md:text-base font-semibold flex-shrink-0 min-w-[36px] text-right ${
                  severity === "high" ? "text-red-500" : severity === "mod" ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {score}
                </div>
                <div className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
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
                      {closingActionText.split("\n")[0]?.replace(/^[\s\-•→]+/, "").trim() || gap.closingAction}
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
