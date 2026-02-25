"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GapRadar } from "@/components/dashboard/GapRadar"
import { GapCards } from "@/components/dashboard/GapCards"
import { PlanTimeline } from "@/components/dashboard/PlanTimeline"
import { PromotionNarrative } from "@/components/dashboard/PromotionNarrative"
import { ReadinessScore } from "@/components/dashboard/ReadinessScore"
import { Logo } from "@/components/logo/Logo"
import { ResultsReport } from "@/components/results/ResultsReport"

export default function ViewResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ViewResultsContent />
    </Suspense>
  )
}

function ViewResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<any>(null)

  useEffect(() => {
    // First try to get from URL params
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam))
        setAnalysisData(data)
        return
      } catch (error) {
        console.error("Failed to parse results data from URL:", error)
      }
    }
    
    // Try to get from sessionStorage (primary key)
    try {
      const storedData = sessionStorage.getItem("growthos_view_results")
      if (storedData) {
        const data = JSON.parse(storedData)
        setAnalysisData(data)
        return
      }
    } catch (error) {
      console.error("Failed to parse results data from storage:", error)
    }
    
    // Fallback: try to get from results cache
    try {
      const cachedData = sessionStorage.getItem("growthos_results_cache")
      if (cachedData) {
        const cached = JSON.parse(cachedData)
        if (Date.now() - cached.timestamp < 3600000 && cached.gapAnalysis) {
          const resultsData = {
            gapAnalysis: cached.gapAnalysis,
            targetRole: cached.targetRole,
            timeline: cached.timeline,
            currentRole: cached.currentRole,
            yearsExp: cached.yearsExp,
            progressionIntent: cached.progressionIntent,
            githubData: cached.githubData,
            linkedinData: cached.linkedinData,
            resumeText: cached.resumeText,
            websiteUrl: cached.websiteUrl,
            generatedAt: new Date(cached.timestamp).toISOString(),
          }
          setAnalysisData(resultsData)
          sessionStorage.setItem("growthos_view_results", JSON.stringify(resultsData))
          return
        }
      }
    } catch (error) {
      console.error("Failed to parse cached results data:", error)
    }
    
    console.error("No results data found")
    router.push("/?error=no-results")
  }, [searchParams, router])

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const gapAnalysis = analysisData.gapAnalysis || analysisData
  const readinessScore = gapAnalysis?.readinessScore ?? 0
  const targetRole =
    analysisData.targetRole ||
    gapAnalysis?.targetRole ||
    "Your target role"
  const timeline =
    analysisData.timeline ||
    gapAnalysis?.timeline ||
    ""
  const generatedDate =
    analysisData.generatedAt
      ? new Date(analysisData.generatedAt).toLocaleDateString()
      : new Date().toLocaleDateString()

  const domainScores = gapAnalysis?.domainScores || {}
  const domains = [
    "System Design Maturity",
    "Execution Scope",
    "Communication & Visibility",
    "Technical Depth",
    "Leadership & Influence",
  ]

  const getDomainBadge = (score: number) => {
    if (score >= 70) return { label: "Strong", color: "text-emerald-400", bg: "bg-emerald-500/10" }
    if (score >= 40) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10" }
    return { label: "Needs Work", color: "text-red-400", bg: "bg-red-500/10" }
  }

  const githubData = (analysisData as any).githubData || null
  const linkedinData = (analysisData as any).linkedinData || null
  const resumeText = (analysisData as any).resumeText || null
  const websiteUrl = (analysisData as any).websiteUrl || null

  const handleDownloadResults = () => {
    const reportRoot = document.getElementById("results-report-root")
    if (!reportRoot) return

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Growth OS – Gap Analysis Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <div class="min-h-screen flex justify-center py-10">
    ${reportRoot.outerHTML}
  </div>
</body>
</html>
    `.trim()

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `growthos-gap-analysis-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Hidden report for export */}
      <div className="fixed -left-[10000px] top-0 w-[900px] bg-white text-zinc-900">
        <ResultsReport
          gapAnalysis={gapAnalysis}
          targetRole={targetRole}
          timeline={timeline}
          generatedDate={generatedDate}
          dataSources={{ githubData, linkedinData, resumeText, websiteUrl }}
        />
      </div>

      <div id="results-page" className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Top nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#1e1e1e] bg-[rgba(10,10,10,0.97)] backdrop-blur-xl">
          <Link href="/" className="flex items-center">
            <Logo variant="nav" size="nav" />
          </Link>
          <Button 
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("growthos_onboarding_data")
                sessionStorage.removeItem("growthos_view_results")
                sessionStorage.removeItem("growthos_results_cache")
              }
              router.push("/onboarding?new=true")
            }}
            className="font-mono text-[0.7rem] font-semibold tracking-[0.15em] uppercase bg-emerald-500 text-black hover:bg-emerald-400"
          >
            + New Analysis
          </Button>
        </nav>

        <main className="max-w-5xl md:max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8 md:space-y-10">
        {/* Header + actions */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl font-semibold mb-1">
              Your Gap Analysis Results
            </h1>
            <p className="text-xs md:text-sm text-zinc-400">
              Complete analysis of your career readiness · Generated {generatedDate}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadResults}
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-900 text-xs md:text-sm"
            >
              Download Results
            </Button>
          </div>
        </section>

        {/* Data sources row */}
        <section className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
          <span className="text-zinc-400">Data sources used:</span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              githubData
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border border-zinc-700 bg-zinc-900 text-zinc-400"
            }`}
          >
            ⌥ GitHub{!githubData && " (not provided)"}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              resumeText
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border border-zinc-700 bg-zinc-900 text-zinc-400"
            }`}
          >
            ≡ Resume{!resumeText && " (not provided)"}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              linkedinData
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border border-zinc-700 bg-zinc-900 text-zinc-400"
            }`}
          >
            in LinkedIn{!linkedinData && " (not provided)"}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              websiteUrl
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border border-zinc-700 bg-zinc-900 text-zinc-400"
            }`}
          >
            ⊕ Personal site{!websiteUrl && " (not provided)"}
          </span>
        </section>

        {/* Top grid: radar + score */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-sm font-semibold tracking-[0.18em] uppercase text-zinc-300">
                Gap Analysis
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mb-4">
              Skill dimensions mapped against your target role.
            </p>
            <div className="h-[260px] md:h-[280px] w-full">
              <GapRadar gapAnalysis={gapAnalysis} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-500/60" />
            <div className="font-mono text-5xl md:text-6xl font-bold mb-2 text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              {readinessScore}
            </div>
            <div className="text-[0.65rem] tracking-[0.3em] uppercase text-zinc-500 mb-4">
              Overall Readiness Score
            </div>
            <ReadinessScore score={readinessScore} />
            <div className="mt-4 text-sm text-zinc-300 space-y-1">
              <div>
                <span className="font-semibold text-white">Target:</span>{" "}
                <span>{targetRole}</span>
              </div>
              {timeline && (
                <div className="text-zinc-400 text-xs md:text-sm">
                  Timeline: {timeline}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Summary strip */}
        {gapAnalysis.summary && (
          <section className="bg-[#161616] border border-[#262626] rounded-2xl px-6 py-5">
            <p className="text-sm md:text-[0.85rem] leading-relaxed text-zinc-300">
              {gapAnalysis.summary}
            </p>
          </section>
        )}

        {/* Domain scores row */}
        <section className="space-y-3">
          <h2 className="font-mono text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-zinc-500">
            Score Breakdowns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[1px] bg-[#1f1f1f] border border-[#1f1f1f] rounded-xl overflow-hidden">
            {domains.map((domain) => {
              const score = (domainScores as any)[domain] ?? 0
              const badge = getDomainBadge(score)
              return (
                <div
                  key={domain}
                  className="bg-[#111111] px-4 py-4 flex flex-col items-center text-center gap-2"
                >
                  <div
                    className="font-mono text-2xl md:text-3xl font-semibold"
                    style={{
                      color:
                        badge.label === "Strong"
                          ? "#10b981"
                          : badge.label === "Moderate"
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {score}
                  </div>
                  <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, score))}%`,
                        backgroundColor: badge.label === "Strong" ? "#10b981" : badge.label === "Moderate" ? "#f59e0b" : "#ef4444"
                      }}
                    />
                  </div>
                  <div
                    className={`text-[0.6rem] uppercase tracking-[0.18em] px-2 py-1 rounded-full ${badge.bg} ${badge.color}`}
                  >
                    {badge.label}
                  </div>
                  <div className="text-[0.7rem] text-zinc-400 leading-snug">
                    {domain}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Gap details */}
        <section>
          <GapCards gapAnalysis={gapAnalysis} />
        </section>

        {/* 3-phase plan */}
        <section>
          <PlanTimeline gapAnalysis={gapAnalysis} timeline={timeline} />
        </section>

        {/* Progression story */}
        <section>
          <PromotionNarrative gapAnalysis={gapAnalysis} />
        </section>

        {/* Bottom CTA */}
        <section className="mt-4 mb-6 border border-[#1f1f1f] bg-[#111111] rounded-2xl px-6 py-6 text-center space-y-4">
          <div className="space-y-2 mb-4">
            <p className="text-sm text-zinc-300">
              <span className="text-white font-semibold">Unlock the full Growth OS:</span> Daily micro-learning, living resume updates, meeting second brain, LinkedIn post drafts, and real-time readiness tracking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="font-mono text-[0.78rem] font-semibold tracking-[0.15em] uppercase bg-emerald-500 text-black hover:bg-emerald-400 px-7 py-3"
              onClick={() => router.push("/#access")}
            >
              Join the Waitlist
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadResults}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-mono text-[0.78rem] font-semibold tracking-[0.15em] uppercase px-7 py-3"
            >
              Download Results
            </Button>
          </div>
        </section>
      </main>
      </div>
    </>
  )
}
