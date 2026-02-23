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

    // Fetch public GitHub data (no auth required)
    const [profile, repos] = await Promise.all([
      fetchGitHubProfileByUsername(username),
      fetchGitHubReposByUsername(username),
    ])

    const formattedData = formatGitHubData(profile, repos)

    // Cap at 4000 characters as per spec
    const cappedData = formattedData.slice(0, 4000)

    return NextResponse.json({ data: cappedData })
  } catch (error) {
    console.error("Error fetching public GitHub data:", error)
    return NextResponse.json(
      { error: "Failed to fetch GitHub data. Please check the username is correct." },
      { status: 500 }
    )
  }
}
