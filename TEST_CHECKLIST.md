# Testing Checklist

## Pre-Test Setup

### 1. Install Dependencies
```bash
npm install
```

If you get permission errors, try:
```bash
sudo npm install
```

Or use a node version manager:
```bash
nvm use node
npm install
```

### 2. Verify Environment Variables
Check `.env.local` has:
- ✅ `NEXTAUTH_SECRET` - Set to a random 32-char string
- ✅ `GROQ_API_KEY` - You have this
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- ⚠️ `GITHUB_ID` / `GITHUB_SECRET` - Optional (for OAuth)
- ⚠️ `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` - Optional (for OAuth)

### 3. Set Up Supabase Database
Run this SQL in Supabase SQL Editor:

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

## Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Test Scenarios

### ✅ Landing Page
- [ ] Page loads without errors
- [ ] Logo displays with blinking underscore
- [ ] Hero text animates (word stagger)
- [ ] Philosophy section shows 3 cards
- [ ] How It Works timeline displays
- [ ] What It Is Not grid shows
- [ ] CTA section visible
- [ ] Sign in button appears
- [ ] "Start your analysis" button works

### ✅ Authentication
- [ ] Click "Sign in with GitHub" → redirects to GitHub
- [ ] After GitHub auth → redirects back to app
- [ ] Session persists on page refresh
- [ ] Can access protected routes when signed in

### ✅ Onboarding Flow

#### Step 1: Set Your Goal
- [ ] Form displays correctly
- [ ] All fields required validation works
- [ ] Timeline pills select correctly
- [ ] "Continue" button enables when all fields filled
- [ ] Progress bar updates to 25%

#### Step 2: Connect Accounts
- [ ] GitHub connect button works
- [ ] Shows "Connected" state after auth
- [ ] LinkedIn connect button works (if configured)
- [ ] Website URL input accepts URLs
- [ ] Skip button works
- [ ] Continue button works
- [ ] Progress bar updates to 50%

#### Step 3: Upload Resume
- [ ] Drag and drop zone displays
- [ ] Can select PDF file via file picker
- [ ] Upload shows loading state
- [ ] Success message appears after upload
- [ ] Character count displays
- [ ] Can remove uploaded file
- [ ] Skip button works
- [ ] "Run Gap Analysis" button enables after upload
- [ ] Progress bar updates to 75%

#### Step 4: Analysis Loading
- [ ] Full-screen loader displays
- [ ] Spinner animation works
- [ ] Messages appear sequentially:
  - "Connecting profile data..." (0s)
  - "Reading your GitHub activity..." (1.5s)
  - "Parsing your experience..." (3.3s)
  - "Mapping gaps to [Target Role]..." (4.8s)
  - "Building your 90-day plan..." (after AI response)
- [ ] Redirects to dashboard after completion

### ✅ Dashboard

#### Header
- [ ] Logo displays (nav variant)
- [ ] Role progression text shows: "[Current] → [Target] in [Timeline]"
- [ ] Readiness score displays with circular progress ring
- [ ] Score color coding: red (0-40), amber (41-70), emerald (71-100)

#### Summary Card
- [ ] Gap analysis summary text displays
- [ ] Readiness score shows large number
- [ ] Score color matches value

#### Gap Radar Chart
- [ ] Radar chart renders (Recharts)
- [ ] 5 domains visible: System Design, Execution, Communication, Technical, Leadership
- [ ] Chart has emerald fill at 40% opacity
- [ ] Domain scores display below chart
- [ ] Severity badges show (high/medium/low)

#### Gap Detail Cards
- [ ] One card per gap
- [ ] Domain name displays
- [ ] Severity badge shows correct color
- [ ] Observation text displays
- [ ] Requirement text displays
- [ ] Closing action highlighted in emerald

#### 90-Day Plan
- [ ] 3 phase cards display
- [ ] Phase labels: "Days 1-30", "Days 31-60", "Days 61-90"
- [ ] Theme displays for each phase
- [ ] 3 actions listed per phase
- [ ] Current phase has emerald border
- [ ] "Current" label shows on active phase

#### Promotion Narrative
- [ ] Card displays with dark background
- [ ] "Your Promotion Story" label shows
- [ ] Narrative text in block quote style
- [ ] Left border is emerald

#### Locked Sections
- [ ] 5 locked sections display
- [ ] Blurred overlay visible
- [ ] Lock icon shows
- [ ] "Coming Soon" label displays
- [ ] Principle badge shows
- [ ] "Notify me" button works
- [ ] Button shows "✓ Notified" after click
- [ ] Feedback saved to database

#### Feedback Widget
- [ ] Floating button bottom-right
- [ ] Button says "Share Feedback"
- [ ] Click opens modal
- [ ] Type selector works (Bug/Feature/General)
- [ ] Textarea accepts input (max 500 chars)
- [ ] Character counter works
- [ ] Email field optional
- [ ] Submit button works
- [ ] Success message shows
- [ ] Modal closes after submission

### ✅ Error Handling
- [ ] Unauthenticated user redirected from protected routes
- [ ] Missing gap analysis shows "Complete your analysis" message
- [ ] API errors handled gracefully
- [ ] Loading states show during async operations
- [ ] Form validation prevents invalid submissions

### ✅ Mobile Responsiveness
- [ ] Landing page works at 375px width
- [ ] Onboarding steps stack properly on mobile
- [ ] Dashboard cards stack on mobile
- [ ] 90-day plan scrolls horizontally on mobile
- [ ] Feedback widget doesn't overlap content
- [ ] Navigation readable on small screens

---

## Common Issues & Fixes

### Issue: "Module not found" errors
**Fix**: Run `npm install` to install dependencies

### Issue: "NEXTAUTH_SECRET is not set"
**Fix**: Add `NEXTAUTH_SECRET` to `.env.local` (generate with `openssl rand -base64 32`)

### Issue: Supabase connection fails
**Fix**: 
- Verify Supabase credentials in `.env.local`
- Check RLS policies are set up
- Ensure service role key is used server-side only

### Issue: Gap analysis fails
**Fix**:
- Check Groq API key is valid
- Verify API rate limits not exceeded
- Check input data is valid (not too long)

### Issue: OAuth redirects fail
**Fix**:
- Verify callback URLs match in OAuth app settings
- Check `NEXTAUTH_URL` matches your dev URL
- Ensure OAuth app credentials are correct

### Issue: PDF parsing fails
**Fix**:
- Ensure file is valid PDF
- Check file size (should be reasonable)
- Verify `/api/parse-resume` route is accessible

---

## Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] API responses < 5 seconds
- [ ] Images/assets load quickly

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Next Steps After Testing

1. Fix any bugs found
2. Deploy to Vercel
3. Test production build
4. Set up production environment variables
5. Update OAuth callback URLs for production
