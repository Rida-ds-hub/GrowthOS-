import { NextRequest, NextResponse } from "next/server"
import { fetchGitHubProfileByUsername, fetchGitHubReposByUsername, formatGitHubData } from "@/lib/github"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      )
    }

    console.log(`[GitHub Public API] Fetching data for username: ${username}`)

    // Fetch public GitHub data (no auth required)
    let profile, repos
    try {
      [profile, repos] = await Promise.all([
        fetchGitHubProfileByUsername(username),
        fetchGitHubReposByUsername(username),
      ])
      console.log(`[GitHub Public API] Successfully fetched profile and ${repos?.length || 0} repos`)
    } catch (fetchError: any) {
      console.error("[GitHub Public API] Error fetching from GitHub:", fetchError)
      console.error("[GitHub Public API] Error message:", fetchError?.message)
      console.error("[GitHub Public API] Error stack:", fetchError?.stack)
      
      if (fetchError?.message?.includes('404') || fetchError?.message?.includes('Not Found')) {
        return NextResponse.json(
          { error: `GitHub user "${username}" not found. Please check the username is correct.` },
          { status: 404 }
        )
      }
      
      throw fetchError
    }

    try {
      const formattedData = formatGitHubData(profile, repos || [])
      console.log(`[GitHub Public API] Formatted data length: ${formattedData.length}`)

      // Cap at 4000 characters as per spec
      const cappedData = formattedData.slice(0, 4000)

      return NextResponse.json({ data: cappedData })
    } catch (formatError: any) {
      console.error("[GitHub Public API] Error formatting data:", formatError)
      console.error("[GitHub Public API] Profile data:", JSON.stringify(profile, null, 2))
      console.error("[GitHub Public API] Repos data:", JSON.stringify(repos, null, 2))
      throw formatError
    }
  } catch (error: any) {
    console.error("[GitHub Public API] Error in POST handler:", error)
    console.error("[GitHub Public API] Error message:", error?.message)
    console.error("[GitHub Public API] Error stack:", error?.stack)
    
    return NextResponse.json(
      { 
        error: error?.message || "Failed to fetch GitHub data. Please check the username is correct.",
        details: error?.stack?.substring(0, 200)
      },
      { status: 500 }
    )
  }
}
