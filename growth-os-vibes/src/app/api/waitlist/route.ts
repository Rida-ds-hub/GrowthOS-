import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (!supabase) {
      // If Supabase isn't configured, still return success
      // (the email just won't be persisted)
      console.warn("Supabase not configured — waitlist email not saved:", email)
      return NextResponse.json({ success: true })
    }

    // Insert email into waitlist table (upsert to avoid duplicates)
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email: email.toLowerCase().trim() },
        { onConflict: "email" }
      )

    if (error) {
      console.error("Error saving waitlist email:", error)
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "You're on the list.",
    })
  } catch (error) {
    console.error("Error processing waitlist request:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
