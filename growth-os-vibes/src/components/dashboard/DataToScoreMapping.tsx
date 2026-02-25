"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"
import { Github, Linkedin, FileText, Globe } from "lucide-react"

interface DataToScoreMappingProps {
  gapAnalysis: GapAnalysis
  githubData?: string | null
  linkedinData?: string | null
  resumeText?: string | null
  websiteUrl?: string | null
}

export function DataToScoreMapping({ 
  gapAnalysis, 
  githubData, 
  linkedinData, 
  resumeText, 
  websiteUrl 
}: DataToScoreMappingProps) {
  const domains = [
    "System Design Maturity",
    "Execution Scope",
    "Communication & Visibility",
    "Technical Depth",
    "Leadership & Influence",
  ]

  const domainBreakdowns = gapAnalysis?.domainBreakdowns || {}
  const domainScores = gapAnalysis?.domainScores || {}

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "github":
        return <Github className="w-4 h-4" />
      case "linkedin":
        return <Linkedin className="w-4 h-4" />
      case "resume":
        return <FileText className="w-4 h-4" />
      case "website":
        return <Globe className="w-4 h-4" />
      default:
        return null
    }
  }

  const getSourceName = (source: string) => {
    switch (source) {
      case "github":
        return "GitHub"
      case "linkedin":
        return "LinkedIn"
      case "resume":
        return "Resume"
      case "website":
        return "Website"
      default:
        return source
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "medium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "low":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
  }

  const hasData = (source: string) => {
    switch (source) {
      case "github":
        return !!githubData
      case "linkedin":
        return !!linkedinData
      case "resume":
        return !!resumeText
      case "website":
        return !!websiteUrl
      default:
        return false
    }
  }

  // Infer data contributions if AI didn't provide them
  const inferContribution = (domain: string, source: string): string | null => {
    if (!hasData(source)) return null

    const domainLower = domain.toLowerCase()
    
    if (source === "github") {
      if (domainLower.includes("technical") || domainLower.includes("system design")) {
        return "Repository analysis shows technical depth and system design patterns"
      }
      if (domainLower.includes("execution")) {
        return "Project portfolio demonstrates execution scope and delivery capability"
      }
    }
    
    if (source === "linkedin") {
      if (domainLower.includes("leadership") || domainLower.includes("influence")) {
        return "Professional experience and team leadership roles contribute to this score"
      }
      if (domainLower.includes("communication")) {
        return "Professional background and visibility contribute to communication score"
      }
    }
    
    if (source === "resume") {
      if (domainLower.includes("technical")) {
        return "Resume content demonstrates technical skills and experience"
      }
      if (domainLower.includes("execution")) {
        return "Resume shows project execution and impact delivery"
      }
    }

    return `${getSourceName(source)} data was analyzed and contributed to this domain score`
  }

  // Get available data sources
  const availableSources = [
    githubData && "github",
    linkedinData && "linkedin",
    resumeText && "resume",
    websiteUrl && "website",
  ].filter(Boolean) as string[]

  if (availableSources.length === 0) {
    return null
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white">
          How Your Data Contributes to Scores
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-2">
          See how each data source (GitHub, LinkedIn, Resume) influences your domain scores.
        </p>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {domains.map((domain) => {
          const breakdown = domainBreakdowns[domain as keyof typeof domainBreakdowns]
          const score = domainScores[domain as keyof typeof domainScores] || 0
          const contributions = breakdown?.dataContributions || []

          // If no explicit contributions, infer from available data
          const displayContributions = contributions.length > 0 
            ? contributions 
            : availableSources.map(source => ({
                source: source as "github" | "linkedin" | "resume" | "website",
                contribution: inferContribution(domain, source) || `${getSourceName(source)} data analyzed`,
                impact: "medium" as const
              })).filter(c => c.contribution)

          if (displayContributions.length === 0) {
            return null
          }

          return (
            <div key={domain} className="border-b border-zinc-800 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{domain}</h3>
                <div className="text-2xl font-bold text-emerald-400">{score}</div>
              </div>

              <div className="space-y-3">
                {displayContributions.map((contrib, idx) => {
                  const hasSourceData = hasData(contrib.source)
                  if (!hasSourceData) return null

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                            {getSourceIcon(contrib.source)}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {getSourceName(contrib.source)}
                          </span>
                        </div>
                        <Badge className={getImpactColor(contrib.impact)}>
                          {contrib.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed ml-9">
                        {contrib.contribution}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
