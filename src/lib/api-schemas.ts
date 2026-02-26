import { NextResponse } from "next/server"
import { z, type ZodError } from "zod"
import { normalizeWebsiteUrl, isPrivateOrInternalHost } from "@/lib/url-utils"

// --- Schemas ---

export const gapAnalysisBodySchema = z.object({
  currentRole: z.coerce.string().max(100).optional().default(""),
  targetRole: z.coerce.string().max(100).optional().default(""),
  yearsExperience: z.coerce.number().optional().default(0),
  timeline: z.coerce.string().optional().default(""),
  progressionIntent: z
    .enum(["same_company", "new_company", "founder", "pivot"])
    .optional()
    .default("same_company"),
  githubData: z.coerce.string().max(4000).optional().default(""),
  resumeText: z.coerce.string().max(8000).optional().default(""),
  linkedinText: z.coerce.string().max(8000).optional().default(""),
  websiteText: z.coerce.string().max(4000).optional().default(""),
})

export const websiteScrapeBodySchema = z.object({
  url: z
    .string()
    .trim()
    .max(2048, "URL is too long")
    .refine(
      (url) => {
        if (!url) return false
        const normalized = normalizeWebsiteUrl(url)
        try {
          const u = new URL(normalized)
          if (u.protocol !== "http:" && u.protocol !== "https:") return false
          const host = u.hostname.toLowerCase()
          if (
            ["javascript", "data", "vbscript", "file", "localhost", ""].includes(
              host
            )
          )
            return false
          if (isPrivateOrInternalHost(u.hostname)) return false
          return true
        } catch {
          return false
        }
      },
      {
        message:
          "URL not allowed (invalid format or disallowed host, e.g. private/internal)",
      }
    ),
})

export const githubPublicBodySchema = z.object({
  username: z.string().min(1, "GitHub username is required").max(39),
})

export const waitlistBodySchema = z.object({
  email: z.string().email("Invalid email format"),
})

export type GapAnalysisBody = z.infer<typeof gapAnalysisBodySchema>
export type WebsiteScrapeBody = z.infer<typeof websiteScrapeBodySchema>
export type GithubPublicBody = z.infer<typeof githubPublicBodySchema>
export type WaitlistBody = z.infer<typeof waitlistBodySchema>

/** Return a consistent 400 JSON response for validation failures. */
export function validationErrorResponse(
  message: string = "Invalid request body",
  details?: ZodError
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && {
        details: details.flatten().fieldErrors,
      }),
    },
    { status: 400 }
  )
}
