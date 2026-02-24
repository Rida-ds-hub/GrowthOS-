"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { StepGoal } from "./StepGoal"
import { StepConnect } from "./StepConnect"
import { StepResume } from "./StepResume"
import { AnalysisLoader } from "./AnalysisLoader"
import { ResultsShare } from "./ResultsShare"
import { SignUpModal } from "@/components/auth/SignUpModal"

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
  resumeText?: string
  gapAnalysis?: any
}

const STORAGE_KEY = "growthos_onboarding_data"

export function OnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const isNewAnalysis = searchParams.get("new") === "true"
  
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(() => {
    // If this is a new analysis, don't load any cached data
    if (isNewAnalysis) {
      return {}
    }
    
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return {}
        }
      }
      // Also check sessionStorage for cached results (for back button navigation)
      const cached = sessionStorage.getItem("growthos_results_cache")
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          // Check if cache is less than 1 hour old
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
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(() => {
    // If this is a new analysis, don't show cached results
    if (isNewAnalysis) {
      return false
    }
    
    // Check if we have cached results to show immediately
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("growthos_results_cache")
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          if (Date.now() - cachedData.timestamp < 3600000 && cachedData.gapAnalysis) {
            return true // Show results immediately if cached
          }
        } catch {
          // Ignore cache parse errors
        }
      }
    }
    return false
  })
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data])

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
    linkedinUrl?: string // Deprecated - no longer used
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

    // Start the analysis process
    await runAnalysis(updatedData)
  }

  const runAnalysis = async (analysisData: OnboardingData) => {
    try {
      // Fetch GitHub data if connected (after "Reading GitHub" message shows)
      let githubData = ""
      if (analysisData.githubConnected) {
        try {
          // Wait a bit to match the loading message timing
          await new Promise((resolve) => setTimeout(resolve, 2000))
          
          // Try to fetch GitHub data - either via OAuth or public API
          if (session && (session as any)?.githubAccessToken) {
            // Authenticated: use OAuth endpoint
            const githubResponse = await fetch("/api/github/profile")
            if (githubResponse.ok) {
              const githubResult = await githubResponse.json()
              githubData = githubResult.data || ""
            }
          } else if (analysisData.githubUsername) {
            // Unauthenticated: use public API endpoint
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

      // Wait until "Mapping gaps" message timing (4.8s total)
      await new Promise((resolve) => setTimeout(resolve, 1800))

      // Process LinkedIn data if manually provided (authenticated users only)
      let linkedinText = ""
      if (analysisData.linkedinManualData && session) {
        // Use manual data directly (only for authenticated users)
        setAnalysisStatus("Processing LinkedIn data...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        linkedinText = analysisData.linkedinManualData
      }

      // Fetch website content if URL provided
      let websiteText = ""
      if (analysisData.websiteUrl) {
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
            // Continue without website data if scraping fails
          }
        } catch (err) {
          console.error("Failed to fetch website data:", err)
          // Continue without website data if scraping fails
        }
      }

      // Trigger gap analysis (this happens during "Mapping gaps" message)
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
        
        // Show user-friendly error
        const friendlyMessage = errorMessage.includes("parse") || errorMessage.includes("JSON")
          ? "The analysis completed but there was an issue formatting the results. Please try again - this usually resolves on retry."
          : errorMessage
        
        alert(`Analysis failed: ${friendlyMessage}\n\nIf this persists, check terminal for server logs.`)
        throw new Error(errorMessage)
      }

      const analysisResult = await analysisResponse.json()
      
      // Debug: log the raw API response
      console.log("OnboardingWizard - Raw API response:", analysisResult)
      
      // Store analysis result in data and localStorage
      // The API returns { gapAnalysis: {...} }, so we extract the gapAnalysis
      const gapAnalysisData = analysisResult.gapAnalysis || analysisResult
      
      // Debug: log what we extracted
      console.log("OnboardingWizard - Extracted gapAnalysisData:", gapAnalysisData)
      console.log("OnboardingWizard - Has domainScores?", !!gapAnalysisData?.domainScores)
      console.log("OnboardingWizard - DomainScores:", gapAnalysisData?.domainScores)
      
      const updatedData = { 
        ...analysisData, 
        gapAnalysis: gapAnalysisData,
        githubDataText: githubData || undefined,
        linkedinDataText: linkedinText || undefined,
      }
      setData(updatedData)
      
      // Debug: log the final structure
      console.log("OnboardingWizard - Final updatedData:", updatedData)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
      }

      // Wait a bit more, then redirect to results page
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
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
        
        // Also keep the cache for backward compatibility
        const cacheData = {
          gapAnalysis: gapAnalysisData,
          githubData: githubData || undefined,
          linkedinData: linkedinText || undefined,
          resumeText: updatedData.resumeText || undefined,
          websiteUrl: updatedData.websiteUrl || undefined,
          timestamp: Date.now(),
        }
        sessionStorage.setItem("growthos_results_cache", JSON.stringify(cacheData))
      }
      
      // Stop analyzing and redirect to results page
      setIsAnalyzing(false)
      // Small delay to ensure state updates before redirect
      setTimeout(() => {
        router.push("/results/view")
      }, 100)
      
      // If authenticated, also save to database in background
      if (session) {
        await saveToDatabase(updatedData)
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      // Still show dashboard, user can retry
      if (session) {
        router.push("/dashboard")
      } else {
        setShowSignUpPrompt(true)
      }
    }
  }

  const saveToDatabase = async (analysisData: OnboardingData) => {
    try {
      // Save profile data if authenticated
      if (session) {
        const profileResponse = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentRole: analysisData.currentRole,
            targetRole: analysisData.targetRole,
            yearsExp: analysisData.yearsExp,
            timeline: analysisData.timeline,
            websiteUrl: analysisData.websiteUrl,
            githubDataText: analysisData.githubDataText,
            linkedinDataText: analysisData.linkedinDataText,
            resumeText: analysisData.resumeText,
            gapAnalysis: analysisData.gapAnalysis,
          }),
        })

        // Clear localStorage after successful save
        if (profileResponse.ok && typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error("Failed to save to database:", error)
    }
  }

  const handleSignUpSuccess = async () => {
    // After sign-up, wait a moment for session to be established, then save the stored data to database
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await saveToDatabase(data)
    router.push("/dashboard")
  }

  const handleAnalysisComplete = () => {
    // This is called after the loader animation completes
    // The actual API calls happen in runAnalysis
  }

  if (isAnalyzing && !showSignUpPrompt) {
    return (
      <AnalysisLoader
        onComplete={handleAnalysisComplete}
        targetRole={data.targetRole}
      />
    )
  }

  // Note: Results are now shown on /results/view page, not here
  // This check is kept for backward compatibility with cached results
  if (showSignUpPrompt && data.gapAnalysis) {
    // If we have cached results and user navigated back, redirect to results page
    if (typeof window !== "undefined") {
      const resultsData = {
        gapAnalysis: data.gapAnalysis,
        targetRole: data.targetRole,
        timeline: data.timeline,
        currentRole: data.currentRole,
        yearsExp: data.yearsExp,
        progressionIntent: data.progressionIntent,
        githubData: undefined,
        linkedinData: undefined,
        resumeText: data.resumeText || undefined,
        websiteUrl: data.websiteUrl || undefined,
        generatedAt: new Date().toISOString(),
      }
      sessionStorage.setItem("growthos_view_results", JSON.stringify(resultsData))
      router.push("/results/view")
      return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Progress bar - moved to header */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Spacer for fixed header */}
      <div className="h-4" />

      {/* Step content */}
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

      {/* Sign Up Modal */}
      {showSignUpPrompt && (
        <SignUpModal
          isOpen={showSignUpPrompt}
          onClose={() => setShowSignUpPrompt(false)}
          callbackUrl="/dashboard"
        />
      )}

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
