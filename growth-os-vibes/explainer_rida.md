# Growth OS

**Product Name:** Growth OS  
**One-line Description:** An AI-powered career progression engine that analyzes your GitHub, resume, and portfolio to generate a personalized gap analysis and 90-day action plan — free, no sign-up required.

**Team Members:**
- Rida Khan — reach.rida.khan@gmail.com

**Live URL:** https://growth-os-lake.vercel.app/  
**GitHub:** https://github.com/Rida-ds-hub/GrowthOS-
**Demo Loom Video:** https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd

---

## Problem Solved

Most tech professionals have ambition but zero architecture for career growth. They guess at which skills to build, when to push for a promotion, and how to make their work visible — and they guess wrong. Growth OS solves this by ingesting real professional data (GitHub repos, resume, portfolio site) and running an AI-powered gap analysis across five career domains: System Design Maturity, Execution Scope, Communication & Visibility, Technical Depth, and Leadership & Influence. It then generates a personalized 90-day roadmap with concrete phase-by-phase actions, upskilling project recommendations, a posting strategy, and a promotion narrative — all downloadable as a report, all completely free. No sign-up or authentication required.

---

## How to Test (End-to-End)

1. Go to [https://growth-os-lake.vercel.app/onboarding](https://growth-os-lake.vercel.app/onboarding)
2. Set your current role, target role, and timeline.
3. Enter a public GitHub username (e.g., `rida-ds-hub`).
4. Upload a PDF resume or skip.
5. Click through to run the analysis.
6. Watch the cinematic "Mission Control" analysis loader — the 3D graph lights up as data sources connect, chaos questions resolve into signals, and domain bars animate in real time.
7. View your full results — readiness score, domain breakdowns, gaps, 90-day plan, and promotion narrative.
8. Download the report.

**`GEMINI_API_KEY` is set in Vercel.** The live analysis flow works end-to-end — the core feature does not 500.

**For judges:** To verify the live flow, ensure `GEMINI_API_KEY` is set in the Vercel project (Project → Settings → Environment Variables). Then open [https://growth-os-lake.vercel.app/onboarding](https://growth-os-lake.vercel.app/onboarding), use test GitHub username **`rida-ds-hub`**, and optionally upload any small PDF resume (&lt; 5 MB) or skip that step. A successful run shows the results page with readiness score and 90-day plan. If the key is missing, `/api/gap-analysis` returns a clear 500 with instructions to set the key.

**Runtime and config:** API routes that use `pdf-parse` or heavy Node APIs declare `export const runtime = "nodejs"` (parse-resume, website/scrape, gap-analysis, github/public). Deployment uses Node 18.x (Vercel default). No extra build flags; env vars: `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## What's Built

Growth OS is a full-stack Next.js application. No authentication required — the entire analysis flow is open.

- **Next.js App Router** — routing, server components, API routes
- **Google Gemini 2.5 Flash** — core AI engine with JSON output mode enabled (`responseMimeType: 'application/json'`)
- **Supabase** — durable storage for waitlist emails (RLS enabled, service-role only)
- **Tailwind CSS** — styling
- **Framer Motion** — animations and transitions
- **PDF-Parse** — resume text extraction
- **Custom 3D Graph (Canvas API)** — interactive visualization on both the landing page hero and the analysis loader, with dynamic node brightness tied to real-time analysis progress
- **Cinematic Analysis Loader** — a full-screen "Mission Control" experience during AI processing, featuring:
  - 3D graph that progressively lights up as data sources connect
  - Terminal log with real-time stage progression
  - "Chaos → Signal" center panel: career doubts resolve into quantified answers
  - Five-domain skill bars with wave animations during the AI phase
  - Asymptotic progress curve that never stalls, even during long LLM calls
  - Footer stats strip showing sources connected, nodes mapped, gaps found, and elapsed time
  - Cycling motivational insights to maintain engagement

See `ROUTES.txt` for the routes index (submission artifact) and `routes.md` for the full route map; `schema.sql` for the Supabase table definition (waitlist only; no profiles or feedback tables in this build).

---

## Architecture Notes

- **No auth required.** The entire product works without sign-up. GitHub data is fetched via public API by username. Resume is parsed client-to-server. LinkedIn data is manually pasted. No OAuth, no NextAuth, no session management.
- **AI JSON reliability.** Gemini is configured with `responseMimeType: 'application/json'` so it returns strict JSON. A brace-depth parser extracts the top-level object even if extra text leaks through. Trailing comma repair runs as a final safety pass.
- **Input caps.** Resume and LinkedIn text are capped at 8,000 chars; GitHub and website data at 4,000 chars — prevents prompt bloat and keeps API costs predictable.
- **Waitlist** emails are collected via `/api/waitlist` and upserted to a Supabase `waitlist` table (RLS enabled).
- **No share links or profile/feedback in this build.** Results are viewed in-session and via download only. Schema is `schema.sql` (waitlist table only).
- **Accessibility.** `cursor: none` removed globally. Interactive elements use `cursor: pointer`. `focus-visible` styles added. `prefers-reduced-motion` respected.
- **Stage-aware loading.** The analysis loader receives real-time stage updates from the onboarding wizard (`connect → github → resume → linkedin → website → ai → plan → complete`). Progress is tied to actual backend activity, not timers. The AI stage uses an asymptotic curve (never reaches 100% until the response arrives), preventing the experience from stalling during long inference calls.

---

## Design Decisions Worth Noting

1. **Chaos → Signal narrative.** During loading, five common career doubts appear as italic questions ("Am I actually senior enough yet?"). As the analysis progresses, each resolves into a green confirmation ("✓ Seniority gap: mapped."). At the AI stage, the entire chaos layer fades and is replaced by a large percentage signal — the transition from uncertainty to clarity mirrors the product's core promise.

2. **3D graph as data visualization.** The loader's 3D graph isn't decorative — each node has a `stageLevel` property that determines when it illuminates. Input nodes (GitHub, LinkedIn, Resume, Portfolio) light up as their respective data sources connect. Core nodes (gap analysis, roadmap, daily engine) activate during the AI phase. Output nodes (promotion, pivot, new role) glow only at completion. This creates a visual "cascade of intelligence" that maps directly to what's happening server-side.

3. **Asymptotic progress.** During the AI phase (the longest wait), progress uses `65 + 24 * (1 - 1/(1 + t/12))` — a curve that starts fast and asymptotically approaches 89% without ever reaching it. This means: at 5 seconds the bar is at ~76%, at 30 seconds it's at ~87%, at 60 seconds it's at ~88.7%. The user always sees movement, never a frozen bar.

---

## Submission Checklist

- [x] Landing page screenshot (`landing_page_rida.png`)
- [x] Routes map (`ROUTES.txt` — short index; `routes.md` — full map)
- [x] Supabase schema (`schema.sql` — waitlist table only)
- [x] Explainer with team, URLs, problem, and architecture (`explainer_rida.md`)
- [x] Live deployment URL (working; set `GEMINI_API_KEY` in Vercel for analysis)
- [x] Public GitHub repository
- [x] Full source code in `src/`
