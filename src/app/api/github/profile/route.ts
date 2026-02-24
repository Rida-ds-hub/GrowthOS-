import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchGitHubProfile, fetchGitHubRepos, formatGitHubData } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const githubToken = (session as any).githubAccessToken
    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 400 }
      )
    }

    const [profile, repos] = await Promise.all([
      fetchGitHubProfile(githubToken),
      fetchGitHubRepos(githubToken),
    ])

    const formattedData = formatGitHubData(profile, repos)

    // Cap at 4000 characters as per spec
    const cappedData = formattedData.slice(0, 4000)

    return NextResponse.json({ data: cappedData })
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    )
  }
}
