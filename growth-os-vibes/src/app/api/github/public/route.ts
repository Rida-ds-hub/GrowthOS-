import { NextRequest, NextResponse } from "next/server"
import {
  fetchGitHubProfileByUsername,
  fetchGitHubReposByUsername,
  formatGitHubData,
  GitHubRateLimitError,
} from "@/lib/github"
import { githubPublicBodySchema, validationErrorResponse } from "@/lib/api-schemas"

export const runtime = "nodejs"

// In-memory cache for recent usernames to reduce GitHub API fetches.
// Vercel KV can be added for serverless persistence across instances.
const GITHUB_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const githubCache = new Map<
  string,
  { data: string; timestamp: number }
>()

function getCachedGitHubData(username: string): string | null {
  const entry = githubCache.get(username.toLowerCase())
  if (!entry || Date.now() - entry.timestamp > GITHUB_CACHE_TTL_MS) return null
  return entry.data
}

function setCachedGitHubData(username: string, data: string) {
  githubCache.set(username.toLowerCase(), { data, timestamp: Date.now() })
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return validationErrorResponse("Invalid JSON body")
    }
    const parsed = githubPublicBodySchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0]?.message ?? "Invalid request body", parsed.error)
    }
    const { username } = parsed.data

    console.log(`[GitHub Public API] Fetching data for username: ${username}`)

    const cached = getCachedGitHubData(username)
    if (cached !== null) {
      console.log(`[GitHub Public API] Cache hit for ${username}`)
      return NextResponse.json({ data: cached })
    }

    // Fetch public GitHub data (no auth required)
    let profile, repos
    try {
      [profile, repos] = await Promise.all([
        fetchGitHubProfileByUsername(username),
        fetchGitHubReposByUsername(username),
      ])
      console.log(`[GitHub Public API] Successfully fetched profile and ${repos?.length || 0} repos`)
    } catch (fetchError: unknown) {
      console.error("[GitHub Public API] Error fetching from GitHub:", fetchError)
      if (fetchError instanceof GitHubRateLimitError) {
        return NextResponse.json(
          {
            error: fetchError.message,
            retryAfterSeconds: fetchError.retryAfterSeconds,
          },
          { status: 503 }
        )
      }
      const err = fetchError as { message?: string }
      if (err?.message?.includes("404") || err?.message?.includes("Not Found")) {
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
      setCachedGitHubData(username, cappedData)

      return NextResponse.json({ data: cappedData })
    } catch (formatError: any) {
      console.error("[GitHub Public API] Error formatting data:", formatError?.message)
      if (process.env.NODE_ENV !== "production") {
        console.error("[GitHub Public API] Profile data:", JSON.stringify(profile, null, 2))
        console.error("[GitHub Public API] Repos data:", JSON.stringify(repos, null, 2))
      } else {
        console.error("[GitHub Public API] Profile keys:", profile ? Object.keys(profile) : "none", "reposCount:", Array.isArray(repos) ? repos.length : 0)
      }
      throw formatError
    }
  } catch (error: unknown) {
    console.error("[GitHub Public API] Error in POST handler:", error)
    const err = error as { message?: string; stack?: string }
    return NextResponse.json(
      {
        error: err?.message || "Failed to fetch GitHub data. Please check the username is correct.",
        details: err?.stack?.substring(0, 200),
      },
      { status: 500 }
    )
  }
}
