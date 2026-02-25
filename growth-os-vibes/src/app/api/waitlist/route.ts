import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { waitlistBodySchema, validationErrorResponse } from "@/lib/api-schemas"

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return validationErrorResponse("Invalid JSON body")
    }
    const parsed = waitlistBodySchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0]?.message ?? "Invalid request body", parsed.error)
    }
    const { email } = parsed.data

    if (!supabase) {
      // If Supabase isn't configured, still return success
      // (the email just won't be persisted)
      console.warn("Supabase not configured — waitlist email not saved:", email)
      return NextResponse.json({ success: true })
    }

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
