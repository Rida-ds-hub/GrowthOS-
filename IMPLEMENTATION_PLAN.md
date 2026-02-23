# GrowthOS Implementation Plan

## Overview
This plan breaks down the GrowthOS MVP implementation into logical phases, following the 48-hour build order from the spec while organizing tasks by dependencies and priority.

---

## Phase 0: Project Setup & Infrastructure (0:00 - 2:30)

### 0.1 Bootstrap Project (0:00 - 0:30)
- [ ] Run Next.js bootstrap command with TypeScript, Tailwind, ESLint, App Router, src directory
- [ ] Initialize Shadcn/ui
- [ ] Install required Shadcn components: button, card, badge, progress, separator, skeleton, tabs, input, label
- [ ] Install dependencies: next-auth, @supabase/supabase-js, groq, pdf-parse, framer-motion, lucide-react, recharts
- [ ] Install dev dependencies: @types/pdf-parse
- [ ] Create `.env.local` template
- [ ] Add `.env.local` to `.gitignore`
- [ ] Deploy empty app to Vercel
- [ ] Set up Vercel environment variables (placeholders)

### 0.2 Authentication Setup (0:30 - 1:30)
- [ ] Create GitHub OAuth App
- [ ] Create LinkedIn OAuth App
- [ ] Set up NextAuth.js configuration
- [ ] Create `/api/auth/[...nextauth]/route.ts`
- [ ] Configure GitHub provider
- [ ] Configure LinkedIn provider
- [ ] Test sign in/out flow
- [ ] Add SessionProvider to root layout

### 0.3 Database Setup (1:30 - 2:30)
- [ ] Create Supabase project
- [ ] Run database schema SQL (profiles, feedback tables)
- [ ] Set up Row Level Security policies
- [ ] Create `lib/supabase.ts` (server client)
- [ ] Create `lib/supabase-browser.ts` (browser client)
- [ ] Test database connection
- [ ] Update Vercel env vars with Supabase credentials

---

## Phase 1: Core Infrastructure & Types (2:30 - 3:00)

### 1.1 Type Definitions
- [ ] Create `lib/types.ts` with all interfaces:
  - [ ] `GapAnalysis` interface
  - [ ] `Profile` interface
  - [ ] `Feedback` interface
  - [ ] Domain score types
  - [ ] Gap severity types

### 1.2 Library Utilities
- [ ] Create `lib/groq.ts` - Groq client instance
- [ ] Create `lib/prompts.ts` - Gap analysis prompt builder
- [ ] Create `lib/github.ts` - GitHub REST API helpers
- [ ] Set up Groq API key in environment

---

## Phase 2: Landing Page (3:00 - 5:00)

### 2.1 Hero Section (3:00 - 3:30)
- [ ] Create `components/landing/Hero.tsx`
- [ ] Implement full viewport height layout
- [ ] Add dark background (#0a0a0a) with emerald radial gradient
- [ ] Add headline with word stagger animation (Framer Motion)
- [ ] Add subtitle
- [ ] Add CTA button linking to `/onboarding`
- [ ] Update `app/page.tsx` to render Hero

### 2.2 Philosophy Section (3:30 - 4:00)
- [ ] Create `components/landing/Philosophy.tsx`
- [ ] Build 3-card layout (horizontal desktop, stacked mobile)
- [ ] Add scroll-triggered fade animations (`whileInView`)
- [ ] Add content for 3 principles
- [ ] Integrate into landing page

### 2.3 How It Works Section (4:00 - 4:30)
- [ ] Create `components/landing/HowItWorks.tsx`
- [ ] Build vertical animated timeline
- [ ] Add 5 items with scroll fade animations
- [ ] Integrate into landing page

### 2.4 What It Is Not Section (4:30 - 4:45)
- [ ] Create `components/landing/WhatItIsNot.tsx`
- [ ] Build 4-card grid with strikethrough labels
- [ ] Integrate into landing page

### 2.5 Final CTA Section (4:45 - 5:00)
- [ ] Create `components/landing/CTA.tsx`
- [ ] Build dark banner with emerald top border
- [ ] Add CTA button
- [ ] Integrate into landing page

---

## Phase 3: Onboarding Flow (5:00 - 8:30)

### 3.1 Onboarding Layout & State (5:00 - 5:30)
- [ ] Create `app/onboarding/page.tsx`
- [ ] Set up multi-step wizard state management
- [ ] Add fixed emerald progress bar at top
- [ ] Add dot indicators at bottom
- [ ] Implement `AnimatePresence` slide transitions

### 3.2 Step 1: Set Your Goal (5:30 - 6:00)
- [ ] Create `components/onboarding/StepGoal.tsx`
- [ ] Add current role input
- [ ] Add target role input
- [ ] Add years of experience input
- [ ] Add timeline pill buttons (3/6/9/12 months)
- [ ] Add validation (all 4 required)
- [ ] Add continue button

### 3.3 Step 2: Connect Accounts (6:00 - 7:00)
- [ ] Create `components/onboarding/StepConnect.tsx`
- [ ] Add GitHub OAuth button
- [ ] Implement GitHub connection flow
- [ ] Show "✓ Connected as @username" on success
- [ ] Add LinkedIn OAuth button
- [ ] Implement LinkedIn connection flow
- [ ] Show "✓ Connected" on success
- [ ] Add website URL input (optional)
- [ ] Add tooltips explaining what each connection unlocks
- [ ] Add skip option
- [ ] Create `/api/github/profile/route.ts` to fetch GitHub data

### 3.4 Step 3: Upload Resume (7:00 - 7:30)
- [ ] Create `components/onboarding/StepResume.tsx`
- [ ] Create `/api/parse-resume/route.ts`
- [ ] Implement PDF drag-and-drop zone
- [ ] Add file upload handler
- [ ] Call parse-resume API on upload
- [ ] Store extracted text in component state
- [ ] Show success state: "✓ Resume parsed successfully"
- [ ] Add skip option
- [ ] Add "Run Gap Analysis →" button

### 3.5 Step 4: Analysis Loading (7:30 - 8:00)
- [ ] Create `components/onboarding/AnalysisLoader.tsx`
- [ ] Implement full-screen loading view
- [ ] Add sequential animated messages:
  - "Connecting profile data..." (0s)
  - "Reading your GitHub activity..." (1.5s)
  - "Parsing your experience..." (3.3s)
  - "Mapping gaps to [Target Role]..." (4.8s - triggers AI call)
  - "Building your 90-day plan..." (after response)
- [ ] Implement redirect to `/dashboard` after completion

### 3.6 Gap Analysis API (8:00 - 8:30)
- [ ] Create `/api/gap-analysis/route.ts`
- [ ] Add session authentication check
- [ ] Implement rate limiting (60 minutes per user)
- [ ] Collect all user data (goal, GitHub, resume, LinkedIn)
- [ ] Apply input caps (currentRole: 100, targetRole: 100, resumeText: 8000, etc.)
- [ ] Build prompt using `lib/prompts.ts`
- [ ] Call Groq API with proper config (model, temperature, max_tokens)
- [ ] Strip markdown code fences from response
- [ ] Parse and validate JSON
- [ ] Validate all 5 domainScores keys exist
- [ ] Save to Supabase `profiles.gap_analysis` JSONB column
- [ ] Update `profiles.onboarding_complete = true`
- [ ] Handle errors with user-friendly messages
- [ ] Wire full flow: Step 3 → gap-analysis → Supabase → redirect

---

## Phase 4: Dashboard - Core Sections (8:30 - 12:00)

### 4.1 Dashboard Layout & Data Fetching (8:30 - 9:00)
- [ ] Create `app/dashboard/page.tsx`
- [ ] Implement server-side data fetching
- [ ] Fetch `gap_analysis` from Supabase for authenticated user
- [ ] Handle `null` case - show "Complete your analysis" prompt
- [ ] Create dashboard layout structure

### 4.2 Header Bar (9:00 - 9:30)
- [ ] Add Growth OS wordmark (left)
- [ ] Add "[Current Role] → [Target Role] in [Timeline]" (center)
- [ ] Create `components/dashboard/ReadinessScore.tsx`
- [ ] Add readiness score % with circular progress ring (emerald)
- [ ] Integrate into header

### 4.3 Summary Card (9:30 - 10:00)
- [ ] Create summary card component
- [ ] Display `gap_analysis.summary` (2-3 sentences)
- [ ] Display `gap_analysis.readinessScore` with color coding:
  - 0-40: red
  - 41-70: amber
  - 71-100: emerald

### 4.4 Gap Radar Chart (10:00 - 11:00)
- [ ] Create `components/dashboard/GapRadar.tsx`
- [ ] Install and configure Recharts RadarChart
- [ ] Build pentagon shape with 5 axes:
  - System Design Maturity
  - Execution Scope
  - Communication & Visibility
  - Technical Depth
  - Leadership & Influence
- [ ] Map data from `gap_analysis.domainScores`
- [ ] Add emerald fill at 40% opacity
- [ ] Add score labels on each axis
- [ ] Add gap severity badges

### 4.5 Gap Detail Cards (11:00 - 11:30)
- [ ] Create `components/dashboard/GapCards.tsx`
- [ ] Build card component for each gap
- [ ] Display domain name
- [ ] Display gap severity badge (high=red, medium=amber, low=emerald)
- [ ] Display observation
- [ ] Display requirement
- [ ] Display closing action
- [ ] Map over `gap_analysis.gaps` array

### 4.6 90-Day Plan (11:30 - 12:00)
- [ ] Create `components/dashboard/PlanTimeline.tsx`
- [ ] Build 3 cards side by side (horizontal scroll on mobile)
- [ ] Display Phase 1 (Days 1-30): theme + 3 actions
- [ ] Display Phase 2 (Days 31-60): theme + 3 actions
- [ ] Display Phase 3 (Days 61-90): theme + 3 actions
- [ ] Highlight current phase with emerald border
- [ ] Map data from `gap_analysis.plan`

### 4.7 Promotion Narrative (12:00 - 12:15)
- [ ] Create `components/dashboard/PromotionNarrative.tsx`
- [ ] Build full-width dark card
- [ ] Add "Your Promotion Story" label
- [ ] Display `gap_analysis.promotionNarrative` as styled block quote

---

## Phase 5: Dashboard - Locked Sections & Feedback (12:15 - 13:30)

### 5.1 Locked Section Component (12:15 - 12:45)
- [ ] Create `components/dashboard/LockedSection.tsx` (reusable)
- [ ] Add blurred overlay
- [ ] Add lock icon
- [ ] Add title + description
- [ ] Add principle connection label
- [ ] Add "Notify me when this launches" button

### 5.2 Locked Features (12:45 - 13:00)
- [ ] Add Daily Design Drill locked section
- [ ] Add Impact Bank locked section
- [ ] Add Promotion Readiness Score locked section
- [ ] Add LinkedIn Post Generator locked section
- [ ] Add Resume Impact Bullets locked section
- [ ] Each with notify button

### 5.3 Feedback Widget (13:00 - 13:30)
- [ ] Create `components/dashboard/FeedbackWidget.tsx`
- [ ] Add fixed floating button (bottom-right): "Share Feedback"
- [ ] Create modal with:
  - Type selector (Bug / Feature Request / General)
  - Textarea (max 500 chars)
  - Optional email field
- [ ] Create `/api/feedback/route.ts`
- [ ] Add session authentication
- [ ] Save to Supabase `feedback` table
- [ ] Handle notify button clicks (type='interest', page=feature name)
- [ ] Show success message: "Thank you. Your feedback shapes what we build next."

---

## Phase 6: Animations & Polish (13:30 - 18:30)

### 6.1 Framer Motion Integration (13:30 - 15:30)
- [ ] Add Hero word stagger animations (0.08s delay per word)
- [ ] Add scroll-triggered fades (`whileInView`) to Philosophy section
- [ ] Add scroll-triggered fades to How It Works timeline
- [ ] Add onboarding step slide transitions (`AnimatePresence`)
- [ ] Add progress bar width transitions (0.5s ease-out)
- [ ] Ensure all animations are slow and confident (no bounce)

### 6.2 Design System Implementation (15:30 - 17:00)
- [ ] Update `app/globals.css` with Tailwind base
- [ ] Set dark background default (#0a0a0a)
- [ ] Apply color tokens throughout:
  - bg-page: #0a0a0a
  - bg-surface-1: #111111
  - bg-surface-2: #1a1a1a
  - border: #27272a
  - accent: #10b981 (emerald-500)
  - text-primary: #f5f5f5
  - text-secondary: #a1a1aa
- [ ] Apply component patterns (cards, inputs, buttons, badges)
- [ ] Ensure single accent color only (emerald)

### 6.3 Mobile Responsiveness (17:00 - 18:00)
- [ ] Test all screens at 375px minimum width
- [ ] Fix Philosophy section (stack on mobile)
- [ ] Fix 90-Day Plan (horizontal scroll on mobile)
- [ ] Ensure all forms work on mobile
- [ ] Test drag-and-drop on mobile (fallback to file picker)
- [ ] Verify feedback widget doesn't overlap key UI

### 6.4 Loading & Error States (18:00 - 18:30)
- [ ] Add loading states for all async operations
- [ ] Add error states with user-friendly messages
- [ ] Handle API failures gracefully
- [ ] Add disabled states during form submissions
- [ ] Add skeleton loaders where appropriate

---

## Phase 7: Testing & Deployment (18:30 - 22:00)

### 7.1 End-to-End Testing (18:30 - 20:00)
- [ ] Test complete user flow:
  - Landing page → Onboarding → Analysis → Dashboard
- [ ] Test GitHub OAuth connection
- [ ] Test LinkedIn OAuth connection
- [ ] Test resume upload and parsing
- [ ] Test gap analysis generation
- [ ] Test dashboard rendering from live data
- [ ] Test feedback widget submission
- [ ] Test notify buttons on locked sections
- [ ] Test rate limiting on gap analysis
- [ ] Test session authentication on all API routes

### 7.2 Edge Cases & Security (20:00 - 21:00)
- [ ] Test with missing GitHub data
- [ ] Test with missing resume
- [ ] Test with missing LinkedIn data
- [ ] Test with invalid PDF
- [ ] Test with very long text inputs (verify caps)
- [ ] Test with malformed AI response (verify JSON parsing)
- [ ] Verify SUPABASE_SERVICE_ROLE_KEY never exposed to client
- [ ] Verify GROQ_API_KEY never exposed to client
- [ ] Test RLS policies (users can only access their own data)
- [ ] Test 401 responses for unauthenticated requests

### 7.3 Final Polish (21:00 - 21:30)
- [ ] Review spacing and typography
- [ ] Ensure no motivational language anywhere
- [ ] Verify all copy matches spec tone
- [ ] Check all color tokens match spec
- [ ] Remove any bounce/playful animations
- [ ] Verify all locked sections show placeholder only

### 7.4 Deployment & Verification (21:30 - 22:00)
- [ ] Final deploy to Vercel
- [ ] Verify all environment variables set
- [ ] Test production build locally
- [ ] Verify public accessibility
- [ ] Run final demo run-through
- [ ] Document any known limitations

---

## Phase 8: Documentation & Handoff (22:00+)

### 8.1 Documentation
- [ ] Update README.md with:
  - Project description
  - Setup instructions
  - Environment variables needed
  - How to run locally
  - Deployment steps
- [ ] Document API routes
- [ ] Document component structure

### 8.2 Known Limitations
- [ ] Document LinkedIn data read limitations (OAuth only, no profile data)
- [ ] Document rate limiting behavior
- [ ] Document free tier Groq API limits

---

## Critical Dependencies Map

```
Phase 0 (Setup)
  └─> Phase 1 (Types & Utils)
      └─> Phase 2 (Landing)
          └─> Phase 3 (Onboarding)
              └─> Phase 4 (Dashboard)
                  └─> Phase 5 (Locked Sections)
                      └─> Phase 6 (Polish)
                          └─> Phase 7 (Testing)
```

## Key Milestones

1. **Milestone 1 (2:30)**: Authentication & Database working
2. **Milestone 2 (5:00)**: Landing page complete
3. **Milestone 3 (8:30)**: Onboarding flow complete with gap analysis
4. **Milestone 4 (12:00)**: Dashboard core sections rendering live data
5. **Milestone 5 (13:30)**: All features complete, ready for polish
6. **Milestone 6 (18:30)**: Fully polished, ready for testing
7. **Milestone 7 (22:00)**: Production-ready, deployed

---

## Non-Negotiables Checklist

- [ ] Dark mode default (#0a0a0a) everywhere
- [ ] One accent color (emerald #10b981) only
- [ ] No motivational language anywhere
- [ ] Every screen answers: how does this help progression?
- [ ] GitHub OAuth works end-to-end
- [ ] Gap analysis produces real structured JSON (not mock)
- [ ] Dashboard renders from live Supabase data (not hardcoded)
- [ ] Feedback widget saves to database
- [ ] App publicly accessible on Vercel
- [ ] Mobile layout works at 375px minimum

---

## Notes

- Follow the exact tech stack from spec (Next.js 14, Tailwind, Shadcn, Supabase, Groq, etc.)
- Use exact file structure from spec Section 4
- Follow exact color tokens from spec Section 11
- All animations must be slow and confident (no bounce)
- Every API route must authenticate session first
- All AI responses must be validated before saving
- Rate limit gap analysis to 60 minutes per user
- Never expose service role keys or API keys to client
