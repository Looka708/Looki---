# 🌸 Looki Setup Guide

Complete setup instructions for the Looki Discord Bot + Web Dashboard with Supabase.

## Table of Contents

1. [Discord Bot Setup](#discord-bot-setup)
2. [Supabase Setup](#supabase-setup)
3. [Dashboard Setup](#dashboard-setup)
4. [Discord OAuth Setup](#discord-oauth-setup)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Discord Bot Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it "Looki" and click **Create**
4. Go to **Bot** tab → **Add Bot**
5. Copy the **TOKEN** (you'll need it for `.env`)

### Step 2: Configure Bot Permissions

In **OAuth2** → **URL Generator**:
- Scopes: `bot`, `applications.commands`
- Permissions:
  - General: Read Messages/View Channels, Send Messages, Manage Messages
  - Moderation: Ban Members, Kick Members, Manage Roles, Timeout Members
  - Voice: Connect, Speak

Copy the generated URL to invite the bot to your server.

### Step 3: Set Up Environment Variables

In root directory, create `.env`:

```env
# Discord
DISCORD_TOKEN=your_token_here
BOT_ID=your_bot_id_here
GUILD_ID=your_test_guild_id (optional)

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Install Dependencies

```bash
npm install
```

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project** or **Start a new project**
3. Choose your organization
4. **Project Name**: Looki
5. **Database Password**: Create a strong password
6. **Region**: Choose closest to your location
7. Click **Create New Project** (wait 2-3 minutes)

### Step 2: Get Connection Details

1. Go to **Project Settings** → **Database**
2. Copy these values for `.env`:
   - **SUPABASE_URL**: Project URL (in settings or visible on main page)
   - **Connection Pooler** settings (if needed for production)

3. Go to **Settings** → **API**
   - **SUPABASE_ANON_KEY**: `anon` key
   - **SUPABASE_SERVICE_ROLE_KEY**: `service_role` key (keep secret!)

### Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase_schema.sql` (in project root)
4. Paste it into the SQL editor
5. Click **Run**

This creates:
- `warnings` table (moderation)
- `xp` table (leveling)
- `server_config` table (settings)
- `giveaways` table (giveaways)

### Step 4: Verify Tables

1. Go to **Table Editor**
2. You should see all 4 tables listed
3. Click each to verify they have the correct columns

---

## Dashboard Setup

### Step 1: Install Dashboard Dependencies

```bash
cd dashboard
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```env
# Supabase (same as bot)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# NextAuth
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth (see next section)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Bot API
NEXT_PUBLIC_BOT_API_URL=http://localhost:3001
```

### Step 3: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

---

## Discord OAuth Setup

### Step 1: Create OAuth2 Application

1. **Discord Developer Portal** → Your Application
2. Go to **OAuth2** → **General**
3. Copy **Client ID** and **Client Secret**

### Step 2: Add Redirect URIs

In **OAuth2** → **Redirects**:

Add these URIs:
- Development: `http://localhost:3000/api/auth/callback/discord`
- Production: `https://yourdomain.com/api/auth/callback/discord`

### Step 3: Copy Credentials

Add to `.env.local`:
```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

---

## Running the Project

### Run Bot Only

```bash
npm start          # Production
npm run dev        # Development
```

### Run Dashboard Only

```bash
cd dashboard
npm run dev
```

Visit `http://localhost:3000` and login with Discord.

### Run Both (in separate terminals)

**Terminal 1:**
```bash
npm start
```

**Terminal 2:**
```bash
cd dashboard && npm run dev
```

---

## Deployment

### Deploy Bot to VPS/Server

1. **Install Node.js 20+** on your server
2. **Clone repository**:
   ```bash
   git clone your_repo.git
   cd looki-bot
   ```
3. **Set environment variables**: Create `.env` file
4. **Install dependencies**: `npm install`
5. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "looki-bot"
   pm2 save
   ```

### Deploy Dashboard to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Select your GitHub repository
   - Root Directory: `dashboard`
3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXTAUTH_SECRET=...
   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...
   NEXTAUTH_URL=https://yourdomain.vercel.app
   ```
4. **Deploy**

---

## Troubleshooting

### Bot won't start

**Error**: `Cannot find module '@supabase/supabase-js'`
- Fix: Run `npm install` again

**Error**: `DISCORD_TOKEN is undefined`
- Fix: Check `.env` file exists and has correct `DISCORD_TOKEN`

**Error**: `Supabase connection failed`
- Fix: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct

### Dashboard won't load

**Error**: `NEXT_PUBLIC_SUPABASE_URL is undefined`
- Fix: Check `.env.local` has correct Supabase credentials

**Error**: `Login fails with Discord`
- Fix: Verify Discord OAuth credentials and redirect URIs in Developer Portal

### Database issues

**Tables don't exist**
- Fix: Run `supabase_schema.sql` in Supabase SQL Editor again

**Can't query data**
- Fix: Check RLS policies (Row Level Security) — should be disabled during development

### Rate limiting

**429 Too Many Requests**
- Fix: Implement rate limiting in dashboard or reduce API calls

---

## Project File Structure

```
Looki 🌸/
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # This file
├── supabase_schema.sql         # Database schema
├── package.json
├── index.js
├── .env.example
│
├── commands/
├── events/
├── models/                     # Supabase functions
├── utils/
│   ├── embedBuilder.js
│   ├── duration.js
│   └── supabase.js            # Supabase client
│
└── dashboard/
    ├── README.md
    ├── package.json
    ├── .env.example
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx
    │   ├── auth/login/page.tsx
    │   └── dashboard/
    │       ├── layout.tsx
    │       └── page.tsx
    └── ...next.js files
```

---

## Database Migration from MongoDB to Supabase

If you had MongoDB before, here's how to migrate:

### Export MongoDB Data

```bash
mongoexport --db looki --collection warnings --out warnings.json
mongoexport --db looki --collection xp --out xp.json
```

### Import to Supabase

1. Transform JSON to match Supabase schema
2. Use Supabase CSV import or insert via SQL
3. Test all functionality

---

## Security Best Practices

✅ **Do:**
- Use environment variables for all secrets
- Keep `.env` in `.gitignore`
- Use `SUPABASE_SERVICE_ROLE_KEY` only server-side
- Enable Supabase RLS for production
- Use Discord OAuth for dashboard auth

❌ **Don't:**
- Commit `.env` files to GitHub
- Expose `DISCORD_TOKEN` or service role key
- Use bot token in frontend
- Disable RLS in production

---

## Next Steps

1. ✅ Bot + Dashboard running locally
2. ⏳ Set up Discord for testing
3. ⏳ Deploy bot to production server
4. ⏳ Deploy dashboard to Vercel
5. ⏳ Configure custom domain

---

## Support

For issues:
1. Check troubleshooting section
2. Review error logs
3. Check Supabase dashboard for database errors
4. Review Discord Developer Portal settings

---

**Made with ♡ • Keep it cute & safe 🌸**