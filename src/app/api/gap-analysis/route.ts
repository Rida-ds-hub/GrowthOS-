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
      progressionIntent,
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
      progressionIntent: progressionIntent || "same_company",
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
    let cleanedResponse = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Fix common JSON issues from AI responses
    // Remove trailing commas before closing braces/brackets (multiple passes for nested structures)
    for (let i = 0; i < 5; i++) {
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
    }
    
    // Fix promotionNarrative if it's incorrectly nested inside plan
    // The issue: "plan": { ... "promotionNarrative": ... } should be "plan": { ... }, "promotionNarrative": ...
    if (cleanedResponse.includes('"plan"') && cleanedResponse.includes('"promotionNarrative"')) {
      // Find the start of promotionNarrative
      const promoStart = cleanedResponse.indexOf('"promotionNarrative"')
      if (promoStart !== -1) {
        // Find the opening quote of the value
        const valueStart = cleanedResponse.indexOf('"', promoStart + '"promotionNarrative"'.length) + 1
        if (valueStart > 0) {
          // Parse the string value manually (handling escaped quotes)
          let valueEnd = valueStart
          let escapeNext = false
          for (let i = valueStart; i < cleanedResponse.length; i++) {
            if (escapeNext) {
              escapeNext = false
              continue
            }
            if (cleanedResponse[i] === '\\') {
              escapeNext = true
              continue
            }
            if (cleanedResponse[i] === '"') {
              valueEnd = i
              break
            }
          }
          
          if (valueEnd > valueStart) {
            const promotionValue = cleanedResponse.substring(valueStart, valueEnd)
            // Remove the incorrectly placed promotionNarrative (including any leading comma/whitespace)
            const promoEnd = valueEnd + 1
            const beforePromo = cleanedResponse.substring(0, promoStart)
            const afterPromo = cleanedResponse.substring(promoEnd)
            // Remove trailing comma if present
            const cleanedBefore = beforePromo.replace(/,\s*$/, '')
            cleanedResponse = cleanedBefore + afterPromo.replace(/^,?\s*/, '')
            
            // Find where plan object ends
            const planStartIdx = cleanedResponse.indexOf('"plan"')
            if (planStartIdx !== -1) {
              let braceCount = 0
              let inString = false
              let escapeNext = false
              let planEndIdx = -1
              
              const planOpenBrace = cleanedResponse.indexOf('{', planStartIdx)
              if (planOpenBrace !== -1) {
                for (let i = planOpenBrace; i < cleanedResponse.length; i++) {
                  const char = cleanedResponse[i]
                  if (escapeNext) {
                    escapeNext = false
                    continue
                  }
                  if (char === '\\') {
                    escapeNext = true
                    continue
                  }
                  if (char === '"') {
                    inString = !inString
                    continue
                  }
                  if (!inString) {
                    if (char === '{') braceCount++
                    if (char === '}') {
                      braceCount--
                      if (braceCount === 0) {
                        planEndIdx = i
                        break
                      }
                    }
                  }
                }
                
                if (planEndIdx !== -1) {
                  // Insert promotionNarrative after plan closes
                  const beforePlan = cleanedResponse.substring(0, planEndIdx + 1)
                  const afterPlan = cleanedResponse.substring(planEndIdx + 1).replace(/^,?\s*/, '')
                  // Properly escape the value
                  const escapedValue = promotionValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
                  cleanedResponse = beforePlan + ', "promotionNarrative": "' + escapedValue + '"' + (afterPlan.startsWith('}') ? '' : ',') + afterPlan
                }
              }
            }
          }
        }
      }
    }

    let gapAnalysis: GapAnalysis
    try {
      gapAnalysis = JSON.parse(cleanedResponse)
      console.log("API: Successfully parsed gapAnalysis")
      console.log("API: Has domainScores?", !!gapAnalysis.domainScores)
      console.log("API: DomainScores keys:", gapAnalysis.domainScores ? Object.keys(gapAnalysis.domainScores) : "none")
    } catch (parseError: any) {
      console.error("API: Failed to parse AI response:", parseError)
      console.error("API: Parse error at position:", parseError.message)
      console.error("API: Cleaned response (last 500 chars):", cleanedResponse.slice(-500))
      
      // Try to extract JSON more aggressively
      try {
        // Find the first { and last } to extract JSON
        const firstBrace = cleanedResponse.indexOf('{')
        const lastBrace = cleanedResponse.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonCandidate = cleanedResponse.substring(firstBrace, lastBrace + 1)
          // Remove trailing commas more aggressively
          const fixedJson = jsonCandidate.replace(/,(\s*[}\]])/g, '$1')
          gapAnalysis = JSON.parse(fixedJson)
          console.log("API: Successfully parsed after aggressive cleanup")
        } else {
          throw new Error("Could not extract JSON structure")
        }
      } catch (secondAttemptError) {
        console.error("API: Second parse attempt also failed:", secondAttemptError)
        console.error("API: Full cleaned response length:", cleanedResponse.length)
        console.error("API: First 1000 chars:", cleanedResponse.substring(0, 1000))
        console.error("API: Last 1000 chars:", cleanedResponse.substring(Math.max(0, cleanedResponse.length - 1000)))
        
        // Try to save the problematic response for debugging
        const errorPosition = parseError.message?.match(/position (\d+)/)?.[1]
        if (errorPosition) {
          const pos = parseInt(errorPosition)
          console.error("API: Error at position", pos)
          console.error("API: Context around error:", cleanedResponse.substring(Math.max(0, pos - 100), pos + 100))
        }
        
        return NextResponse.json(
          { 
            error: "Failed to parse analysis response. The AI may have returned malformed JSON.",
            details: parseError.message,
            responseLength: cleanedResponse.length
          },
          { status: 500 }
        )
      }
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
          // Store source data for display in dashboard
          // Note: github_data might be jsonb in schema, so we use github_data_text
          github_data_text: cappedGithubData || null,
          linkedin_data: cappedLinkedinText || null,
          resume_text: cappedResumeText || null,
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
