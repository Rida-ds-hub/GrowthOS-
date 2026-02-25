# Growth OS

**An AI-powered career progression engine** that analyzes your GitHub, resume, and portfolio to generate a personalized gap analysis and 90-day action plan — free, no sign-up required.

**Live app:** [https://growth-os-lake.vercel.app](https://growth-os-lake.vercel.app)

---

## Submission deliverables (for judges)

| Deliverable | File / link |
|-------------|-------------|
| Landing page screenshot | `landing_page_rida.png` |
| Routes map | `ROUTES.txt` (short index) + `routes.md` (full map) |
| Supabase schema | `schema.sql` (waitlist table only; no profiles/feedback in this build) |
| Explainer | `explainer_rida.md` |
| Live deployment | [https://growth-os-lake.vercel.app](https://growth-os-lake.vercel.app) |
| GitHub | [https://github.com/Rida-ds-hub/GrowthOS-](https://github.com/Rida-ds-hub/GrowthOS-) |
| Source | `src/` |

**For judges — live flow:** The live app requires `GEMINI_API_KEY` to be set in Vercel for “Run my analysis” to succeed. Once set, the flow works end-to-end. Test GitHub username: `rida-ds-hub`. Any small PDF resume (&lt; 5 MB) works for the resume step; you can skip it to test with GitHub + website only.

---

## What it does

Growth OS ingests real professional data (GitHub repos, resume PDF, portfolio URL, optional LinkedIn paste) and runs an AI-powered gap analysis across five career domains: **System Design Maturity**, **Execution Scope**, **Communication & Visibility**, **Technical Depth**, and **Leadership & Influence**. It returns a readiness score, domain breakdowns, identified gaps, a 90-day roadmap, upskilling project ideas, a posting strategy, and a promotion narrative — all downloadable as a report.

---

## Quick start (local)

### Prerequisites

- **Node.js 18+** (Vercel uses 18.x by default; recommended for parity)
- npm or yarn

### 1. Clone and install

```bash
git clone https://github.com/Rida-ds-hub/GrowthOS-.git
cd GrowthOS-/growth-os-vibes
npm install
```

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | **Yes** (for analysis) | Google Gemini API key. Get one at [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. Only needed if you want waitlist emails stored. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service-role key. Only needed with the URL above. |

Without Supabase, the app still runs; the waitlist form will accept submissions but not persist them.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Go to **Onboarding** to run a full analysis (you’ll need a valid `GEMINI_API_KEY`).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Deploy on Vercel

1. Push this folder (or the whole repo) to GitHub.
2. In [Vercel](https://vercel.com), **Import** the repository.
3. Set **Root Directory** to `growth-os-vibes` (if the repo root is the parent).
4. Add environment variables in **Project → Settings → Environment Variables**:
   - `GEMINI_API_KEY` (required for gap analysis)
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (optional, for waitlist)
5. Deploy. No extra build command or Node version needed; the app uses **Node 18.x** and `export const runtime = "nodejs"` on API routes that use `pdf-parse` and scraping.

---

## Project structure (submission)

```
growth-os-vibes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (all use runtime = "nodejs" where needed)
│   │   │   ├── gap-analysis/   # Gemini gap analysis
│   │   │   ├── github/public/  # Public GitHub profile + repos (with rate-limit handling)
│   │   │   ├── parse-resume/   # PDF resume parsing (5 MB max)
│   │   │   ├── waitlist/       # Waitlist signup (Supabase)
│   │   │   └── website/scrape/ # Website text extraction
│   │   ├── layout.tsx          # Root layout, fonts, OG/Twitter metadata
│   │   ├── onboarding/         # Onboarding wizard
│   │   └── results/view/       # Results page
│   ├── components/             # UI and landing components
│   └── lib/                    # Shared utilities (Gemini, GitHub, Supabase, types, API schemas)
├── public/                     # Static assets (e.g. og.png for social previews)
├── .env.example                # Env template
├── ROUTES.txt                  # Routes index (path → method → purpose) — submission artifact
├── routes.md                   # Full route map and API summary
├── schema.sql                  # Supabase waitlist table (only table in this build)
├── explainer_rida.md           # Product explainer and submission notes
└── package.json                # Dependencies; Node >= 18
```

- All `@/lib/*` imports resolve to `src/lib/*`.
- API routes live under `src/app/api/*/route.ts` and declare `runtime = "nodejs"` where they use Node-only APIs (`pdf-parse`, fetch + HTML parsing, etc.).

---

## Reproducibility and runtime

- **Node:** 18.x (Vercel default; enforced via `engines` in `package.json`).
- **API routes:** `parse-resume`, `website/scrape`, `gap-analysis`, and `github/public` use `export const runtime = "nodejs"`.
- **Env:** Only the three variables above; no build flags or custom Vercel function config required.

---

## Links

- **Live deployment:** [https://growth-os-lake.vercel.app](https://growth-os-lake.vercel.app)
- **GitHub:** [https://github.com/Rida-ds-hub/GrowthOS-](https://github.com/Rida-ds-hub/GrowthOS-)
- **Demo (Loom):** [https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd](https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd)

For problem statement, architecture, and design notes, see **explainer_rida.md**. For the routes index (submission artifact), see **ROUTES.txt**; for the full route and API list, see **routes.md**.

---

## Supabase (optional)

This submission uses a single table: **waitlist** (`id`, `email`, `created_at`). Run `schema.sql` in the Supabase SQL editor to create it. No profiles or feedback tables in this build.
