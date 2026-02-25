import { NextResponse } from "next/server"
import { z, type ZodError } from "zod"

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
    .url("Invalid URL format")
    .refine((url) => {
      try {
        const u = new URL(url)
        return u.protocol === "http:" || u.protocol === "https:"
      } catch {
        return false
      }
    }, "URL must use http or https protocol"),
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
