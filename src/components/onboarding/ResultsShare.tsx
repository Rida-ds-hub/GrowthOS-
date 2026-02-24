"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Github, Linkedin, FileText, Globe } from "lucide-react"
import { Logo } from "@/components/logo/Logo"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { GapRadar } from "@/components/dashboard/GapRadar"
import { GapCards } from "@/components/dashboard/GapCards"
import { PlanTimeline } from "@/components/dashboard/PlanTimeline"
import { PromotionNarrative } from "@/components/dashboard/PromotionNarrative"
import { DataSources } from "@/components/dashboard/DataSources"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ResultsShareProps {
  analysisResult: any
  githubData?: string | null
  linkedinData?: string | null
  resumeText?: string | null
  websiteUrl?: string | null
  onSignUp?: () => void
  onViewOnly?: () => void
}

export function ResultsShare({ analysisResult, githubData, linkedinData, resumeText, websiteUrl, onSignUp }: ResultsShareProps) {
  const { data: session } = useSession()
  const router = useRouter()

  // Extract gap analysis data (handle both nested and flat structures)
  const gapAnalysis = analysisResult?.gapAnalysis || analysisResult

  // Save results to sessionStorage for back button navigation
  useEffect(() => {
    if (gapAnalysis && typeof window !== "undefined") {
      const resultsData = {
        gapAnalysis,
        githubData,
        linkedinData,
        resumeText,
        websiteUrl,
        timestamp: Date.now()
      }
      sessionStorage.setItem("growthos_results_cache", JSON.stringify(resultsData))
    }
  }, [gapAnalysis, githubData, linkedinData, resumeText, websiteUrl])


  // Save data when user signs in/up
  useEffect(() => {
    if (session && gapAnalysis) {
      // User just signed in/up, save the results
      const saveResults = async () => {
        try {
          // Get onboarding data from localStorage
          const storedData = localStorage.getItem("growthos_onboarding_data")
          if (storedData) {
            const onboardingData = JSON.parse(storedData)
            const response = await fetch("/api/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentRole: onboardingData.currentRole,
                targetRole: onboardingData.targetRole,
                yearsExp: onboardingData.yearsExp,
                timeline: onboardingData.timeline,
                progressionIntent: onboardingData.progressionIntent,
                websiteUrl: onboardingData.websiteUrl,
                githubDataText: onboardingData.githubDataText || githubData,
                linkedinDataText: onboardingData.linkedinDataText || linkedinData,
                resumeText: onboardingData.resumeText || resumeText,
                gapAnalysis: onboardingData.gapAnalysis || gapAnalysis,
              }),
            })
            
            if (response.ok) {
              // Clear localStorage after successful save
              localStorage.removeItem("growthos_onboarding_data")
              // Redirect to dashboard
              router.push("/dashboard")
            } else {
              console.error("Failed to save results:", await response.text())
            }
          }
        } catch (error) {
          console.error("Failed to save results after sign in:", error)
        }
      }
      saveResults()
    }
  }, [session, gapAnalysis, router, githubData, linkedinData, resumeText])


  // Debug: log the structure to help diagnose issues
  if (typeof window !== "undefined") {
    console.log("ResultsShare - Raw analysisResult:", analysisResult)
    console.log("ResultsShare - Extracted gapAnalysis:", gapAnalysis)
    if (gapAnalysis) {
      console.log("Gap Analysis Structure:", {
        hasDomainScores: !!gapAnalysis.domainScores,
        domainScores: gapAnalysis.domainScores,
        hasGaps: !!gapAnalysis.gaps,
        gapsLength: gapAnalysis.gaps?.length,
        hasPlan: !!gapAnalysis.plan,
        hasPromotionNarrative: !!gapAnalysis.promotionNarrative,
        summary: gapAnalysis.summary?.substring(0, 50),
        readinessScore: gapAnalysis.readinessScore,
      })
    } else {
      console.error("ResultsShare - gapAnalysis is null/undefined!")
    }
  }

  // Download Results handler
  const handleDownloadResults = () => {
    if (!gapAnalysis) return

    // Create a simple text-based PDF content
    const content = `
GAP ANALYSIS REPORT
===================

SUMMARY
${gapAnalysis.summary || "N/A"}

READINESS SCORE: ${gapAnalysis.readinessScore || 0}/100

DOMAIN SCORES
${Object.entries(gapAnalysis.domainScores || {}).map(([domain, score]) => `${domain}: ${score}/100`).join("\n")}

GAP DETAILS
${(gapAnalysis.gaps || []).map((gap: any, idx: number) => `
${idx + 1}. ${gap.domain} (${gap.gap} gap)
   Observation: ${gap.observation}
   Requirement: ${gap.requirement}
   Closing Action: ${gap.closingAction}
`).join("\n")}

90-DAY PLAN
${gapAnalysis.plan?.phase1 ? `
Phase 1 (Days 1-30): ${gapAnalysis.plan.phase1.theme}
${gapAnalysis.plan.phase1.actions.map((a: string) => `  • ${a}`).join("\n")}
` : ""}
${gapAnalysis.plan?.phase2 ? `
Phase 2 (Days 31-60): ${gapAnalysis.plan.phase2.theme}
${gapAnalysis.plan.phase2.actions.map((a: string) => `  • ${a}`).join("\n")}
` : ""}
${gapAnalysis.plan?.phase3 ? `
Phase 3 (Days 61-90): ${gapAnalysis.plan.phase3.theme}
${gapAnalysis.plan.phase3.actions.map((a: string) => `  • ${a}`).join("\n")}
` : ""}

PROMOTION NARRATIVE
${gapAnalysis.promotionNarrative || "N/A"}

Generated by Growth OS
${new Date().toLocaleDateString()}
    `.trim()

    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gap-analysis-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!gapAnalysis) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">No Analysis Data Available</h2>
          <p className="text-zinc-400">The analysis may have failed or data wasn't received properly.</p>
          <p className="text-zinc-500 text-sm">Check browser console (F12) and server terminal for error details</p>
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg text-left">
            <p className="text-xs text-zinc-400 mb-2">Raw data received:</p>
            <pre className="text-xs text-zinc-500 overflow-auto max-h-64">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-emerald-500 text-black hover:bg-emerald-400"
          >
            Retry Analysis
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-[95vw] mx-auto px-6 space-y-8">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/">
            <Logo variant="horizontal" size="header" />
          </Link>
          <Link href="/onboarding">
            <Button
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
            >
              Try Another
            </Button>
          </Link>
        </motion.div>

        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-semibold text-white mb-2">
              Your Gap Analysis Results
            </h2>
            <p className="text-zinc-300">
              Complete analysis of your career readiness
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
            {!session && (
              <Button
                disabled
                className="bg-zinc-800 text-zinc-500 cursor-not-allowed font-semibold opacity-50"
              >
                Sign Up to Save
              </Button>
            )}
            {session && (
              <div className="text-sm text-emerald-400 flex items-center gap-2">
                <span>✓ Results saved to your dashboard</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Data Sources Badge */}
        {(githubData || linkedinData || resumeText || websiteUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <span className="text-sm text-zinc-400">Data sources used:</span>
            {githubData && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Github className="w-3 h-3 mr-1" />
                GitHub
              </Badge>
            )}
            {linkedinData && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Linkedin className="w-3 h-3 mr-1" />
                LinkedIn
              </Badge>
            )}
            {resumeText && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <FileText className="w-3 h-3 mr-1" />
                Resume
              </Badge>
            )}
            {websiteUrl && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Globe className="w-3 h-3 mr-1" />
                Website
              </Badge>
            )}
          </motion.div>
        )}

        {/* Full Results Display */}
        <div className="space-y-8">
          {(githubData || linkedinData || resumeText || websiteUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <DataSources
                githubData={githubData}
                linkedinData={linkedinData}
                resumeText={resumeText}
                websiteUrl={websiteUrl}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SummaryCard gapAnalysis={gapAnalysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GapRadar gapAnalysis={gapAnalysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GapCards gapAnalysis={gapAnalysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PlanTimeline gapAnalysis={gapAnalysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PromotionNarrative gapAnalysis={gapAnalysis} />
          </motion.div>
        </div>

        {/* Free Version CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-zinc-800"
        >
          <div className="text-center space-y-6">
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
            <p className="text-zinc-400 text-lg">
              This is the free version. For more features and to save your results permanently,{" "}
              <Link href="/#pricing" className="text-emerald-400 hover:text-emerald-300 underline">
                sign up
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
