# Growth OS

**Product Name:** Growth OS  
**One-line Description:** An AI-powered career progression engine that analyzes your GitHub, resume, and portfolio to generate a personalized gap analysis and 90-day action plan — free, no sign-up required.

**Team Members:**
- Rida Khan — reach.rida.khan@gmail.com

**Live URL:** https://growth-os-lake.vercel.app/  
**GitHub:** https://github.com/Rida-ds-hub/GrowthOS-

---

## Problem Solved

Most tech professionals have ambition but zero architecture for career growth. They guess at which skills to build, when to push for a promotion, and how to make their work visible — and they guess wrong. Growth OS solves this by ingesting real professional data (GitHub repos, resume, portfolio site) and running an AI-powered gap analysis across five career domains: System Design Maturity, Execution Scope, Communication & Visibility, Technical Depth, and Leadership & Influence. It then generates a personalized 90-day roadmap with concrete phase-by-phase actions, upskilling project recommendations, a posting strategy, and a promotion narrative — all downloadable as a report, all completely free. No sign-up or authentication required.

---

## How to Test

1. Go to [https://growth-os-lake.vercel.app/onboarding](https://growth-os-lake.vercel.app/onboarding)
2. Set your current role, target role, and timeline.
3. Enter a public GitHub username (e.g., `rida-ds-hub`).
4. Upload a PDF resume or skip.
5. Click through to run the analysis.
6. View your full results — readiness score, domain breakdowns, gaps, 90-day plan, and promotion narrative.
7. Download the report.

`GEMINI_API_KEY` is set in Vercel. The live analysis flow works end-to-end.

---

## What's Built

Growth OS is a full-stack Next.js application. No authentication required — the entire analysis flow is open.

- **Next.js App Router** — routing, server components, API routes
- **Google Gemini API** — core AI engine for gap analysis and plan generation
- **Supabase** — durable storage for waitlist emails
- **Tailwind CSS** — styling
- **Framer Motion** — animations
- **PDF-Parse** — resume text extraction
- **Custom 3D Graph** — interactive Canvas API visualization on the landing page

See `routes.md` for the full route map and `schema.sql` for the Supabase table definitions.

---

## Architecture Notes

- **No auth required.** The entire product works without sign-up. GitHub data is fetched via public API. Resume is parsed client-to-server. LinkedIn data is manually pasted.
- **Waitlist** emails are collected via `/api/waitlist` and stored in a Supabase `waitlist` table.
- **Accessibility:** `cursor: none` has been removed globally. Interactive elements use `cursor: pointer`. `focus-visible` styles are added. `prefers-reduced-motion` is respected.
