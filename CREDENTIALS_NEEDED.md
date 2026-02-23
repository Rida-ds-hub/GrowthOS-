# Credentials & Keys Needed

## 🔑 Required for MVP

You'll need to create accounts and get keys for these services. I'll set up placeholders so you can add them as you get them.

### 1. GitHub OAuth App
**Where:** https://github.com/settings/developers → OAuth Apps → New OAuth App

**Settings:**
- Application name: `Growth OS`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

**What to copy:**
- `GITHUB_ID` - Client ID
- `GITHUB_SECRET` - Client Secret (generate new)

---

### 2. Google OAuth App
**Where:** https://console.cloud.google.com/ → APIs & Services → Credentials

**Steps:**
1. Create a new project (or select existing)
2. Go to **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth client ID**
4. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for testing) or **Internal** (for Google Workspace)
   - App name: `Growth OS`
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue through the steps
5. Back to Credentials → **Create Credentials** → **OAuth client ID**
6. Application type: **Web application**
7. Name: `Growth OS Web Client`
8. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001` (if using port 3001)
9. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (if using port 3001)
10. Click **Create**

**What to copy:**
- `GOOGLE_CLIENT_ID` - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
- `GOOGLE_CLIENT_SECRET` - Client secret

---

### 3. LinkedIn OAuth App
**Where:** https://www.linkedin.com/developers → Create App

**Settings:**
- Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
- Request product: **Sign In with LinkedIn using OpenID Connect**

**What to copy:**
- `LINKEDIN_CLIENT_ID` - Client ID
- `LINKEDIN_CLIENT_SECRET` - Client Secret

---

### 4. Supabase Project
**Where:** https://supabase.com → New project

**What to copy:**
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - service_role key (keep secret!)

**After creating:** Run the SQL schema from `spec.md` Section 7 in the SQL Editor

---

### 5. Google Gemini API Key
**Where:** https://aistudio.google.com/app/apikey → Create API Key

**What to copy:**
- `GEMINI_API_KEY` - Your API key

**Note:** Free tier with generous limits. Using `gemini-2.5-flash` model (free, fast, and capable)

---

### 6. NextAuth Secret
**Generate:** Any random 32-character string

**What to set:**
- `NEXTAUTH_SECRET` - Random string (you can use: `openssl rand -base64 32`)

---

## 📝 Quick Setup Order

1. **Start here:** Generate `NEXTAUTH_SECRET` (can do immediately)
2. **Gemini API** - Fastest to set up (just sign up and get key from https://aistudio.google.com/app/apikey)
3. **Supabase** - Create project, get keys, run SQL schema
4. **Google OAuth** - Create app in Google Cloud Console, get Client ID/Secret
5. **GitHub OAuth** - Create app, get Client ID/Secret
6. **LinkedIn OAuth** - Create app, get Client ID/Secret (may take longer for approval)

---

## 🚀 Once You Have Keys

Add them to `.env.local` file (I'll create the template). The app will work with placeholders until you add real keys.

---

## ⚠️ Security Notes

- Never commit `.env.local` to git (already in `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must stay server-side only
- For production: Update OAuth callback URLs to your Vercel domain
