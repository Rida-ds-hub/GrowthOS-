import { NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdf(buffer)
    const text = data.text.trim()

    // Cap at 8000 characters as per spec
    const cappedText = text.slice(0, 8000)

    return NextResponse.json({ text: cappedText })
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    )
  }
}
