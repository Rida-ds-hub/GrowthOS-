"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Copy, Check, Share2, Download, LogIn } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { GapRadar } from "@/components/dashboard/GapRadar"
import { GapCards } from "@/components/dashboard/GapCards"
import { PlanTimeline } from "@/components/dashboard/PlanTimeline"
import { PromotionNarrative } from "@/components/dashboard/PromotionNarrative"
import { SignInModal } from "@/components/auth/SignInModal"

interface ResultsShareProps {
  analysisResult: any
  onSignUp?: () => void
  onViewOnly?: () => void
}

export function ResultsShare({ analysisResult, onSignUp }: ResultsShareProps) {
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  // Generate a one-time share link
  const generateShareLink = async () => {
    try {
      const response = await fetch("/api/share-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResult,
          expiresIn: 24 * 60 * 60 * 1000, // 24 hours
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const link = `${window.location.origin}/results/${data.shareId}`
        setShareLink(link)
        return link
      }
    } catch (error) {
      console.error("Failed to generate share link:", error)
    }
    return null
  }

  const handleEmailShare = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    setIsSending(true)
    try {
      const link = shareLink || (await generateShareLink())
      if (!link) {
        throw new Error("Failed to generate share link")
      }

      const response = await fetch("/api/share-results/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shareLink: link,
          analysisResult,
        }),
      })

      if (response.ok) {
        alert("Results sent! Check your email.")
        setEmail("")
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      alert("Failed to send email. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink) {
      const link = await generateShareLink()
      if (link) {
        setShareLink(link)
      }
    }

    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Extract gap analysis data (handle both nested and flat structures)
  const gapAnalysis = analysisResult?.gapAnalysis || analysisResult

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

  // PDF Download handler
  const handleDownloadPDF = () => {
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
      <div className="max-w-7xl mx-auto space-y-8">
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
              onClick={handleDownloadPDF}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={() => setIsSignInModalOpen(true)}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            {onSignUp && (
              <Button
                onClick={onSignUp}
                className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
              >
                Sign Up to Save
              </Button>
            )}
          </div>
        </motion.div>

        {/* Full Results Display */}
        <div className="space-y-8">
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

        {/* Sharing Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
            <CardContent className="p-0 space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Share Your Results</h3>
              
              {/* Email Share */}
              <div className="space-y-3">
                <Label className="text-white">Share via Email</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-950 border-zinc-700 focus:border-emerald-500 text-white"
                  />
                  <Button
                    onClick={handleEmailShare}
                    disabled={isSending || !email}
                    className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* One-time Link */}
              <div className="space-y-3">
                <Label className="text-white">One-time View Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareLink || "Click to generate link"}
                    className="bg-zinc-950 border-zinc-700 text-zinc-300"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        {shareLink ? "Copy" : "Generate"}
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-zinc-400">
                  Link expires in 24 hours. Can only be viewed once.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        callbackUrl="/dashboard"
      />
    </div>
  )
}
