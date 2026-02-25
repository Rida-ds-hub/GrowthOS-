# Growth OS

**Product Name:** Growth OS  
**One-line description:** An AI-powered career progression engine that analyzes your GitHub, resume, and portfolio to generate a personalized gap analysis and 90-day action plan — free, no sign-up required.

**Team:** Rida Khan — reach.rida.khan@gmail.com

**Live URL:** https://growth-os-lake.vercel.app/  
**GitHub:** https://github.com/Rida-ds-hub/GrowthOS-  
**Demo (Loom):** https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd

---

## Submission deliverables (for judges)

| Deliverable | File / link |
|------------|-------------|
| Landing page screenshot | `landing_page_rida.png` (full-page, min width 1280px, PNG/JPG; must show product name, tagline, value prop, and a visible CTA) |
| Routes map | `ROUTES.txt` (short index) + `routes.md` (full map) + `STRUCTURE.txt` (src/app tree) |
| Supabase schema | `schema.sql` (waitlist table only; no profiles/feedback in this build) |
| Explainer | This file (`explainer_rida.md`) |
| Live deployment | https://growth-os-lake.vercel.app |
| GitHub | https://github.com/Rida-ds-hub/GrowthOS- |
| Sample output (offline verification) | `sample-gap-analysis-output.json` |
| Source | `src/` |

**For judges — live flow:** Set `GEMINI_API_KEY` in Vercel (Project → Settings → Environment Variables). Then open the [live app onboarding](https://growth-os-lake.vercel.app/onboarding), use test GitHub username **`rida-ds-hub`**, and optionally upload a small PDF resume (&lt; 5 MB) or skip. A successful run shows the results page with readiness score and 90-day plan; use **Download Results** to export. The [Loom demo](https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd) (30–60s) shows onboarding → loader → results → download. For offline verification of the `/api/gap-analysis` response shape, see **`sample-gap-analysis-output.json`** (sanitized, no PII). If the key is missing, `/api/gap-analysis` returns a clear 500 with instructions to set the key.

---

## Problem solved

Most tech professionals have ambition but no clear system for career growth. They guess at which skills to build, when to push for a promotion, and how to make their work visible — and they guess wrong. Growth OS fixes that by turning real evidence (GitHub, resume, portfolio) into a structured gap analysis and a 90-day plan so they know exactly where they stand and what to do next.

---

## What it does

Growth OS ingests real professional data (GitHub repos, resume PDF, portfolio URL, optional LinkedIn paste) and runs an AI-powered gap analysis across five career domains: **System Design Maturity**, **Execution Scope**, **Communication & Visibility**, **Technical Depth**, and **Leadership & Influence**. It returns a readiness score, domain breakdowns, identified gaps, a 90-day roadmap, upskilling project ideas, a posting strategy, and a promotion narrative — all downloadable as a report. No sign-up required.

---

## Animations & experience (landing + analysis loader)

We’ve invested heavily in motion and feedback so the product feels alive and confident rather than static.

### Landing page

- **Hero 3D graph (Canvas API)** — An interactive 3D node graph in the hero that rotates and responds to the viewport. Nodes and edges are drawn with dynamic brightness; the same graph language reappears in the analysis loader so the journey feels continuous.
- **Scroll-driven narrative** — The landing is a long scroll with distinct panels (hero → system → how it works → pricing → waitlist). Scroll position drives which panel is “active” and updates a vertical indicator (dots on the right). Panels are keyed to scroll thresholds so the story unfolds as you move.
- **How it works steps** — Four steps (Connect, Analyze, Plan, Execute) with hover-to-highlight. Hovering a step reveals its description and copy, creating a simple but clear progression.
- **Smooth CTAs and links** — Primary buttons and nav links use smooth scroll and subtle transitions. The “Track My Readiness” and “Start Free” CTAs are clearly emphasized.
- **Stats bar** — The four metrics (5 domains, 90d plan, 1 analysis, $0) are laid out with even spacing and center alignment for a clean, scannable block.
- **Pricing and waitlist** — Pricing cards and the waitlist form are in their own sections with clear hierarchy and enough spacing to feel intentional.

### Analysis loader (“Mission Control”)

The loader is a full-screen cinematic experience while the AI runs — so the wait feels like part of the product, not a blank spinner.

- **3D graph that lights up by stage** — The same node/graph metaphor as the landing, but here each node has a `stageLevel`. Input nodes (GitHub, LinkedIn, Resume, Portfolio) illuminate as those data sources connect. Core nodes (gap analysis, roadmap, daily engine) light up during the AI phase. Output nodes (promotion, pivot, new role) glow only at completion. The graph auto-rotates and nodes brighten in a cascade that mirrors backend progress.
- **Terminal-style log** — A scrolling terminal shows the current stage label (e.g. “Scanning GitHub”, “Running gap analysis”) so users see concrete steps, not a generic “Loading…”
- **Chaos → Signal panel** — Five common career doubts appear as italic questions (“Am I actually senior enough yet?”). As the pipeline advances, each resolves into a green confirmation (“✓ Seniority gap: mapped.”). In the AI stage, the chaos block fades and is replaced by a large percentage-style signal — the shift from uncertainty to clarity is the core narrative of the product.
- **Five-domain skill bars with wave animation** — During the AI phase, five bars (System Design, Execution, Communication, Tech Depth, Leadership) fill with an animated wave effect so progress feels continuous and aligned to the five domains in the report.
- **Asymptotic progress curve** — The main progress bar uses `65 + 24 * (1 - 1/(1 + t/12))`: it moves quickly at first then asymptotically approaches ~89% until the response arrives. So the bar never stalls; at 5s it’s ~76%, at 30s ~87%. Users always see movement.
- **Footer stats strip** — Live counters for sources connected, nodes mapped, gaps found, and elapsed time. These update as stages change so the loader feels like a real control panel.
- **Cycling motivational insights** — Short lines (“Most people guess. You’re about to know.”, “Mapping your career DNA…”) rotate every few seconds to keep the wait engaging.
- **Stage-aware everything** — The loader receives real-time stage updates from the wizard (`connect → github → resume → linkedin → website → ai → plan → complete`). Progress is tied to actual backend activity, not timers.

All of this is implemented with a mix of Canvas for the 3D graph, React state, and CSS/animations — no pre-rendered video. The goal is a cohesive, high-signal experience on both landing and during the analysis wait.

---

## What’s built

- **Next.js App Router** — routing, server components, API routes
- **Google Gemini 2.5 Flash** — core AI with JSON output (`responseMimeType: 'application/json'`)
- **Supabase** — waitlist emails (RLS enabled, service-role only, server-only usage)
- **Tailwind CSS** — styling
- **Framer Motion** — animations and transitions across the app
- **PDF-Parse** — resume text extraction (5 MB max, 8k char cap)
- **Custom 3D graph (Canvas API)** — landing hero + analysis loader; nodes keyed to pipeline stage
- **Cinematic analysis loader** — full-screen “Mission Control” with terminal log, Chaos→Signal, domain bars, asymptotic progress, and footer stats

**Routes:** See `ROUTES.txt` for the index, `routes.md` for the full map and **runtime confirmation**, and `STRUCTURE.txt` for the full `src/app` directory tree.

---

## Project structure

```
growth-os-vibes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (runtime = "nodejs" where needed)
│   │   │   ├── gap-analysis/   # Gemini gap analysis
│   │   │   ├── github/public/  # Public GitHub profile + repos (rate-limit + cache)
│   │   │   ├── parse-resume/   # PDF resume (5 MB max)
│   │   │   ├── waitlist/       # Waitlist (Supabase)
│   │   │   └── website/scrape/# Website text extraction
│   │   ├── layout.tsx          # Root layout, fonts, OG/Twitter metadata
│   │   ├── onboarding/        # Onboarding wizard
│   │   └── results/view/      # Results page
│   ├── components/            # UI, landing, onboarding, dashboard
│   └── lib/                   # Gemini, GitHub, Supabase, types, API schemas
├── public/                    # Static assets; includes og.png for social/link previews (Open Graph)
├── .env.example               # Env template
├── ROUTES.txt                 # Routes index
├── routes.md                  # Full route map + runtime
├── STRUCTURE.txt              # src/app tree (full paths)
├── schema.sql                 # Waitlist table only
├── sample-gap-analysis-output.json
└── package.json               # Node >= 18
```

`@/lib/*` → `src/lib/*`. API routes under `src/app/api/*/route.ts` use `export const runtime = "nodejs"` where they rely on Node-only APIs (pdf-parse, fetch + HTML parsing).

**Included for reviewers:** `public/og.png` is provided for Open Graph / Twitter card previews when the app URL is shared; the root layout references it for `metadataBase`, `openGraph.images`, and `twitter.images`.

---

## Quick start (local)

**Prerequisites:** Node.js 18+, npm or yarn

1. **Clone and install**
   ```bash
   git clone https://github.com/Rida-ds-hub/GrowthOS-.git
   cd GrowthOS-/growth-os-vibes
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   - `GEMINI_API_KEY` — **required** for analysis ([Google AI Studio](https://aistudio.google.com/app/apikey))
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — optional (waitlist)

   Without Supabase, the app runs; waitlist accepts submissions but does not persist.

3. **Run dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 → **Onboarding** to run a full analysis.

   **If you see 404 on `/`:** run `rm -rf .next` then `npm run dev` again for a clean compile.

4. **Production build**
   ```bash
   npm run build
   npm start
   ```

---

## Deploy on Vercel

1. Push the repo to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `growth-os-vibes` if the repo root is the parent.
3. In **Project → Settings → Environment Variables** add:
   - `GEMINI_API_KEY` (required for analysis)
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (optional, for waitlist)
4. Deploy. No custom build command or Node version needed; the app uses Node 18.x and `runtime = "nodejs"` on the API routes that need it.

---

## Reproducibility and runtime

- **Node:** 18.x (Vercel default; `engines` in `package.json`).
- **API routes:** `parse-resume`, `website/scrape`, `gap-analysis`, and `github/public` export `export const runtime = "nodejs"`.
- **Env:** Only the three variables above; no build flags or custom Vercel function config.

---

## What’s implemented (for reviewers)

- **Zod validation** — All POST bodies (gap-analysis, website/scrape, github/public, waitlist) are validated with Zod in `src/lib/api-schemas.ts`. Invalid payloads return **400** with a clear message via `validationErrorResponse()`.
- **GitHub rate limit (403)** — On GitHub rate limit or 403, the API returns **503** with a message and `retryAfterSeconds` (from `X-RateLimit-Reset` / `Retry-After`). Recent usernames are cached in-memory for **5 minutes** to reduce API pressure.
- **Logging / PII** — In production, raw Gemini response bodies are never logged. On parse failure we log only the error message and `responseLength`. On success we log `responseLength` and `domainsPresent`. For GitHub format errors in production we log only profile keys and repo count, not full profile/repos.
- **Runtime** — Listed in `routes.md` and `STRUCTURE.txt`; the four routes above use `runtime = "nodejs"`.
- **Sample output** — `sample-gap-analysis-output.json` is a sanitized `gapAnalysis` shape for offline verification.
- **Supabase** — Used server-side only (`import "server-only"` in `src/lib/supabase.ts`); service-role key only for waitlist.

---

## Design decisions

**Product / UX**

1. **Chaos → Signal** — Loader shows career doubts as questions, then resolves them into green confirmations; at AI stage it switches to a percentage-style signal so the transition from uncertainty to clarity is explicit.
2. **3D graph as data visualization** — Nodes have `stageLevel` and light up in sync with pipeline stages so the graph reflects what’s happening server-side.
3. **Asymptotic progress** — Progress bar never freezes; curve approaches ~89% until the response arrives so users always see movement.

**Technical**

- **No auth** — GitHub by public username; resume and website server-side; LinkedIn paste. No OAuth or session.
- **AI JSON reliability** — Brace-depth extraction and trailing-comma repair so we get a valid object even if Gemini appends text.
- **Input caps** — Resume/LinkedIn 8k chars; GitHub/website 4k chars to keep prompts and costs predictable.
- **PDF** — 5 MB max with a clear error message.
- **Supabase** — Single `waitlist` table; RLS enabled; no profiles or feedback in this build. Schema in `schema.sql`.

---

## Architecture notes

- **Stage-aware loading** — Loader gets real-time stage updates from the wizard; progress is tied to backend activity, not timers.
- **Accessibility** — Interactive elements use `cursor: pointer`; `focus-visible` styles; `prefers-reduced-motion` respected.
- **No share links or profile/feedback** — Results are in-session and via download only.

---

## Supabase (optional)

Single table: **waitlist** (`id`, `email`, `created_at`). Run `schema.sql` in the Supabase SQL editor. No profiles or feedback tables in this build.

---

## Links

- **Live:** https://growth-os-lake.vercel.app
- **GitHub:** https://github.com/Rida-ds-hub/GrowthOS-
- **Loom:** https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd

---

## Submission checklist

- [x] Landing page screenshot (`landing_page_rida.png`)
- [x] Routes map (`ROUTES.txt`, `routes.md`, `STRUCTURE.txt`)
- [x] Sample output (`sample-gap-analysis-output.json`)
- [x] Supabase schema (`schema.sql`)
- [x] Explainer with team, URLs, problem, architecture, animations, and implementation notes (this file)
- [x] Live deployment (set `GEMINI_API_KEY` in Vercel for analysis)
- [x] Public GitHub repository
- [x] Full source in `src/`

---

## Creating the submission zip

Zip the **`growth-os-vibes`** folder so the archive stays small and contains everything required.

**Include:**
- `landing_page_rida.png` — full-page landing screenshot (PNG or JPG, **min width 1280px**); must show product name, tagline, value proposition, and a visible CTA (e.g. “Track My Readiness”, “Start Free”).
- `explainer_rida.md` — this file (product name, one-line description, team, live URL, GitHub URL, problem description).
- **Next.js routes export:** `ROUTES.txt`, `routes.md`, `STRUCTURE.txt` (route index, full map, and `src/app` tree).
- `schema.sql` — Supabase waitlist table.
- `src/` — all Next.js app and component source (pages, API routes, components, lib).
- `public/` — static assets (e.g. `og.png`).
- `package.json`, `.env.example`, `sample-gap-analysis-output.json`, and config files (`next.config.js`, `tsconfig.json`, etc.).

**Exclude (to keep the zip small):**
- `node_modules/`
- `.next/`
- `.git/`
- `*.zip`, `.env.local`, and other large or secret files

**Example (from repo root):**
```bash
cd /path/to/GrowthOS-
zip -r growth-os-submission.zip growth-os-vibes -x "growth-os-vibes/node_modules/*" -x "growth-os-vibes/.next/*" -x "growth-os-vibes/.git/*" -x "*.zip"
```

Ensure `landing_page_rida.png` is inside `growth-os-vibes/` before zipping (e.g. copy it there if it lives elsewhere).
