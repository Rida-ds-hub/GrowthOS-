# Growth OS

**Build the evidence. Earn the promotion.**

An AI-powered career progression engine that analyzes your GitHub, resume, and portfolio to generate a personalized gap analysis and 90-day action plan — free, no sign-up required.

**Live app:** [https://growth-os-lake.vercel.app](https://growth-os-lake.vercel.app)

---

## What it does

Growth OS ingests real professional data (GitHub repos, resume PDF, portfolio URL, optional LinkedIn paste) and runs an AI-powered gap analysis across five career domains: **System Design Maturity**, **Execution Scope**, **Communication & Visibility**, **Technical Depth**, and **Leadership & Influence**. It returns a readiness score, domain breakdowns, identified gaps, a 90-day roadmap, upskilling project ideas, a posting strategy, and a promotion narrative — all downloadable as a report.

---

## Repo structure

The runnable app and submission live in **`growth-os-vibes/`**:

```
GrowthOS-/
├── growth-os-vibes/     ← Next.js app (clone, install, run from here)
│   ├── src/
│   ├── public/
│   ├── README.md        ← Full setup, deploy, and submission details
│   ├── ROUTES.txt       ← Routes index
│   ├── routes.md
│   ├── schema.sql
│   └── explainer_rida.md
├── src/                 ← Legacy/other app code (if any)
└── README.md            ← This file
```

---

## Quick start

```bash
git clone https://github.com/Rida-ds-hub/GrowthOS-.git
cd GrowthOS-/growth-os-vibes
cp .env.example .env.local
# Edit .env.local: add GEMINI_API_KEY (get one at https://aistudio.google.com/app/apikey)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go to **Onboarding** to run a full analysis.

For full setup, env vars, deployment, and submission deliverables, see **[growth-os-vibes/README.md](./growth-os-vibes/README.md)**.

---

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI:** Google Gemini API (gemini-2.5-flash)
- **Database:** Supabase (optional; waitlist only)
- **Charts:** Recharts
- **Deployment:** Vercel

No auth required — the analysis flow works without sign-up.

---

## Links

- **Live deployment:** [https://growth-os-lake.vercel.app](https://growth-os-lake.vercel.app)
- **Demo (Loom):** [https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd](https://www.loom.com/share/039b51eabcf64888bbb1fec44b5d76fd)

---

## License

Private — Hackathon build.
