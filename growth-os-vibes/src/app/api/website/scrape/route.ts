import { NextRequest, NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import { websiteScrapeBodySchema, validationErrorResponse } from "@/lib/api-schemas"

export const runtime = "nodejs"

const MAX_WEBSITE_TEXT = 4000
const MIN_RSS_TEXT_TO_USE = 150
const FETCH_OPTIONS = {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; GrowthOS/1.0; +https://growthos.com)" },
  signal: AbortSignal.timeout(10000) as AbortSignal,
}

/** Get RSS or Atom feed URL from HTML (link rel="alternate" type="application/rss+xml" or atom+xml). */
function getFeedUrlFromHtml(html: string, pageUrl: string): string | null {
  const base = (() => {
    try {
      return new URL(pageUrl).origin + "/"
    } catch {
      return ""
    }
  })()
  const linkRegex = /<link[^>]+>/gi
  let m: RegExpExecArray | null
  while ((m = linkRegex.exec(html)) !== null) {
    const tag = m[0]
    const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const type = tag.match(/type\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1]
    if (rel !== "alternate" || !href) continue
    if (type?.includes("rss") || type?.includes("atom+xml")) {
      try {
        return new URL(href, base).href
      } catch {
        continue
      }
    }
  }
  return null
}

/** For *.substack.com, return the canonical feed URL. */
function getSubstackFeedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.endsWith(".substack.com")) {
      return `${u.protocol}//${u.hostname}/feed`
    }
  } catch {
    // ignore
  }
  return null
}

/** Strip HTML tags and decode common entities for plain text. */
function stripHtmlToText(html: string): string {
  let s = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
  return s.replace(/\s+/g, " ").trim()
}

/** Parse RSS or Atom XML and return plain text (titles + descriptions), capped at maxChars. */
function parseFeedToText(feedXml: string, maxChars: number): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
    parseTagValue: false,
  })
  let parsed: Record<string, unknown>
  try {
    parsed = parser.parse(feedXml) as Record<string, unknown>
  } catch {
    return ""
  }
  const parts: string[] = []

  // RSS 2.0: rss.channel.item[] (item can be single object or array)
  const channel = parsed?.rss && typeof parsed.rss === "object" && (parsed.rss as Record<string, unknown>)?.channel
  if (channel && typeof channel === "object") {
    const ch = channel as Record<string, unknown>
    let items = ch.item
    if (!items) items = []
    if (!Array.isArray(items)) items = [items]
    for (const entry of items as Record<string, unknown>[]) {
      if (!entry || typeof entry !== "object") continue
      const title = typeof entry.title === "string" ? entry.title.trim() : ""
      const desc =
        typeof entry.description === "string"
          ? entry.description
          : typeof (entry as Record<string, unknown>)["content:encoded"] === "string"
            ? (entry as Record<string, unknown>)["content:encoded"] as string
            : ""
      if (title) parts.push(title)
      if (desc) parts.push(stripHtmlToText(desc))
    }
  }

  // Atom: feed.entry[] (entry can be single object or array)
  const feed = parsed?.feed && typeof parsed.feed === "object" && (parsed.feed as Record<string, unknown>)
  if (feed && typeof feed === "object") {
    let entries = (feed as Record<string, unknown>).entry
    if (!entries) entries = []
    if (!Array.isArray(entries)) entries = [entries]
    for (const entry of entries as Record<string, unknown>[]) {
      if (!entry || typeof entry !== "object") continue
      let title = ""
      if (typeof entry.title === "string") title = entry.title
      else if (entry.title && typeof entry.title === "object")
        title = String((entry.title as Record<string, unknown>)["#text"] ?? "")
      const summary =
        typeof entry.summary === "string" ? entry.summary : typeof entry.content === "string" ? entry.content : ""
      if (title) parts.push(title)
      if (summary) parts.push(stripHtmlToText(summary))
    }
  }

  const combined = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
  if (combined.length <= maxChars) return combined
  return combined.substring(0, maxChars - 3) + "..."
}

/** Extract text from HTML using existing tag-based + meta logic (unchanged behavior). */
function extractTextFromHtml(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")

  const contentTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th", "span", "div", "article", "section"]
  const textMatches: string[] = []

  for (const tag of contentTags) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")
    let match
    while ((match = regex.exec(text)) !== null) {
      const content = match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      if (content.length > 10) textMatches.push(content)
    }
  }

  const metaRegex = /<meta[^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*content=["']([^"']+)["']/gi
  let metaMatch
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    textMatches.push(metaMatch[1])
  }

  let combinedText = textMatches.join(" ")
  combinedText = combinedText
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
  combinedText = combinedText.replace(/\s+/g, " ").trim()

  if (combinedText.length > MAX_WEBSITE_TEXT) {
    const firstPart = combinedText.substring(0, 2000)
    const lastPart = combinedText.substring(combinedText.length - 2000)
    combinedText = firstPart + " ... " + lastPart
  }
  return combinedText
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return validationErrorResponse("Invalid JSON body")
    }
    const parsed = websiteScrapeBodySchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0]?.message ?? "Invalid request body", parsed.error)
    }
    const { url } = parsed.data
    try {
      const response = await fetch(url, FETCH_OPTIONS)

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch website: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }

      const html = await response.text()

      // Step 2: Try RSS/Atom feed first (from page link or Substack convention)
      let feedUrl = getFeedUrlFromHtml(html, url) ?? getSubstackFeedUrl(url)
      let dataFromFeed = ""

      if (feedUrl) {
        try {
          const feedResponse = await fetch(feedUrl, FETCH_OPTIONS)
          if (feedResponse.ok) {
            const feedXml = await feedResponse.text()
            dataFromFeed = parseFeedToText(feedXml, MAX_WEBSITE_TEXT)
          }
        } catch {
          // Ignore feed fetch/parse errors; fall back to HTML
        }
      }

      const combinedText =
        dataFromFeed.length >= MIN_RSS_TEXT_TO_USE
          ? dataFromFeed
          : extractTextFromHtml(html)

      return NextResponse.json({
        data: combinedText || "No extractable text content found",
        url: url,
      })
    } catch (fetchError: unknown) {
      const err = fetchError as { name?: string; message?: string }
      if (err?.name === "AbortError" || err?.name === "TimeoutError") {
        return NextResponse.json(
          { error: "Request timeout: website took too long to respond" },
          { status: 408 }
        )
      }
      if (err?.message?.includes("fetch failed")) {
        return NextResponse.json(
          { error: "Failed to connect to website. Please check the URL and try again." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Failed to scrape website: ${err?.message || "Unknown error"}` },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error("Website scraping error:", error)
    return NextResponse.json(
      { error: "Failed to process website scraping request" },
      { status: 500 }
    )
  }
}
