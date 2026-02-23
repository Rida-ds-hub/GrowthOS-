"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GapAnalysis } from "@/lib/types"
import { ChevronDown, ChevronUp } from "lucide-react"

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-4">Gap Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gapAnalysis.gaps.map((gap, index) => {
          const isExpanded = expanded[index]
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
          
          const observationBullets = parseBullets(observationText, 3)
          const requirementBullets = parseBullets(requirementText, 3)
          const closingBullets = parseBullets(closingActionText, 1)

          return (
            <Card
              key={index}
              className="bg-zinc-900/50 border-zinc-800 rounded-2xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white">
                    {gap.domain}
                  </CardTitle>
                  <Badge 
                    className={
                      gap.gap === "high" 
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : gap.gap === "medium"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }
                  >
                    {getGapLabel(gap.gap)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
                    Evidence Shows
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {observationBullets.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-0.5 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                    {observationBullets.hasMore && !isExpanded && (
                      <li className="text-zinc-500 text-xs">
                        +{observationBullets.items.length > 0 
                          ? observationText
                              .split("\n")
                              .map((line) => line.replace(/^[\s\-•]+/, "").trim())
                              .filter(Boolean).length - 3
                          : 0} more
                      </li>
                    )}
                    {isExpanded &&
                      observationText
                        .split("\n")
                        .map((line) => line.replace(/^[\s\-•]+/, "").trim())
                        .filter(Boolean)
                        .slice(3)
                        .map((item, idx) => (
                          <li key={`exp-${idx}`} className="flex items-start gap-2">
                            <span className="text-zinc-500 mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
                    Role Expects
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {requirementBullets.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-0.5 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                    {requirementBullets.hasMore && !isExpanded && (
                      <li className="text-zinc-500 text-xs">
                        +{requirementBullets.items.length > 0
                          ? requirementText
                              .split("\n")
                              .map((line) => line.replace(/^[\s\-•]+/, "").trim())
                              .filter(Boolean).length - 3
                          : 0} more
                      </li>
                    )}
                    {isExpanded &&
                      requirementText
                        .split("\n")
                        .map((line) => line.replace(/^[\s\-•]+/, "").trim())
                        .filter(Boolean)
                        .slice(3)
                        .map((item, idx) => (
                          <li key={`exp-req-${idx}`} className="flex items-start gap-2">
                            <span className="text-zinc-500 mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-1.5">
                    Next Move
                  </div>
                  <div className="text-xs font-medium text-emerald-400">
                    {closingBullets.items.length > 0 ? (
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
                        <span className="leading-relaxed">{closingBullets.items[0]}</span>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{gap.closingAction}</p>
                    )}
                  </div>
                </div>
                {(observationBullets.hasMore || requirementBullets.hasMore) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="w-full text-xs text-zinc-400 hover:text-zinc-300"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        Show full detail
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
