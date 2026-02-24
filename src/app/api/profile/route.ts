import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user?.email || session.user?.name || "unknown"
    const body = await request.json()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const { error } = await supabase.from("profiles").upsert({
      user_id: userId,
      email: session.user?.email || null,
      name: session.user?.name || null,
      avatar_url: session.user?.image || null,
      current_role: body.currentRole || null,
      target_role: body.targetRole || null,
      years_exp: body.yearsExp || null,
      timeline: body.timeline || null,
      website_url: body.websiteUrl || null,
      github_data_text: body.githubDataText || null,
      linkedin_data: body.linkedinDataText || null,
      resume_text: body.resumeText || null,
      gap_analysis: body.gapAnalysis || null,
      onboarding_complete: body.gapAnalysis ? true : false,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Failed to save profile:", error)
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving profile:", error)
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    )
  }
}
