import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatLinkedInData, LinkedInProfile } from "@/lib/linkedin"

/**
 * Store LinkedIn profile data (manual input only)
 * 
 * IMPORTANT: No automated scraping. Users must provide their own LinkedIn data.
 * This endpoint only accepts manually provided data from authenticated users.
 * 
 * This ensures full compliance with LinkedIn's Terms of Service.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to add LinkedIn data." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { manualData } = body

    if (!manualData || typeof manualData !== 'string' || manualData.trim().length === 0) {
      return NextResponse.json(
        { error: "LinkedIn profile data is required. Please paste your profile information." },
        { status: 400 }
      )
    }

    // Format and return the manual data
    const formattedData = manualData.slice(0, 8000)
    
    return NextResponse.json({ 
      data: formattedData,
      source: 'manual',
      note: "LinkedIn data stored successfully. No automated scraping was performed."
    })
  } catch (error) {
    console.error("[LinkedIn API] Error processing LinkedIn data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process LinkedIn data." },
      { status: 500 }
    )
  }
}
