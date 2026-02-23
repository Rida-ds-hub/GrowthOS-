"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DomainScoreBreakdown } from "@/lib/types"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Github, Linkedin, FileText, Globe } from "lucide-react"

interface DomainScoreCardProps {
  domain: string
  score: number
  breakdown?: DomainScoreBreakdown
}

export function DomainScoreCard({ domain, score, breakdown }: DomainScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRange = (score: number): "excellent" | "strong" | "moderate" | "needs-improvement" => {
    if (score >= 85) return "excellent"
    if (score >= 70) return "strong"
    if (score >= 50) return "moderate"
    return "needs-improvement"
  }

  const getRangeColor = (range: string) => {
    switch (range) {
      case "excellent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "strong":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "moderate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "needs-improvement":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
  }

  const getRangeLabel = (range: string) => {
    switch (range) {
      case "excellent":
        return "Excellent"
      case "strong":
        return "Strong"
      case "moderate":
        return "Moderate"
      case "needs-improvement":
        return "Needs Improvement"
      default:
        return range
    }
  }

  const range = breakdown?.range || getRange(score)
  const explanation = breakdown?.explanation || `Score of ${score}/100 indicates ${range} performance in this domain.`
  const evidence = breakdown?.evidence || []
  const nextSteps = breakdown?.nextSteps || []

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            {domain}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-white">{score}</div>
            <Badge className={getRangeColor(range)}>
              {getRangeLabel(range)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
        </div>

        {(evidence.length > 0 || nextSteps.length > 0) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show breakdown
              </>
            )}
          </button>
        )}

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            {evidence.length > 0 && (
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                  Evidence
                </div>
                <ul className="space-y-1">
                  {evidence.map((item, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {breakdown?.dataContributions && breakdown.dataContributions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                  Data Contributions
                </div>
                <div className="space-y-2">
                  {breakdown.dataContributions.map((contrib, idx) => {
                    const getIcon = () => {
                      switch (contrib.source) {
                        case "github":
                          return <Github className="w-3 h-3" />
                        case "linkedin":
                          return <Linkedin className="w-3 h-3" />
                        case "resume":
                          return <FileText className="w-3 h-3" />
                        case "website":
                          return <Globe className="w-3 h-3" />
                        default:
                          return null
                      }
                    }
                    return (
                      <div key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                        <div className="text-emerald-400 mt-0.5">{getIcon()}</div>
                        <div className="flex-1">
                          <span className="font-medium text-zinc-200 capitalize">{contrib.source}:</span>{" "}
                          <span>{contrib.contribution}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {nextSteps.length > 0 && (
              <div>
                <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-2">
                  Next Steps
                </div>
                <ul className="space-y-1">
                  {nextSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
