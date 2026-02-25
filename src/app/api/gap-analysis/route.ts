import { NextRequest, NextResponse } from "next/server"
import { model } from "@/lib/gemini"
import { buildGapAnalysisPrompt } from "@/lib/prompts"
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
      websiteText,
    } = body

    // Apply input caps as per spec
    const cappedCurrentRole = (currentRole || "").slice(0, 100)
    const cappedTargetRole = (targetRole || "").slice(0, 100)
    const cappedResumeText = (resumeText || "").slice(0, 8000)
    const cappedLinkedinText = (linkedinText || "").slice(0, 8000)
    const cappedGithubData = (githubData || "").slice(0, 4000)
    const cappedWebsiteText = (websiteText || "").slice(0, 4000)

    const prompt = buildGapAnalysisPrompt({
      currentRole: cappedCurrentRole,
      targetRole: cappedTargetRole,
      yearsExperience: yearsExperience || 0,
      timeline: timeline || "",
      progressionIntent: progressionIntent || "same_company",
      githubData: cappedGithubData,
      resumeText: cappedResumeText,
      linkedinText: cappedLinkedinText,
      websiteText: cappedWebsiteText,
    })

    console.log("API: Calling Gemini API...")
    console.log("API: Prompt length:", prompt.length)
    
    let result
    try {
      result = await model.generateContent(prompt)
      console.log("API: Gemini API call successful")
    } catch (geminiError: any) {
      console.error("API: Gemini API error:", geminiError)
      console.error("API: Gemini error message:", geminiError?.message)
      
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

    // --- Robust JSON extraction ---
    // Step 1: Strip markdown code fences
    let cleanedResponse = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Step 2: Remove control characters that break JSON (keep \n, \r, \t)
    cleanedResponse = cleanedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Step 3: Extract only the top-level JSON object using brace-depth tracking
    // This handles cases where Gemini appends commentary after the JSON
    function extractJsonObject(str: string): string | null {
      const start = str.indexOf('{')
      if (start === -1) return null
      
      let depth = 0
      let inString = false
      let escaped = false
      
      for (let i = start; i < str.length; i++) {
        const ch = str[i]
        
        if (escaped) {
          escaped = false
          continue
        }
        
        if (ch === '\\' && inString) {
          escaped = true
          continue
        }
        
        if (ch === '"') {
          inString = !inString
          continue
        }
        
        if (inString) continue
        
        if (ch === '{') depth++
        if (ch === '}') {
          depth--
          if (depth === 0) {
            return str.substring(start, i + 1)
          }
        }
      }
      
      return null
    }

    const extractedJson = extractJsonObject(cleanedResponse)
    if (extractedJson) {
      cleanedResponse = extractedJson
      console.log("API: Extracted JSON object, length:", cleanedResponse.length)
    }

    // Step 4: Fix trailing commas (common AI JSON issue)
    for (let i = 0; i < 5; i++) {
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
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
      console.error("API: Cleaned response (first 500 chars):", cleanedResponse.slice(0, 500))
      console.error("API: Cleaned response (last 500 chars):", cleanedResponse.slice(-500))
      
      // Retry: try to strip any remaining non-JSON and re-extract
      try {
        // Remove any remaining control chars including \t and \r that might be in strings
        let repairedJson = cleanedResponse
          .replace(/\t/g, '    ')
          .replace(/\r\n/g, '\\n')
          .replace(/\r/g, '\\n')
        
        // Fix trailing commas again
        for (let i = 0; i < 5; i++) {
          repairedJson = repairedJson.replace(/,(\s*[}\]])/g, '$1')
        }
        
        gapAnalysis = JSON.parse(repairedJson)
        console.log("API: Successfully parsed after repair pass")
      } catch (secondAttemptError) {
        console.error("API: Second parse attempt also failed:", secondAttemptError)
        return NextResponse.json(
          { 
            error: "Failed to parse analysis response. The AI may have returned malformed JSON. Please try again.",
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
