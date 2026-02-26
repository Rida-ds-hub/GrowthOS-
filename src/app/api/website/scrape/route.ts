import { NextRequest, NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import * as cheerio from "cheerio"
import { websiteScrapeBodySchema, validationErrorResponse } from "@/lib/api-schemas"

export const runtime = "nodejs"

const MAX_WEBSITE_TEXT = 4000
const MIN_RSS_TEXT_TO_USE = 150
const FETCH_TIMEOUT_MS = 15000
const FETCH_HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; GrowthOS/1.0; +https://growthos.com)" }

function getFetchOptions(): RequestInit {
  return {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) as AbortSignal,
  }
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

/** For substack.com/@username (profile URL), derive feed at username.substack.com/feed. */
function getSubstackFeedUrlFromProfileUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== "substack.com") return null
    const match = u.pathname.match(/^\/@([^/?]+)/)
    if (match) return `https://${match[1]}.substack.com/feed`
  } catch {
    // ignore
  }
  return null
}

/** For medium.com/@username (profile or article), return the profile feed URL. Medium blocks page fetch (403) but feed often works. */
function getMediumFeedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== "medium.com" && !u.hostname.endsWith(".medium.com")) return null
    const match = u.pathname.match(/^\/@([^/?]+)/)
    if (match) return `${u.protocol}//medium.com/feed/@${match[1]}`
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

/** Normalize HTML entity and whitespace for plain text. */
function normalizeText(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Extract text from HTML using a parser: prefer main content, strip nav/footer, keep meta. */
function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html)
  // Remove boilerplate so they don't pollute text
  $("script, style, noscript, nav, header, footer, aside, iframe, form").remove()
  const textParts: string[] = []

  // Meta descriptions (high signal)
  $('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').each((_, el) => {
    const content = $(el).attr("content")
    if (content && content.length > 10) textParts.push(content)
  })

  // Selectors for main content (in order of preference)
  const mainSelectors = [
    "article",
    "main",
    '[role="main"]',
    ".post-content",
    ".article-body",
    ".article-content",
    ".content",
    ".entry-content",
    ".post-body",
    ".page-content",
    ".main-content",
    "#content",
    "#main",
    "[data-content]",
  ]

  let mainText = ""
  for (const sel of mainSelectors) {
    const el = $(sel).first()
    if (el.length) {
      const t = el.text().trim()
      if (t.length > 80) {
        mainText = t
        break
      }
    }
  }

  if (!mainText) {
    // Fallback: collect from semantic text tags (skip nav/footer already removed)
    const tags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th", "blockquote"]
    for (const tag of tags) {
      $(tag).each((_, el) => {
        const t = $(el).text().trim()
        if (t.length > 10) textParts.push(t)
      })
    }
  } else {
    textParts.push(mainText)
  }

  let combinedText = textParts.join(" ")
  combinedText = normalizeText(combinedText)

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
      const response = await fetch(url, getFetchOptions())

      if (!response.ok) {
        // Medium (and some others) block page fetch with 403; try profile feed when applicable
        const mediumFeedUrl = getMediumFeedUrl(url)
        if (mediumFeedUrl && (response.status === 403 || response.status === 401)) {
          try {
            const feedResponse = await fetch(mediumFeedUrl, getFetchOptions())
            if (feedResponse.ok) {
              const feedXml = await feedResponse.text()
              const dataFromFeed = parseFeedToText(feedXml, MAX_WEBSITE_TEXT)
              if (dataFromFeed.length >= MIN_RSS_TEXT_TO_USE) {
                return NextResponse.json({
                  data: dataFromFeed,
                  url: url,
                })
              }
            }
          } catch {
            // fall through to friendly error
          }
        }
        return NextResponse.json(
          {
            data: "",
            url,
            error: `Failed to fetch website: ${response.status} ${response.statusText}`,
            ...(mediumFeedUrl ? { hint: "We tried the feed for this site; it may be temporarily unavailable." } : {}),
          },
          { status: 200 }
        )
      }

      const html = await response.text()

      // Try RSS/Atom feed first (from page link or Substack convention)
      const feedUrl =
        getFeedUrlFromHtml(html, url) ??
        getSubstackFeedUrl(url) ??
        getSubstackFeedUrlFromProfileUrl(url)
      let dataFromFeed = ""

      if (feedUrl) {
        try {
          const feedResponse = await fetch(feedUrl, getFetchOptions())
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
