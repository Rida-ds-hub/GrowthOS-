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
