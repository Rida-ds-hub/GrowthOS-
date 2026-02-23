"use client"

import { GapAnalysis } from "@/lib/types"
import { DomainScoreCard } from "./DomainScoreCard"

interface DomainBreakdownsProps {
  gapAnalysis: GapAnalysis
}

export function DomainBreakdowns({ gapAnalysis }: DomainBreakdownsProps) {
  const domains = [
    "System Design Maturity",
    "Execution Scope",
    "Communication & Visibility",
    "Technical Depth",
    "Leadership & Influence",
  ]

  const domainScores = gapAnalysis?.domainScores || {}
  const domainBreakdowns = gapAnalysis?.domainBreakdowns || {}

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Score Breakdowns</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Detailed explanations for each domain score, evidence from your profile, and specific next steps.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((domain) => {
          const score = domainScores[domain as keyof typeof domainScores] || 0
          const breakdown = domainBreakdowns[domain as keyof typeof domainBreakdowns]
          return (
            <div
              key={domain}
              id={`domain-${domain.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <DomainScoreCard
                domain={domain}
                score={score}
                breakdown={breakdown}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
