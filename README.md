# Growth OS

**Build the evidence. Earn the promotion.**

Growth OS is a structured career progression engine for tech professionals. It maps where you are, where you need to be, identifies gaps, trains decision-making maturity daily, captures real impact continuously, and compiles promotion-ready evidence over time.

## Core Loop

**Progression → Capability → Evidence → Narrative**

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Animation:** Framer Motion
- **Auth:** NextAuth.js (GitHub + LinkedIn OAuth)
- **Database:** Supabase (PostgreSQL + JSONB)
- **AI:** Google Gemini API (gemini-2.5-flash)
- **Charts:** Recharts
- **Deployment:** Vercel

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up Supabase:**
   - Create a project at https://supabase.com
   - Run the SQL schema from `spec.md` Section 7
   - Add credentials to `.env.local`

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open:** [http://localhost:3000](http://localhost:3000)

## Documentation

- **Full Specification:** [`spec.md`](./spec.md) - Complete product spec
- **Implementation Plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Build phases
- **Setup Guide:** [`SETUP.md`](./SETUP.md) - Detailed setup instructions
- **Credentials:** [`CREDENTIALS_NEEDED.md`](./CREDENTIALS_NEEDED.md) - Where to get API keys

## Project Status

### ✅ Completed
- Project structure and configuration
- TypeScript types and utilities
- NextAuth setup
- Supabase clients
- Groq AI client
- Landing page components
- Basic UI components

### 🚧 In Progress
- Onboarding flow
- Dashboard components
- API routes

### 📋 Planned
- Gap analysis API
- GitHub integration
- Resume parsing
- Feedback system

## Principles

1. **Plan or Fail** - You cannot progress without a map
2. **Human Thinks. AI Executes.** - Train thinking, AI handles execution
3. **Visibility Is Not Optional** - Build the signal systematically

## License

Private - Hackathon Build
