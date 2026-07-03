# Vevhu Field App — API Keys Setup Guide

## Overview
You need keys from 4 free services to connect everything. Total time: ~15 minutes.

---

## 1. SUPABASE (Most Important — Do First)

**What it gives us:** Database, user authentication, realtime updates, serverless functions

### Steps:
1. Go to https://supabase.com and click "Start your project"
2. Sign up with GitHub or email
3. Click "New Project"
4. Fill in:
   - Organization: Create one (e.g., "Vevhu Resources")
   - Project name: `vevhu-field`
   - Database password: Choose a strong password (SAVE THIS — you'll need it for PowerSync)
   - Region: Choose closest to Zimbabwe (e.g., "South Africa - Cape Town" or "Europe - London")
5. Wait 1-2 minutes for project to be ready
6. Go to **Settings → API** (left sidebar)

### Keys to copy:
```
SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co    (Project URL)
SUPABASE_ANON_KEY = eyJhbGciOi......                (anon / public key)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOi......        (service_role / secret key)
```

### Also note (for PowerSync later):
- Go to **Settings → Database**
- Copy the **Host**: `db.xxxxxxxxxxxxx.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: the one you set when creating the project

### After getting keys — Run the migration:
1. Go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Paste the contents of `~/vevhu-mobile/supabase/migrations/001_initial.sql`
4. Click "Run"
5. Then paste and run `~/vevhu-mobile/seed/seed.sql`

**Cost: $0** (free tier: 500MB database, 50K auth users)

---

## 2. POWERSYNC (Offline Sync Engine)

**What it gives us:** Syncs phone's local SQLite with Supabase when online

### Steps:
1. Go to https://www.powersync.com and click "Get Started Free"
2. Sign up with email or GitHub
3. Click "Create Instance"
4. Connect to your Supabase database:
   - Host: `db.xxxxxxxxxxxxx.supabase.co` (from Supabase Settings → Database)
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: your Supabase database password
5. Define sync rules (we'll paste ours in)
6. Get your instance URL

### Key to copy:
```
POWERSYNC_URL = https://xxxxxxxxxxxxx.powersync.journeyapps.com
```

**Cost: $0** (free tier: 1GB synced data)

---

## 3. CLOUDFLARE R2 (Photo & Audio Storage)

**What it gives us:** Stores photos, audio recordings, signatures uploaded from phones

### Steps:
1. Go to https://dash.cloudflare.com and sign up (or login)
2. In the left sidebar, click **R2 Object Storage**
3. Click "Create bucket"
   - Bucket name: `vevhu-media`
   - Location: Auto (or choose nearest)
4. After bucket is created, go to **R2 → Overview → Manage R2 API Tokens**
5. Click "Create API Token"
   - Token name: `vevhu-app`
   - Permissions: **Object Read & Write**
   - Bucket: Select `vevhu-media`
6. Click "Create API Token"

### Keys to copy:
```
R2_ENDPOINT = https://xxxxxxxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET = vevhu-media
```

The endpoint uses your **Account ID** — find it on the R2 overview page.
Format: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### CORS Configuration:
After creating the bucket, go to bucket **Settings → CORS Policy** and add:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

**Cost: $0** (free tier: 10GB storage, zero egress fees)

---

## 4. MAPBOX (Map Display on Dashboard)

**What it gives us:** GPS map view showing where workers visited

### Steps:
1. Go to https://www.mapbox.com and click "Sign up"
2. After signup, go to **Account → Tokens**
3. Your default public token is already there — copy it

### Key to copy:
```
MAPBOX_TOKEN = pk.eyJ1Ijoi......
```

**Cost: $0** (free tier: 50,000 map loads/month)

---

## 5. WHATSAPP CLOUD API (Optional — Daily Summaries)

**What it gives us:** Automated daily summary messages to managers on WhatsApp

### Steps:
1. Go to https://developers.facebook.com
2. Create a Meta Developer account (use your Facebook account)
3. Click "Create App" → Choose "Business" type
4. Add the "WhatsApp" product to your app
5. In WhatsApp → Getting Started:
   - You get a test phone number
   - Add your manager's phone as a recipient
6. Go to WhatsApp → API Setup:
   - Copy the temporary access token
   - Copy the Phone Number ID

### Keys to copy:
```
WHATSAPP_TOKEN = EAAxxxxxxx......
WHATSAPP_PHONE_ID = 1234567890
```

### Note:
- The test token expires every 24 hours
- For permanent access, you need to submit your app for review (takes 1-3 days)
- You also need to create message templates and get them approved

**Cost: $0** (1000 free conversations/month)

---

## 6. EXPO / EAS (Optional — For OTA Updates)

**What it gives us:** Push code updates to phones without rebuilding APK

### Steps:
1. Go to https://expo.dev and sign up
2. Run on VM: `eas login` and enter credentials
3. Run: `eas init` in the project directory

### Not a "key" per se — just login credentials.
We can build the APK locally without this.

**Cost: $0** (30 builds/month on free tier)

---

## 7. VERCEL (Optional — Dashboard Hosting)

**What it gives us:** Hosts the manager web dashboard

### Steps:
1. Go to https://vercel.com and sign up with GitHub
2. Run on VM: `vercel login`
3. In the dashboard project: `vercel --prod`

### No key needed — just login.

**Cost: $0** (hobby plan: 100GB bandwidth)

---

## Where to Put the Keys

### Mobile App (~/vevhu-mobile/.env):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_POWERSYNC_URL=https://xxxxx.powersync.journeyapps.com
```

### Dashboard (~/vevhu-dashboard/.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxxxx
R2_SECRET_KEY=xxxxx
R2_BUCKET=vevhu-media
```

### Supabase Edge Functions (set via CLI):
```bash
supabase secrets set R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
supabase secrets set R2_ACCESS_KEY_ID=xxxxx
supabase secrets set R2_SECRET_ACCESS_KEY=xxxxx
supabase secrets set R2_BUCKET=vevhu-media
supabase secrets set WHATSAPP_TOKEN=EAAxxxxx
supabase secrets set WHATSAPP_PHONE_ID=123456
```

---

## Quick Summary

| # | Service | Time to Setup | Keys You Get |
|---|---------|--------------|-------------|
| 1 | Supabase | 3 min | URL + 2 keys |
| 2 | PowerSync | 5 min | 1 URL |
| 3 | Cloudflare R2 | 5 min | Endpoint + 2 keys + bucket |
| 4 | Mapbox | 2 min | 1 token |
| 5 | WhatsApp | 10 min | Token + Phone ID |
| 6 | Expo | 2 min | Login only |
| 7 | Vercel | 2 min | Login only |

**Total time: ~15-30 minutes for all required keys**
**Total cost: $0/month**
