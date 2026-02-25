# Growth OS — Route Map

## Pages (Frontend)

| Path | Description |
|---|---|
| `/` | Landing page — hero, scroll panels, stats bar, how it works, pricing, waitlist CTA |
| `/onboarding` | Onboarding wizard — goal setting, data source connection, resume upload, analysis trigger |
| `/results/view` | Results page — full gap analysis, domain scores, radar, 90-day plan, download |

## API Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/gap-analysis` | None | Core endpoint — sends structured prompt to Gemini AI, returns full gap analysis JSON (5 domains, scores, gaps, 90-day plan, promotion narrative). |
| POST | `/api/github/public` | None | Fetches public GitHub data by username (profile + repos). No OAuth required. Capped at 4 000 chars. |
| POST | `/api/parse-resume` | None | Parses uploaded PDF resume via `pdf-parse`. Returns extracted text capped at 8 000 chars. |
| POST | `/api/website/scrape` | None | Scrapes portfolio/website URL. Extracts text from HTML content tags + meta descriptions. Capped at 4 000 chars. 10 s timeout. |
| POST | `/api/waitlist` | None | Collects waitlist email addresses. Upserts to Supabase `waitlist` table. |

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini AI — powers the gap analysis engine. **Set in Vercel.** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key for server-side DB access. |
