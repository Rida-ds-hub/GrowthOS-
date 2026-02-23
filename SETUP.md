# GrowthOS Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

If you encounter permission issues, try:
```bash
sudo npm install
```

### 2. Set Up Environment Variables

Copy the example file and add your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your actual keys (see `CREDENTIALS_NEEDED.md` for where to get them).

**Minimum to get started:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `GROQ_API_KEY` - Get from https://console.groq.com
- `NEXT_PUBLIC_SUPABASE_URL` - Get from Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Get from Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase project

The app will work with placeholder values for OAuth until you add real keys.

### 3. Set Up Supabase Database

1. Go to your Supabase project
2. Open SQL Editor
3. Run the schema from `spec.md` Section 7:

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
  type        text not null,
  message     text not null,
  page        text,
  created_at  timestamp default now()
);

alter table profiles enable row level security;
create policy "Users own their profile"
  on profiles for all
  using (user_id = current_setting('app.current_user_id', true));
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── onboarding/        # Onboarding flow
│   ├── dashboard/         # Main dashboard
│   └── api/              # API routes
├── components/
│   ├── landing/           # Landing page components
│   ├── onboarding/       # Onboarding components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # Shadcn UI components
└── lib/                   # Utilities and configs
    ├── types.ts           # TypeScript types
    ├── supabase.ts        # Supabase server client
    ├── supabase-browser.ts # Supabase browser client
    ├── groq.ts            # Groq AI client
    ├── prompts.ts         # AI prompt templates
    └── github.ts          # GitHub API helpers
```

---

## ✅ What's Already Built

- ✅ Project structure and configuration
- ✅ TypeScript types
- ✅ NextAuth setup (GitHub + LinkedIn)
- ✅ Supabase clients (server + browser)
- ✅ Groq AI client
- ✅ Landing page components (Hero, Philosophy, How It Works, etc.)
- ✅ Basic UI components (Button, Card)
- ✅ Environment variable placeholders

---

## 🔨 Next Steps

1. **Install dependencies** (run `npm install`)
2. **Add your credentials** to `.env.local`
3. **Set up Supabase** database schema
4. **Test the landing page** - should work immediately
5. **Build onboarding flow** - next phase
6. **Build dashboard** - after onboarding

---

## 🐛 Troubleshooting

### npm install fails
- Try `sudo npm install` or use a node version manager (nvm)

### Environment variables not working
- Make sure `.env.local` exists in project root
- Restart dev server after adding env vars
- Check that variable names match exactly

### Supabase connection fails
- Verify your project URL and keys
- Check that RLS policies are set up
- Make sure service role key is used server-side only

### NextAuth not working
- Verify OAuth app callback URLs match
- Check that `NEXTAUTH_SECRET` is set
- For local dev, `NEXTAUTH_URL` should be `http://localhost:3000`

---

## 📚 Documentation

- Full spec: `spec.md`
- Implementation plan: `IMPLEMENTATION_PLAN.md`
- Credentials guide: `CREDENTIALS_NEEDED.md`
