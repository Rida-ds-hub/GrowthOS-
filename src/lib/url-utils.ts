/**
 * Ensures a website URL has a protocol so it passes validation and fetch works.
 * Does not validate full URL format; use with schema validation when needed.
 */
export function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

/** Max length for website URL input (scheme + host + path). */
export const MAX_WEBSITE_URL_LENGTH = 2048

/** Hostnames that must not be used (scheme-like or local). */
const DANGEROUS_HOSTS = new Set([
  "javascript",
  "data",
  "vbscript",
  "file",
  "localhost",
  "",
])

/**
 * Returns true if hostname is private/internal (SSRF risk).
 * Covers localhost, IPv4 private ranges, and IPv6 loopback.
 */
export function isPrivateOrInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === "localhost" || h === "0.0.0.0") return true
  if (h === "::1" || h === "[::1]" || h === "ip6-loopback") return true
  // IPv4: 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
  const ipv4 =
    /^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.|^169\.254\.|^0\.0\.0\.0$/
  if (ipv4.test(h)) return true
  const ipv6Loopback = /^\[?::1\]?$|^fe80:/i.test(h)
  return ipv6Loopback
}

/**
 * Returns true if the URL is safe for opening (e.g. in a new tab).
 * Use for client-side only; server also enforces private-host blocking.
 */
export function isSafeWebsiteUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed || trimmed.length > MAX_WEBSITE_URL_LENGTH) return false
  try {
    const normalized = normalizeWebsiteUrl(trimmed)
    const u = new URL(normalized)
    if (u.protocol !== "http:" && u.protocol !== "https:") return false
    const host = u.hostname.toLowerCase()
    if (DANGEROUS_HOSTS.has(host)) return false
    return true
  } catch {
    return false
  }
}
