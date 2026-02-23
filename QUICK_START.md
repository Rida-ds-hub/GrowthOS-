# Quick Start - Testing GrowthOS

## Step 1: Install Dependencies

```bash
npm install
```

If you get permission errors:
```bash
sudo npm install
```

Or use nvm:
```bash
nvm use node
npm install
```

---

## Step 2: Verify Environment Variables

Make sure `.env.local` has these set (you already have GROQ_API_KEY):

```env
NEXTAUTH_SECRET=your-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-key-here (you have this)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 3: Set Up Supabase Database

1. Go to your Supabase project
2. Open SQL Editor
3. Run this SQL:

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

---

## Step 4: Start Development Server

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Step 5: Test the Flow

### 1. Landing Page
- Should see logo with blinking underscore
- Hero text animates
- Click "Sign in with GitHub" or "Start your analysis"

### 2. Sign In
- If not signed in, you'll be redirected
- Sign in with GitHub
- You'll be redirected to `/onboarding`

### 3. Onboarding
- **Step 1**: Fill in current role, target role, years exp, select timeline
- **Step 2**: (Optional) Connect GitHub/LinkedIn, add website
- **Step 3**: (Optional) Upload resume PDF
- **Step 4**: Watch the analysis loading screen
- Automatically redirects to dashboard

### 4. Dashboard
- Should see your gap analysis
- Radar chart with 5 domains
- Gap detail cards
- 90-day plan
- Promotion narrative
- Locked "Coming Soon" sections
- Feedback widget (bottom-right)

---

## Troubleshooting

### "Module not found"
→ Run `npm install`

### "NEXTAUTH_SECRET is not set"
→ Add it to `.env.local` (generate with `openssl rand -base64 32`)

### "Cannot connect to Supabase"
→ Check your Supabase credentials in `.env.local`

### "Gap analysis failed"
→ Check Groq API key is valid and not rate-limited

### OAuth redirects fail
→ Make sure callback URLs in GitHub/LinkedIn apps match:
   - `http://localhost:3000/api/auth/callback/github`
   - `http://localhost:3000/api/auth/callback/linkedin`

### PDF upload fails
→ Make sure file is a valid PDF and not too large

---

## What to Check

✅ Landing page loads
✅ Animations work
✅ Sign in works
✅ Onboarding flow completes
✅ Dashboard displays data
✅ All components render correctly
✅ No console errors
✅ Mobile responsive

---

## Next Steps

Once everything works:
1. Test with real data
2. Check mobile responsiveness
3. Deploy to Vercel
4. Set production environment variables
5. Update OAuth callback URLs for production domain
