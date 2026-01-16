# Quick Start

## Production URL
```
https://practice-webapp.vercel.app
```
(Update this with your actual Vercel URL)

## Login Options

### Admin Login (Testing)
- **Username:** `admin`
- **Password:** `admin123`

### Google Sign-In
Click "Sign in with Google" button

## Local Development
```bash
npm run dev
```

## Deploy to Production
```bash
git add -A && git commit -m "your message" && git push
```

## Supabase Setup

### Project URL
```
https://prnciepfarltktfopmca.supabase.co
```

### Anon Key
```
sb_publishable_FQdLDdCIkgqWKMgmuhaeZw_90TXB7zT
```

### Database Schema (run in SQL Editor)
See `supabase-schema.sql`

### Enable Google OAuth
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google
3. Get OAuth credentials from Google Cloud Console:
   - Create a project at https://console.cloud.google.com
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://prnciepfarltktfopmca.supabase.co/auth/v1/callback`
4. Add Client ID and Secret to Supabase

## Vercel Environment Variables
Add in Vercel Dashboard > Settings > Environment Variables:
- `VITE_SUPABASE_URL` = `https://prnciepfarltktfopmca.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_FQdLDdCIkgqWKMgmuhaeZw_90TXB7zT`

## Data Storage
- **Patterns:** localStorage (per-browser, managed in Pattern Database UI)
- **Progress/Sessions:** Supabase (per-user, synced to cloud)
