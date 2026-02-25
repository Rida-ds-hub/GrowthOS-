"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { StepGoal } from "./StepGoal"
import { StepConnect } from "./StepConnect"
import { StepResume } from "./StepResume"
import { AnalysisLoader } from "./AnalysisLoader"

interface OnboardingData {
  currentRole?: string
  targetRole?: string
  yearsExp?: number
  timeline?: string
  progressionIntent?: "same_company" | "new_company" | "founder" | "pivot"
  githubConnected?: boolean
  linkedinConnected?: boolean
  websiteUrl?: string
  githubUsername?: string
  githubDataText?: string
  linkedinUrl?: string
  linkedinDataText?: string
  linkedinManualData?: string
  resumeText?: string
  gapAnalysis?: any
}

const STORAGE_KEY = "growthos_onboarding_data"

export function OnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewAnalysis = searchParams.get("new") === "true"
  
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(() => {
    if (isNewAnalysis) return {}
    
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return {}
        }
      }
      const cached = sessionStorage.getItem("growthos_results_cache")
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          if (Date.now() - cachedData.timestamp < 3600000 && cachedData.gapAnalysis) {
            return {
              gapAnalysis: cachedData.gapAnalysis,
              githubDataText: cachedData.githubData,
              linkedinDataText: cachedData.linkedinData,
              resumeText: cachedData.resumeText,
              websiteUrl: cachedData.websiteUrl,
            }
          }
        } catch {
          // Ignore cache parse errors
        }
      }
    }
    return {}
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState("connect")
  const [analysisStatus, setAnalysisStatus] = useState("")

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data])

  // If we already have cached results and this isn't a new analysis, redirect to results
  useEffect(() => {
    if (!isNewAnalysis && data.gapAnalysis) {
      // Check if we have results in sessionStorage
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("growthos_results_cache")
        if (cached) {
          try {
            const cachedData = JSON.parse(cached)
            if (Date.now() - cachedData.timestamp < 3600000 && cachedData.gapAnalysis) {
              router.push("/results/view")
              return
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  }, [isNewAnalysis, data.gapAnalysis, router])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleStep1Continue = (stepData: {
    currentRole: string
    targetRole: string
    yearsExp: number
    timeline: string
    progressionIntent: "same_company" | "new_company" | "founder" | "pivot"
  }) => {
    setData((prev) => ({ ...prev, ...stepData }))
    setCurrentStep(2)
  }

  const handleStep2Continue = (stepData: {
    githubConnected: boolean
    linkedinConnected: boolean
    websiteUrl?: string
    githubUsername?: string
    linkedinManualData?: string
  }) => {
    setData((prev) => ({ ...prev, ...stepData }))
    setCurrentStep(3)
  }

  const handleStep3Continue = async (resumeText: string) => {
    const updatedData = { ...data, resumeText: resumeText || "" }
    setData(updatedData)
    setCurrentStep(4)
    setIsAnalyzing(true)
    await runAnalysis(updatedData)
  }

  const runAnalysis = async (analysisData: OnboardingData) => {
    try {
      setAnalysisStage("connect")

      // Fetch GitHub data if connected
      let githubData = ""
      if (analysisData.githubConnected) {
        setAnalysisStage("github")
        try {
          if (analysisData.githubUsername) {
            const githubResponse = await fetch("/api/github/public", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: analysisData.githubUsername }),
            })
            if (githubResponse.ok) {
              const githubResult = await githubResponse.json()
              githubData = githubResult.data || ""
            }
          }
        } catch (err) {
          console.error("Failed to fetch GitHub data:", err)
        }
      }

      setAnalysisStage("resume")
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Process LinkedIn data if manually provided
      let linkedinText = ""
      if (analysisData.linkedinManualData) {
        setAnalysisStage("linkedin")
        setAnalysisStatus("Processing LinkedIn data...")
        await new Promise((resolve) => setTimeout(resolve, 800))
        linkedinText = analysisData.linkedinManualData
      }

      // Fetch website content if URL provided
      let websiteText = ""
      if (analysisData.websiteUrl) {
        setAnalysisStage("website")
        try {
          setAnalysisStatus("Scraping website content...")
          const websiteResponse = await fetch("/api/website/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: analysisData.websiteUrl }),
          })
          if (websiteResponse.ok) {
            const websiteResult = await websiteResponse.json()
            websiteText = websiteResult.data || ""
          } else {
            console.error("Failed to scrape website:", await websiteResponse.text())
          }
        } catch (err) {
          console.error("Failed to fetch website data:", err)
        }
      }

      setAnalysisStage("ai")

      // Trigger gap analysis
      const analysisResponse = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole: analysisData.currentRole,
          targetRole: analysisData.targetRole,
          yearsExperience: analysisData.yearsExp,
          timeline: analysisData.timeline,
          progressionIntent: analysisData.progressionIntent || "same_company",
          githubData,
          resumeText: analysisData.resumeText || "",
          linkedinText,
          websiteText,
        }),
      })

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text()
        let errorMessage = "Failed to generate gap analysis"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        console.error("Gap analysis API error:", {
          status: analysisResponse.status,
          statusText: analysisResponse.statusText,
          body: errorText,
          parsedError: errorMessage,
        })
        
        const friendlyMessage = errorMessage.includes("parse") || errorMessage.includes("JSON")
          ? "The analysis completed but there was an issue formatting the results. Please try again - this usually resolves on retry."
          : errorMessage
        
        alert(`Analysis failed: ${friendlyMessage}\n\nIf this persists, check terminal for server logs.`)
        throw new Error(errorMessage)
      }

      setAnalysisStage("plan")

      const analysisResult = await analysisResponse.json()
      console.log("OnboardingWizard - Raw API response:", analysisResult)
      
      const gapAnalysisData = analysisResult.gapAnalysis || analysisResult
      console.log("OnboardingWizard - Extracted gapAnalysisData:", gapAnalysisData)
      
      const updatedData = { 
        ...analysisData, 
        gapAnalysis: gapAnalysisData,
        githubDataText: githubData || undefined,
        linkedinDataText: linkedinText || undefined,
      }
      setData(updatedData)
      
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
      }

      // Store complete results data for the results page
      if (typeof window !== "undefined") {
        const resultsData = {
          gapAnalysis: gapAnalysisData,
          targetRole: updatedData.targetRole,
          timeline: updatedData.timeline,
          currentRole: updatedData.currentRole,
          yearsExp: updatedData.yearsExp,
          progressionIntent: updatedData.progressionIntent,
          githubData: githubData || undefined,
          linkedinData: linkedinText || undefined,
          resumeText: updatedData.resumeText || undefined,
          websiteUrl: updatedData.websiteUrl || undefined,
          generatedAt: new Date().toISOString(),
        }
        sessionStorage.setItem("growthos_view_results", JSON.stringify(resultsData))
        
        const cacheData = {
          gapAnalysis: gapAnalysisData,
          targetRole: updatedData.targetRole,
          timeline: updatedData.timeline,
          currentRole: updatedData.currentRole,
          yearsExp: updatedData.yearsExp,
          progressionIntent: updatedData.progressionIntent,
          githubData: githubData || undefined,
          linkedinData: linkedinText || undefined,
          resumeText: updatedData.resumeText || undefined,
          websiteUrl: updatedData.websiteUrl || undefined,
          timestamp: Date.now(),
        }
        sessionStorage.setItem("growthos_results_cache", JSON.stringify(cacheData))
      }

      // Show 100% complete before navigating
      setAnalysisStage("complete")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setIsAnalyzing(false)
      setTimeout(() => {
        router.push("/results/view")
      }, 100)
    } catch (error) {
      console.error("Onboarding error:", error)
      setIsAnalyzing(false)
      setCurrentStep(3) // Go back to resume step so user can retry
    }
  }

  if (isAnalyzing) {
    return (
      <AnalysisLoader
        stage={analysisStage}
        targetRole={data.targetRole}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="h-4" />

      <div className="px-4 pb-20">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <StepGoal onContinue={handleStep1Continue} initialData={data} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <StepConnect onContinue={handleStep2Continue} />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <StepResume onContinue={handleStep3Continue} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 z-40">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                step === currentStep
                  ? "bg-emerald-500 w-8"
                  : step < currentStep
                  ? "bg-emerald-500/50"
                  : "bg-zinc-800"
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}
