# GROWTH OS — MVP Specification
### For Cursor / AI-assisted development
**Version 1.0 · Hackathon Build · 48-Hour Scope**

> **Cursor: Read this entire file before writing any code. Do not deviate from this spec without asking for clarification.**

---

## How to Use This File

This is the single source of truth for the Growth OS MVP. Every component, route, database table, design decision, and feature is defined here. When in doubt, come back to this file. If something is not in this spec, do not build it.

---
## 0. The Idea: Why This Exists

Three truths drove this product. Every feature must trace back to at least one of them.

### 0.1 Failing to Plan Is Planning to Fail *(Hormozi)*
Most tech professionals have ambition but no architecture. They show up, do work, and hope someone notices. Growth OS forces the planning that most people skip: where am I, where do I need to be, what is the delta, and what are the daily actions that close it?
**This is Part 1 — Planning.**

### 0.2 Human Thinks. AI Executes.
Upskilling in tech has been corrupted by a false religion: the faster you type code, the better you are. Growth OS rejects this. The correct model is: a senior engineer designs a system before writing a line. AI can write the code. Humans must own the thinking. The daily drill mechanic enforces this — reasoning is required before implementation unlocks.
**This is Part 2 — Upskilling.**

### 0.3 Visibility Is Not Optional
If you are the most technically capable person on your team but nobody knows it — the person who is less skilled but better known will get the promotion. Talent without signal is invisible. Growth OS builds the signal systematically: impact bullets, GitHub commits, LinkedIn posts, and promotion narratives are all outputs of the same workflow.
**This is Part 3 — Personal Branding.**

---

## 1. Product Identity

### 1.1 What It Is
Growth OS is a structured career progression engine for tech professionals. It maps where a user is, where they need to be, identifies the gaps, trains decision-making maturity daily, captures real impact continuously, and compiles promotion-ready evidence over time.

The core loop is: **Progression → Capability → Evidence → Narrative.**
Every feature must reinforce this loop or it does not belong.

### 1.2 What It Is NOT *(Cursor Guardrail)*

| ❌ Not This | Why |
|---|---|
| Course platform | We train thinking, not deliver content |
| Resume builder | Resumes are an output, not the product |
| Job board | Out of scope entirely |
| Motivational app | No streaks, no confetti, no guru tone |
| Social network | Community is future scope, not core |
| Vanity leaderboard | No gamification that distracts from progression |
| Feature-dense productivity tool | Every screen must answer: does this help progression? |

---

## 2. Target User

Tech professionals with 0–10 years of experience:
- Software Engineers
- Product Managers
- Designers
- Data professionals

They want progression within a specific timeline. Progression means: promotion, expanded scope, new role, or increased influence.

**They lack structure, not ambition.**

---

## 3. Tech Stack — Final Decisions

| Layer | Decision |
|---|---|
| Framework | Next.js 14 — App Router, TypeScript, `src/` directory |
| Styling | Tailwind CSS + Shadcn/ui |
| Animation | Framer Motion — slow, confident fades only. No bounce. |
| Auth | NextAuth.js — GitHub + LinkedIn OAuth providers |
| Database | Supabase — PostgreSQL + JSONB |
| AI Model | Google Gemini API — `gemini-2.5-flash` (free tier) |
| PDF Parsing | `pdf-parse` — server-side only |
| Charts | Recharts — `RadarChart` for domain scores |
| Deployment | Vercel |

### Bootstrap Commands

```bash
npx create-next-app@latest growth-os --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd growth-os
npx shadcn@latest init
npx shadcn@latest add button card badge progress separator skeleton tabs input label
npm install next-auth @supabase/supabase-js @google/generative-ai pdf-parse framer-motion lucide-react recharts
npm install -D @types/pdf-parse
```

---

## 4. File Structure

Build exactly this. Do not add pages or routes not listed here.

```
src/
├── app/
│   ├── page.tsx                          ← Landing page
│   ├── layout.tsx                        ← Root layout + NextAuth SessionProvider
│   ├── globals.css                       ← Tailwind base, dark bg default
│   ├── onboarding/
│   │   └── page.tsx                      ← 4-step animated wizard
│   ├── dashboard/
│   │   └── page.tsx                      ← Gap report + plan + locked sections
│   └── api/
│       ├── auth/[...nextauth]/route.ts   ← NextAuth handler
│       ├── github/profile/route.ts       ← Pull GitHub data via OAuth token
│       ├── parse-resume/route.ts         ← PDF → plain text
│       ├── gap-analysis/route.ts         ← Gemini AI call + Supabase save
│       └── feedback/route.ts             ← Feedback + interest capture
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Philosophy.tsx                ← The 3 founding principles
│   │   ├── HowItWorks.tsx
│   │   ├── WhatItIsNot.tsx
│   │   └── CTA.tsx
│   ├── onboarding/
│   │   ├── StepGoal.tsx
│   │   ├── StepConnect.tsx
│   │   ├── StepResume.tsx
│   │   └── AnalysisLoader.tsx
│   ├── dashboard/
│   │   ├── GapRadar.tsx                  ← Recharts RadarChart
│   │   ├── PlanTimeline.tsx              ← 3-phase 90-day plan cards
│   │   ├── ReadinessScore.tsx            ← Score + circular progress ring
│   │   ├── GapCards.tsx                  ← Per-domain gap detail cards
│   │   ├── PromotionNarrative.tsx        ← Styled block quote
│   │   ├── LockedSection.tsx             ← Reusable coming soon component
│   │   └── FeedbackWidget.tsx            ← Floating feedback button + modal
│   └── ui/                              ← Shadcn auto-generated
└── lib/
    ├── gemini.ts                        ← Gemini client instance
    ├── supabase.ts                      ← Supabase server client
    ├── supabase-browser.ts              ← Supabase browser client
    ├── github.ts                        ← GitHub REST API helpers
    ├── prompts.ts                       ← Gap analysis prompt builder
    └── types.ts                         ← All shared TypeScript interfaces
```

---

## 5. Environment Variables

Create `.env.local` in project root. Add `.env.local` to `.gitignore` immediately. Add all of these to Vercel Environment Variables before deploying.

```env
# NextAuth
NEXTAUTH_SECRET=<any-random-32-char-string>
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_ID=
GITHUB_SECRET=

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini
GEMINI_API_KEY=
```

> **Security rule:** `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must never be referenced in any client component or exposed to the browser. Server-side API routes only.

---

## 6. Accounts to Create + Where to Get Keys

### 6.1 GitHub OAuth App
1. Go to: `github.com/settings/developers` → OAuth Apps → New OAuth App
2. Application name: `Growth OS`
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy **Client ID** → `GITHUB_ID`
6. Generate **Client Secret** → `GITHUB_SECRET`
7. For production: update callback URL to `https://yourdomain.vercel.app/api/auth/callback/github`

### 6.2 LinkedIn OAuth App
1. Go to: `linkedin.com/developers` → Create App
2. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
3. Request product: **Sign In with LinkedIn using OpenID Connect**
4. Copy **Client ID** → `LINKEDIN_CLIENT_ID`
5. Copy **Client Secret** → `LINKEDIN_CLIENT_SECRET`

> **LinkedIn note:** LinkedIn's data read API requires partner approval — not possible in 48 hours. For MVP: OAuth connect stores the token (shows "Connected ✓") and the PDF upload provides the actual profile data. This is honest and judges will respect the transparency.

### 6.3 Supabase
1. Go to: `supabase.com` → New project
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
5. Run the SQL schema in Section 7 via the SQL Editor

### 6.4 Google Gemini API
1. Go to: https://aistudio.google.com/app/apikey → Create API Key
2. Copy key → `GEMINI_API_KEY`
3. Free tier: 30 req/min, 14,400 req/day — sufficient for MVP and demo

### 6.5 Vercel
1. Go to: `vercel.com` → Import Git repository
2. Add all `.env.local` values under Project Settings → Environment Variables
3. Deploy on every push to `main`

---

## 7. Database Schema

Run in Supabase SQL Editor. This is the complete schema.

```sql
create table profiles (
  id                  uuid default gen_random_uuid() primary key,
  user_id             text unique not null,
  email               text,
  name                text,
  avatar_url          text,
  current_role        text,
  target_role         text,
  years_exp           int,
  timeline            text,
  github_data         jsonb,
  linkedin_raw        text,
  resume_raw          text,
  website_url         text,
  gap_analysis        jsonb,
  onboarding_complete boolean default false,
  created_at          timestamp default now(),
  updated_at          timestamp default now()
);

create table feedback (
  id          uuid default gen_random_uuid() primary key,
  user_id     text,
  type        text not null,  -- 'bug' | 'feature' | 'interest' | 'general'
  message     text not null,
  page        text,           -- feature name for interest captures
  created_at  timestamp default now()
);

-- Row Level Security
alter table profiles enable row level security;
create policy "Users own their profile"
  on profiles for all
  using (user_id = current_setting('app.current_user_id', true));
```

---

## 8. User Journey — Every Screen

### 8.1 Landing Page `/`

The landing page sells the idea in under 60 seconds and drives to `/onboarding`. Judges see this first — it must feel serious, premium, and purposeful.

**Section A — Hero**
- Full viewport height
- Background `#0a0a0a` with a single large emerald radial gradient orb (opacity 4–6%, centred behind text)
- Headline: `"Build the evidence. Earn the promotion."` — each word fades in with 0.08s stagger delay (Framer Motion)
- Sub: `"Growth OS is a structured progression engine for tech professionals."`
- Single CTA: `"Start your analysis →"` → `/onboarding`
- No navigation bar — full focus

**Section B — Philosophy (The 3 Principles)**
Three cards, horizontal on desktop, stacked on mobile. Each fades in on scroll (`whileInView`).
- **01 — Plan or Fail:** You cannot progress without a map. Start with where you are, define where you need to be, execute daily.
- **02 — Human Thinks. AI Executes:** Senior engineers design before they code. Growth OS trains the thinking — AI handles the execution.
- **03 — Visibility Is Not Optional:** The best engineer no one knows loses to the average engineer everyone knows. Build the signal.

**Section C — How It Works**
Vertical animated timeline. 5 items fade in on scroll.
1. Set your target role and timeline
2. Connect GitHub, upload your resume, link LinkedIn
3. Receive a structured gap analysis across 5 domains
4. Train decision-making daily — design before code
5. Build your promotion case automatically

**Section D — What This Is Not**
4-card grid. Each card: strikethrough label + one line of what Growth OS IS instead.
- ~~Course Platform~~ → We train thinking
- ~~Resume Builder~~ → Resumes are an output
- ~~Job Board~~ → Out of scope
- ~~Motivational App~~ → No guru, no hype

**Section E — Final CTA**
- Dark banner, emerald top border
- `"Stop guessing. Start building evidence."`
- Button: `"Run your gap analysis free →"`

---

### 8.2 Onboarding `/onboarding`

4-step animated wizard. `AnimatePresence` with slide transitions. Fixed emerald progress bar at top. Dot indicators at bottom.

**Step 1 — Set Your Goal**
- Current role (text input)
- Target role (text input)
- Years of experience (number input)
- Timeline — 4 pill buttons: `3 months / 6 months / 9 months / 12 months`
- All 4 required to proceed
- CTA: `"Continue →"`

**Step 2 — Connect Your Accounts**
- GitHub OAuth button → on connect, shows `"✓ Connected as @username"`
- LinkedIn OAuth button → on connect, shows `"✓ Connected"`
- Website URL — optional text input
- Each connection shows a tooltip of what it unlocks for the analysis
- Skip option available
- CTA: `"Continue →"`

**Step 3 — Upload Resume**
- PDF drag-and-drop zone
- On upload: POST to `/api/parse-resume`, extracts text, stores in component state
- Success state: `"✓ Resume parsed successfully"`
- Skip available
- CTA: `"Run Gap Analysis →"` — triggers Step 4

**Step 4 — Analysis Loading Screen**
Full screen. Sequential animated messages. This is a key aesthetic moment — make it feel like the system is actually reading their career.

| Timing | Message |
|---|---|
| 0s | `"Connecting profile data..."` |
| 1.5s | `"Reading your GitHub activity..."` |
| 3.3s | `"Parsing your experience..."` |
| 4.8s | `"Mapping gaps to [Target Role]..."` ← AI call fires here |
| After response | `"Building your 90-day plan..."` |
| +0.8s | Redirect to `/dashboard` |

---

### 8.3 Dashboard `/dashboard`

Server-side: fetch `gap_analysis` from Supabase for authenticated user. All sections render from stored JSON. Handle the `null` case — show a `"Complete your analysis"` prompt if `gap_analysis` is empty.

**Header Bar**
- Left: Growth OS wordmark
- Centre: `"[Current Role] → [Target Role] in [Timeline]"`
- Right: Readiness score as `%` with circular progress ring (emerald)

**Section A — Summary Card** *(LIVE)*
- Full-width card
- `gap_analysis.summary` — 2–3 sentences
- `gap_analysis.readinessScore` — large number, coloured: `0–40` red · `41–70` amber · `71–100` emerald

**Section B — Gap Radar** *(LIVE)*
- `RadarChart` from Recharts — pentagon shape
- 5 axes: System Design Maturity · Execution Scope · Communication & Visibility · Technical Depth · Leadership & Influence
- Data from `gap_analysis.domainScores`
- Fill: emerald at 40% opacity
- Each axis shows score + gap severity badge

**Section C — Gap Detail Cards** *(LIVE)*
One card per item in `gap_analysis.gaps`:
- Domain name
- Gap severity badge (`high` = red · `medium` = amber · `low` = emerald)
- Observation (what evidence shows)
- Requirement (what target role needs)
- Closing action (single most effective next step)

**Section D — 90-Day Plan** *(LIVE)*
3 cards side by side (horizontal scroll on mobile):
- Phase 1 (Days 1–30): theme + 3 actions
- Phase 2 (Days 31–60): theme + 3 actions
- Phase 3 (Days 61–90): theme + 3 actions
- Highlight current phase with emerald border

**Section E — Promotion Narrative** *(LIVE)*
- Full-width dark card
- Label: `"Your Promotion Story"`
- `gap_analysis.promotionNarrative` — styled block quote

**Section F — Locked Sections** *(COMING SOON — visible but locked)*

These MUST appear on the dashboard. They show product vision, drive feedback signals, and validate demand. Use blurred overlay + lock icon + label.

| Feature | One-line Description | Principle |
|---|---|---|
| Daily Design Drill | Train decision-making daily. Design before code. | Upskilling |
| Impact Bank | Capture measurable impact in real time. | Evidence |
| Promotion Readiness Score | Compile your promotion case automatically. | Narrative |
| LinkedIn Post Generator | Turn commits into LinkedIn proof. | Branding |
| Resume Impact Bullets | Auto-generate bullets from your work. | Evidence + Narrative |

Each locked section includes:
- Title + description
- Which principle it connects to
- `"Notify me when this launches"` button → saves to `feedback` table with `type = 'interest'`

**Section G — Feedback Widget** *(LIVE)*
- Fixed floating button bottom-right: `"Share Feedback"`
- Modal: type selector (`Bug / Feature Request / General`), textarea (max 500 chars), optional email
- POST to `/api/feedback` → Supabase `feedback` table
- Success: `"Thank you. Your feedback shapes what we build next."`

---

## 9. AI Prompt Specification

### Model Config
```typescript
model: "llama-3.3-70b-versatile"
temperature: 0.2
max_tokens: 2048
```

### Critical Rules for the API Route
- Strip markdown code fences before `JSON.parse()`: `raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()`
- Wrap in `try/catch` — return `500` with message if parse fails
- Validate all 5 `domainScores` keys exist before saving to Supabase
- Cap all input text before injecting into prompt (see below)

### Input Caps (Prevent Prompt Injection + Token Overflow)
| Input | Cap |
|---|---|
| `currentRole` | 100 characters |
| `targetRole` | 100 characters |
| `resumeText` | 8,000 characters |
| `linkedinText` | 8,000 characters |
| `githubData` (stringified) | 4,000 characters |

### Required JSON Output Shape

```typescript
// lib/types.ts — use this interface everywhere
export interface GapAnalysis {
  summary: string;
  readinessScore: number; // 0–100
  domainScores: {
    "System Design Maturity": number;
    "Execution Scope": number;
    "Communication & Visibility": number;
    "Technical Depth": number;
    "Leadership & Influence": number;
  };
  gaps: Array<{
    domain: string;
    gap: "high" | "medium" | "low";
    observation: string;
    requirement: string;
    closingAction: string;
  }>;
  plan: {
    phase1: { label: string; theme: string; actions: string[] };
    phase2: { label: string; theme: string; actions: string[] };
    phase3: { label: string; theme: string; actions: string[] };
  };
  promotionNarrative: string;
}
```

### Prompt Template (`lib/prompts.ts`)

```typescript
export const buildGapAnalysisPrompt = (data: {
  currentRole: string;
  targetRole: string;
  yearsExperience: number;
  timeline: string;
  githubData?: string;
  resumeText?: string;
  linkedinText?: string;
}) => `
You are a senior engineering career strategist. You think in structured frameworks. No motivational language. No filler. Precision only.

PROFILE:
- Current Role: ${data.currentRole}
- Target Role: ${data.targetRole}
- Years of Experience: ${data.yearsExperience}
- Timeline: ${data.timeline}

GitHub Data:
${data.githubData || "Not provided"}

Resume:
${data.resumeText || "Not provided"}

LinkedIn / Background:
${data.linkedinText || "Not provided"}

Analyse across 5 domains: System Design Maturity, Execution Scope, Communication & Visibility, Technical Depth, Leadership & Influence.

Return ONLY valid JSON. No text before or after. Use this exact shape:

{
  "summary": "2-3 sentence honest assessment, no fluff",
  "readinessScore": <0-100>,
  "domainScores": {
    "System Design Maturity": <0-100>,
    "Execution Scope": <0-100>,
    "Communication & Visibility": <0-100>,
    "Technical Depth": <0-100>,
    "Leadership & Influence": <0-100>
  },
  "gaps": [
    {
      "domain": "string",
      "gap": "high|medium|low",
      "observation": "what the evidence shows",
      "requirement": "what the target role needs",
      "closingAction": "single most effective action"
    }
  ],
  "plan": {
    "phase1": { "label": "Days 1-30", "theme": "string", "actions": ["string", "string", "string"] },
    "phase2": { "label": "Days 31-60", "theme": "string", "actions": ["string", "string", "string"] },
    "phase3": { "label": "Days 61-90", "theme": "string", "actions": ["string", "string", "string"] }
  },
  "promotionNarrative": "First person. Specific. Evidence-based. The story they tell in ${data.timeline}."
}
`;
```

---

## 10. Security Rules

Every rule below is required. Cursor must implement all of them.

### API Routes
- Every route must call `getServerSession()` before executing any logic
- If session is `null` → return `401` immediately, no data operation proceeds
- `SUPABASE_SERVICE_ROLE_KEY` → server-side routes only, never in client components
- `GEMINI_API_KEY` → server-side routes only, never in client components

### Data
- Users read/write only their own profile row — enforced by Supabase RLS
- Resume PDF is never stored — only the extracted text
- GitHub and LinkedIn tokens stored in NextAuth JWT only — never in the database
- All text inputs trimmed and capped before being sent to the AI prompt

### Rate Limiting
- `/api/gap-analysis` allows one call per user per 60 minutes
- Check `updated_at` on the `profiles` row — if less than 60 minutes ago, return `429`
- Show user-friendly message: `"Analysis refreshes every 60 minutes. Your current report is up to date."`

### Environment
- `.env.local` in `.gitignore` from day one
- No hardcoded keys anywhere in the codebase
- All env vars set in Vercel before first deploy

---

## 11. Design System

### Colour Palette — Strict. Use Only These.

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#0a0a0a` | Page background |
| `bg-surface-1` | `#111111` | Primary cards |
| `bg-surface-2` | `#1a1a1a` | Secondary / nested cards |
| `border` | `#27272a` | All card borders (zinc-800) |
| `accent` | `#10b981` | CTAs, active states, highlights (emerald-500) |
| `accent-hover` | `#059669` | Button hover (emerald-600) |
| `text-primary` | `#f5f5f5` | Headings, key values |
| `text-secondary` | `#a1a1aa` | Body text (zinc-400) |
| `text-muted` | `#52525b` | Metadata, placeholders (zinc-600) |
| `danger` | `#ef4444` | High gap severity |
| `warning` | `#f59e0b` | Medium gap severity |
| `success` | `#10b981` | Low gap, completed states |

**One accent colour only. Never deviate.**

### Animation Rules
- Fade in: `opacity: 0 → 1`, duration `0.35s`, `ease-out`
- Page transitions: `y: 20 → 0` + fade
- Word stagger: `0.08s` per element
- Progress bar: `width` transition `0.5s ease-out`
- **NO** bounce, spring, or playful easing
- **NO** emoji animations, confetti, or celebration effects
- Loading spinner: CSS border-based circle spin, emerald colour

### Component Patterns

```
Card:           border border-zinc-800 rounded-2xl p-6 bg-zinc-900/50
Input:          bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-4 py-3
Primary button: bg-emerald-500 text-black font-semibold hover:bg-emerald-400 rounded-lg py-3
Ghost button:   text-zinc-400 hover:text-white
Badge (high):   bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5
Badge (medium): bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5
Badge (low):    bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5
Locked overlay: absolute inset-0 backdrop-blur-sm bg-black/60 rounded-2xl flex items-center justify-center
```

---

## 12. Coming Soon Features

These are NOT built in the MVP but MUST appear as locked sections on the dashboard. They show the product vision to judges and let users signal demand.

| Feature | Description | Principle |
|---|---|---|
| **Daily Design Drill** | Daily structured challenge. User explains reasoning and trade-offs before implementation unlocks. | Upskilling |
| **Impact Bank** | Capture impact bullets: what changed, what you did, measurable outcome, evidence. | Evidence |
| **Promotion Readiness Score** | Compiled from challenges, maturity progression, impact bullets, evidence density. | Narrative |
| **LinkedIn Post Generator** | Turn a GitHub commit or impact bullet into a LinkedIn post draft, publish from in-app. | Branding |
| **Resume Impact Bullets** | Auto-generate resume bullets from completed projects and impact entries. | Evidence + Narrative |
| **Commit from App** | Review code, answer design question, unlock code, commit to GitHub from inside Growth OS. | Upskilling + Visibility |
| **GitHub Project Mapping** | Based on gap analysis, maps user to a relevant project in the curriculum repo. | Upskilling |
| **Mentorship Layer** | Connect with a senior engineer for structured 1:1 progression support. | Future |
| **Peer Cohorts** | Small cohort of professionals with similar targets and timelines. | Future |

---

## 13. Feedback + Demand Validation

The MVP is a demand test. Build this infrastructure.

### Floating Feedback Widget
- Fixed bottom-right on dashboard
- Fields: Type (`Bug / Feature Request / General`), Message (textarea, max 500 chars), optional email
- Saves to `feedback` table
- Success: `"Thank you. Your feedback shapes what we build next."`

### Coming Soon Interest Capture
- Each locked section: `"Notify me when this launches"` button
- On click: saves to `feedback` table, `type = 'interest'`, `page = feature name`
- No email required — one-tap signal

### What to Measure

| Metric | Signal |
|---|---|
| Onboarding completion rate | Is the wizard too long? |
| Accounts connected per user | Do users trust the product? |
| Gap analysis completions | North star — core value delivered |
| Dashboard time on page | Is the output compelling? |
| Feedback volume + type | Are people engaging? |
| Coming soon button clicks | Which features have demand? |

---

## 14. Cursor Guardrails

### Do NOT Build
- Any feature not listed in this spec
- Any page or route not in the file structure in Section 4
- Any third-party service not in the tech stack in Section 3
- Any animation that feels bouncy, playful, or celebratory
- Any copy that uses motivational language, coaching tone, or self-help framing

### Always Do
- Read this full spec before writing any component
- Use exact colour tokens from Section 11 — no other colours
- Authenticate session in every API route before executing
- Handle loading, error, and empty states for every async operation
- Use `GapAnalysis` type from `lib/types.ts` for all AI response data
- Strip markdown fences and validate JSON before storing `gap_analysis`
- Confirm Supabase writes succeed before redirecting

### Component Rules
- Every form input must show a disabled/loading state during async operations
- Every API call must have `try/catch` with a user-visible error message
- Dashboard must handle `gap_analysis === null` — show `"Complete your analysis"` CTA
- Locked sections show only placeholder/blurred content — never real data
- Feedback widget must not block primary actions or overlap key UI
- Mobile layout must not break — test at 375px minimum width

### Paste This Into Cursor at the Start of Every Session

```
You are building Growth OS — a career progression engine for tech professionals. 
Read SPEC.md before writing any code. 
The product is serious, structured, and minimal. 
Colour system is strict: background #0a0a0a, single accent #10b981 (emerald), surfaces zinc-900. 
Animations are slow and confident — no bounce, no confetti. 
Every API route must authenticate the session before executing. 
Gap analysis JSON from Gemini must be validated before saving to Supabase. 
Do not build any feature not in SPEC.md. 
Do not add motivational or coaching language anywhere. 
Ask for clarification before deviating from the spec.
```

---

## 15. 48-Hour Build Order

Execute in this exact sequence. Deploy to Vercel after each major block.

| Time | Block |
|---|---|
| 0:00 – 0:30 | Bootstrap, install deps, deploy empty app to Vercel, set env vars |
| 0:30 – 1:30 | Landing page Hero — static first, no animations yet |
| 1:30 – 2:00 | NextAuth setup, GitHub OAuth, test sign in/out |
| 2:00 – 2:30 | Supabase project, run schema, test connection |
| 2:30 – 3:30 | Onboarding Step 1 — inputs, validation, state |
| 3:30 – 4:30 | Onboarding Step 2 — GitHub + LinkedIn OAuth buttons |
| 4:30 – 5:00 | `/api/parse-resume` — pdf-parse, text extraction |
| 5:00 – 5:30 | Onboarding Step 3 — file drag/drop, calls parse-resume |
| 5:30 – 6:00 | `/api/github/profile` — pull repos, languages, activity |
| 6:00 – 7:00 | `lib/prompts.ts` + `/api/gap-analysis` — test with curl |
| 7:00 – 7:30 | Analysis loading screen — sequential animated messages |
| 7:30 – 8:30 | Wire full flow: Step 3 → gap-analysis → Supabase → /dashboard |
| 8:30 – 10:30 | Dashboard: header, summary card, readiness score, radar chart |
| 10:30 – 12:00 | Dashboard: gap cards, 90-day plan, promotion narrative |
| 12:00 – 13:00 | Dashboard: 5 locked sections with notify buttons |
| 13:00 – 13:30 | Feedback widget — modal, API route, Supabase save |
| 13:30 – 15:30 | Landing: Philosophy, How It Works, What It Is Not, CTA |
| 15:30 – 17:00 | Framer Motion — Hero stagger, scroll fades, step transitions |
| 17:00 – 18:30 | Full end-to-end test: land → onboard → analyse → dashboard |
| 18:30 – 20:00 | Polish: spacing, mobile layout, loading + error states |
| 20:00 – 22:00 | Edge cases, final deploy, demo run-through |

---

## 16. Non-Negotiables

These are absolute. No exceptions.

- [ ] Dark mode default — `#0a0a0a` everywhere
- [ ] One accent colour — emerald `#10b981` only
- [ ] No motivational language anywhere in the UI
- [ ] Every screen answers: how does this help progression?
- [ ] GitHub OAuth works end-to-end before demo
- [ ] Gap analysis produces real structured JSON — not a mock
- [ ] Dashboard renders from live Supabase data — not hardcoded
- [ ] Feedback widget saves to database
- [ ] App is publicly accessible on Vercel before submission
- [ ] Mobile layout works at 375px minimum width

---

*Growth OS — MVP Spec v1.0*
*Progression → Capability → Evidence → Narrative*