"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignUpModal } from "@/components/auth/SignUpModal"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { GapRadar } from "@/components/dashboard/GapRadar"
import { GapCards } from "@/components/dashboard/GapCards"
import { PlanTimeline } from "@/components/dashboard/PlanTimeline"
import { PromotionNarrative } from "@/components/dashboard/PromotionNarrative"

export default function ViewResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  useEffect(() => {
    // First try to get from URL params
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam))
        setAnalysisData(data.gapAnalysis || data)
        return
      } catch (error) {
        console.error("Failed to parse results data from URL:", error)
      }
    }
    
    // Fallback: try to get from sessionStorage
    try {
      const storedData = sessionStorage.getItem("growthos_view_results")
      if (storedData) {
        const data = JSON.parse(storedData)
        setAnalysisData(data.gapAnalysis || data)
        return
      }
    } catch (error) {
      console.error("Failed to parse results data from storage:", error)
    }
    
    // If no data found, redirect to landing page
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Banner */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Your Gap Analysis Results</h1>
            <p className="text-sm text-zinc-400">One-time view. Sign up to save and access all features.</p>
          </div>
          <Button
            onClick={() => setIsSignUpModalOpen(true)}
            className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
          >
            Sign Up to Save
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SummaryCard gapAnalysis={analysisData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GapRadar gapAnalysis={analysisData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GapCards gapAnalysis={analysisData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PlanTimeline gapAnalysis={analysisData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PromotionNarrative gapAnalysis={analysisData} />
        </motion.div>
      </div>

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        callbackUrl="/dashboard"
      />
    </div>
  )
}
