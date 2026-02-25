import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!["http:", "https:"].includes(validUrl.protocol)) {
        return NextResponse.json(
          { error: "URL must use http or https protocol" },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Fetch the website content
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GrowthOS/1.0; +https://growthos.com)",
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch website: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }

      const html = await response.text()

      // Extract text content from HTML
      // Remove script and style tags
      let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")

      // Extract text from common content tags
      const contentTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th", "span", "div", "article", "section"]
      const textMatches: string[] = []

      for (const tag of contentTags) {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")
        let match
        while ((match = regex.exec(text)) !== null) {
          const content = match[1]
            .replace(/<[^>]+>/g, " ") // Remove nested tags
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim()
          if (content.length > 10) {
            // Only include substantial content
            textMatches.push(content)
          }
        }
      }

      // Also extract text from meta tags
      const metaRegex = /<meta[^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*content=["']([^"']+)["']/gi
      let metaMatch
      while ((metaMatch = metaRegex.exec(html)) !== null) {
        textMatches.push(metaMatch[1])
      }

      // Combine and clean up
      let combinedText = textMatches.join(" ")

      // Remove HTML entities
      combinedText = combinedText
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&[a-z]+;/gi, " ")

      // Normalize whitespace
      combinedText = combinedText.replace(/\s+/g, " ").trim()

      // Compress to max 4000 characters (matching GitHub data limit)
      if (combinedText.length > 4000) {
        // Try to keep the most important parts (first part + last part)
        const firstPart = combinedText.substring(0, 2000)
        const lastPart = combinedText.substring(combinedText.length - 2000)
        combinedText = firstPart + " ... " + lastPart
      }

      return NextResponse.json({
        data: combinedText || "No extractable text content found",
        url: url,
      })
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError" || fetchError.name === "TimeoutError") {
        return NextResponse.json(
          { error: "Request timeout: website took too long to respond" },
          { status: 408 }
        )
      }
      if (fetchError.message?.includes("fetch failed")) {
        return NextResponse.json(
          { error: "Failed to connect to website. Please check the URL and try again." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Failed to scrape website: ${fetchError.message || "Unknown error"}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Website scraping error:", error)
    return NextResponse.json(
      { error: "Failed to process website scraping request" },
      { status: 500 }
    )
  }
}
