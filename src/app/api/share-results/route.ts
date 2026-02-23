import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

// Store shared results temporarily (could use Supabase or in-memory cache)
// For MVP, we'll use a simple in-memory store
const shareStore = new Map<string, { data: any; expiresAt: number; viewed: boolean }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisResult, expiresIn = 24 * 60 * 60 * 1000 } = body

    // Generate a unique share ID
    const shareId = crypto.randomBytes(16).toString("hex")
    const expiresAt = Date.now() + expiresIn

    // Store the result
    shareStore.set(shareId, {
      data: analysisResult,
      expiresAt,
      viewed: false,
    })

    // Clean up expired entries periodically
    if (shareStore.size > 100) {
      for (const [id, entry] of shareStore.entries()) {
        if (entry.expiresAt < Date.now()) {
          shareStore.delete(id)
        }
      }
    }

    return NextResponse.json({ shareId })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("id")

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 })
    }

    const entry = shareStore.get(shareId)

    if (!entry) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 })
    }

    if (entry.expiresAt < Date.now()) {
      shareStore.delete(shareId)
      return NextResponse.json({ error: "Share link expired" }, { status: 410 })
    }

    if (entry.viewed) {
      return NextResponse.json({ error: "Share link already viewed" }, { status: 410 })
    }

    // Mark as viewed (one-time use)
    entry.viewed = true

    return NextResponse.json({ data: entry.data })
  } catch (error) {
    console.error("Error retrieving shared result:", error)
    return NextResponse.json(
      { error: "Failed to retrieve shared result" },
      { status: 500 }
    )
  }
}
