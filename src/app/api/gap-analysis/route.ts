import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { model } from "@/lib/gemini"
import { buildGapAnalysisPrompt } from "@/lib/prompts"
import { supabase } from "@/lib/supabase"
import { GapAnalysis } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    console.log("API: Gap analysis request received")
    
    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey || geminiApiKey === 'placeholder-key') {
      console.error("API: Gemini API key not configured!")
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to .env.local. Get your key from https://aistudio.google.com/app/apikey" },
        { status: 500 }
      )
    }
    
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email || session?.user?.name || "anonymous"
    console.log("API: User ID:", userId)

    // Rate limiting: check if analysis was run in last 60 minutes (only for authenticated users)
    if (session && userId !== "anonymous") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("updated_at")
        .eq("user_id", userId)
        .single()

      if (profile?.updated_at) {
        const lastUpdate = new Date(profile.updated_at)
        const now = new Date()
        const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000 / 60

        if (minutesSinceUpdate < 60) {
          return NextResponse.json(
            {
              error: "Analysis refreshes every 60 minutes. Your current report is up to date.",
            },
            { status: 429 }
          )
        }
      }
    }

    const body = await request.json()
    const {
      currentRole,
      targetRole,
      yearsExperience,
      timeline,
      githubData,
      resumeText,
      linkedinText,
    } = body

    // Apply input caps as per spec
    const cappedCurrentRole = (currentRole || "").slice(0, 100)
    const cappedTargetRole = (targetRole || "").slice(0, 100)
    const cappedResumeText = (resumeText || "").slice(0, 8000)
    const cappedLinkedinText = (linkedinText || "").slice(0, 8000)
    const cappedGithubData = (githubData || "").slice(0, 4000)

    const prompt = buildGapAnalysisPrompt({
      currentRole: cappedCurrentRole,
      targetRole: cappedTargetRole,
      yearsExperience: yearsExperience || 0,
      timeline: timeline || "",
      githubData: cappedGithubData,
      resumeText: cappedResumeText,
      linkedinText: cappedLinkedinText,
    })

    console.log("API: Calling Gemini API...")
    console.log("API: Prompt length:", prompt.length)
    
    let result
    try {
      // Gemini API call - can accept string directly or use the format below
      result = await model.generateContent(prompt)
      console.log("API: Gemini API call successful")
    } catch (geminiError: any) {
      console.error("API: Gemini API error:", geminiError)
      console.error("API: Gemini error message:", geminiError?.message)
      console.error("API: Gemini error details:", geminiError)
      
      // Check for invalid API key error
      if (geminiError?.message?.includes("API_KEY_INVALID") || geminiError?.status === 401) {
        return NextResponse.json(
          { 
            error: "Invalid Gemini API Key. Please check your GEMINI_API_KEY in .env.local and ensure it's valid. Get your key from https://aistudio.google.com/app/apikey" 
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Gemini API error: ${geminiError?.message || "Unknown error"}` },
        { status: 500 }
      )
    }

    const rawResponse = result.response.text() || "{}"
    console.log("API: Raw response length:", rawResponse.length)
    console.log("API: Raw response preview:", rawResponse.substring(0, 200))
    
    if (!rawResponse || rawResponse === "{}") {
      console.error("API: Empty response from Gemini")
      return NextResponse.json(
        { error: "Empty response from Gemini API" },
        { status: 500 }
      )
    }

    // Strip markdown code fences
    const cleanedResponse = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    let gapAnalysis: GapAnalysis
    try {
      gapAnalysis = JSON.parse(cleanedResponse)
      console.log("API: Successfully parsed gapAnalysis")
      console.log("API: Has domainScores?", !!gapAnalysis.domainScores)
      console.log("API: DomainScores keys:", gapAnalysis.domainScores ? Object.keys(gapAnalysis.domainScores) : "none")
    } catch (parseError) {
      console.error("API: Failed to parse AI response:", parseError)
      console.error("API: Cleaned response:", cleanedResponse)
      return NextResponse.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      )
    }

    // Validate all 5 domainScores keys exist
    const requiredDomains = [
      "System Design Maturity",
      "Execution Scope",
      "Communication & Visibility",
      "Technical Depth",
      "Leadership & Influence",
    ]

    const hasAllDomains = requiredDomains.every(
      (domain) => domain in gapAnalysis.domainScores
    )

    if (!hasAllDomains) {
      return NextResponse.json(
        { error: "Invalid analysis response: missing domain scores" },
        { status: 500 }
      )
    }

    // Save to Supabase (only if authenticated and supabase is configured)
    if (session && userId !== "anonymous" && supabase) {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          user_id: userId,
          gap_analysis: gapAnalysis,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        console.error("Failed to save gap analysis:", updateError)
        // Don't fail the request for unauthenticated users, just log the error
        if (userId !== "anonymous") {
          return NextResponse.json(
            { error: "Failed to save analysis" },
            { status: 500 }
          )
        }
      }
    }

    console.log("API: Returning gapAnalysis response")
    return NextResponse.json({ gapAnalysis })
  } catch (error) {
    console.error("API: Error in gap analysis:", error)
    if (error instanceof Error) {
      console.error("API: Error message:", error.message)
      console.error("API: Error stack:", error.stack)
    }
    return NextResponse.json(
      { error: "Failed to generate gap analysis" },
      { status: 500 }
    )
  }
}
