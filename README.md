# 🌸 Looki Discord Bot

A soft, hyper-aesthetic Discord bot designed to manage your server with style, grace, and a touch of cute chaos. Looki combines powerful moderation tools, comprehensive XP leveling, music streaming, and fun engagement features—all wrapped in a pookie-coded aesthetic.

**Now with a Web Dashboard!** 🎀 Manage your server from a beautiful browser interface with soft cyberpunk vibes and glassmorphism design.

## 🎀 Features

### Discord Bot
- ✅ **Moderation** — Ban, kick, mute, warn with DM notifications
- ✅ **Leveling** — XP tracking, rank cards, leaderboard
- ✅ **Utility** — Server/user info, help system
- ✅ **Fun** — 8-ball, polls, interactive commands
- ✅ **Configuration** — Database-backed server settings
- ✅ **Aesthetic** — Consistent embed design system with soft colors

### Web Dashboard (New!)
- 🎨 **Beautiful Interface** — Soft cyberpunk glassmorphism design
- 📊 **Dashboard Home** — Server stats, bot health, recent actions
- 🛡️ **Moderation Suite** — Manage warnings, cases, mod actions
- 📈 **Leveling Manager** — Configure XP, view leaderboards, rank cards
- 🎭 **Role Management** — Reaction roles, button roles
- ⚙️ **Configuration** — Easy server settings management
- 📈 **Analytics** — Activity charts, command usage trends
- 🔐 **Discord OAuth** — Secure login with Discord

## 🚀 Quick Start

### Bot Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Environment:**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
DISCORD_TOKEN=your_bot_token_here
BOT_ID=your_bot_id_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Set Up Supabase Database:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor
   - Run the SQL from `supabase_schema.sql` to create tables

4. **Start the Bot:**
```bash
npm start          # Production
npm run dev         # Development with auto-reload
```

### Dashboard Setup

1. **Navigate to Dashboard:**
```bash
cd dashboard
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**
```bash
cp .env.example .env.local
```

4. **Start Dashboard Dev Server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
looki-bot/
├── index.js                    # Main bot file
├── package.json
├── .env.example
├── supabase_schema.sql         # Database schema
│
├── commands/
│   ├── moderation/             # Ban, kick, mute, warn
│   ├── leveling/               # Rank, leaderboard
│   ├── music/                  # Play, skip, queue (WIP)
│   ├── utility/                # Ping, help, serverinfo
│   ├── fun/                    # 8ball, poll
│   └── config/                 # setlog, etc.
│
├── events/
│   ├── ready.js                # Bot startup
│   ├── interactionCreate.js    # Slash commands
│   └── messageCreate.js        # Prefix commands
│
├── models/
│   ├── Warning.js              # Supabase functions
│   ├── XP.js
│   ├── ServerConfig.js
│   └── Giveaway.js
│
├── utils/
│   ├── embedBuilder.js         # Global embed styling
│   ├── duration.js             # Time parsing
│   └── supabase.js             # Supabase client
│
└── dashboard/                  # Web dashboard (Next.js 14)
    ├── app/
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## 🎨 Design System

### Colors
| Purpose | Hex | Usage |
|---------|-----|-------|
| Default / Info | #FFB6C1 | Primary accents, info embeds |
| Moderation | #C8A2C8 | Mod action embeds |
| Danger / Ban | #FF9EAE | Ban/kick notifications |
| Success | #B5EAD7 | Successful operations |
| XP / Levels | #FFDAC1 | Level-up messages |
| Music | #AEC6CF | Music commands |
| Fun / Games | #FFFACD | Fun command embeds |
| Error | #F4C2C2 | Error messages |

### Embed Standards
Every embed includes:
- ✦ "Looki ✦" author with bot avatar
- ✦ Footer: "✦ looki~ • made with ♡"
- Timestamp on every message
- Relevant category colors and icons

## 🛡️ Moderation Commands

### Basic
- `ban~` — Ban user with reason
- `kick~` — Kick user with reason
- `mute~ <duration>` — Timeout user (10s, 5m, 2h, 1d)
- `unmute~` — Remove timeout
- `warn~` — Issue warning with case #
- `warnings~ @user` — View user warnings
- `purge~ <count>` — Bulk delete messages

### Advanced
- `tempban~ @user <duration>` — Temporary ban with auto-unban
- `softban~` — Ban then unban to wipe messages
- `case~ <ID>` — View specific mod case
- `casehistory~` — Full user mod history

## 📈 Leveling Commands

- `rank~ [@user]` — View rank card with XP bar
- `leaderboard~` — Top 10 XP leaderboard
- `setxp~ @user <amount>` — Admin: set XP
- `addxp~ @user <amount>` — Admin: add XP
- `noxp~ @role` — Blacklist role from XP

## 📊 Utility Commands

- `ping~` — Latency check
- `help~` — Command guide
- `userinfo~ [@user]` — User profile with warnings
- `serverinfo~` — Server statistics
- `avatar~ [@user]` — Full resolution avatar

## 🎮 Fun Commands

- `8ball~ <question>` — Magic 8-ball
- `poll~ <question> | <opt1> | <opt2>` — Reaction poll
- `coinflip~` — Heads or tails
- `roll~ <NdN>` — Dice roller (2d20, etc.)

## 💾 Database Schema

Using **Supabase** (PostgreSQL) instead of MongoDB:

### Tables
- `warnings` — Mod warnings and cases
- `xp` — User levels and XP
- `server_config` — Guild settings
- `giveaways` — Active giveaways

All configured with proper indexes and RLS policies.

## 🔧 Tech Stack

**Bot:**
- Node.js 20+
- discord.js v14
- Supabase (PostgreSQL)
- node-cron (scheduling)
- axios (HTTP requests)

**Dashboard:**
- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion
- Recharts
- Supabase JS Client
- NextAuth.js

## 🌐 Web Dashboard

Visit `/dashboard` to access the web interface (requires Discord login).

### Pages
- **Home** — Server overview, stats, recent actions
- **Moderation** — Manage warnings, cases, mod actions
- **Leveling** — Configure XP, view leaderboards
- **Roles** — Create reaction/button roles
- **Configuration** — Server settings management

## 📚 Getting Help

- Use `/help` command in Discord for command list
- Visit dashboard at `http://localhost:3000` (dev)
- Check `README.md` files in subdirectories

## 🚀 Deployment

### Bot Deployment (VPS / Docker)
```bash
npm install
npm start
```

Use PM2 or Docker for process management.

### Dashboard Deployment (Vercel)
```bash
cd dashboard
vercel
```

Set environment variables in Vercel dashboard.

## 📝 Next Steps

1. ✅ Supabase database integration
2. ✅ Web dashboard with Next.js
3. ⏳ Music system implementation
4. ⏳ Complete moderation logging
5. ⏳ AutoMod system with word filter
6. ⏳ Welcome card image generation
7. ⏳ Giveaway scheduler with cron

## 🌸 Personality

Looki speaks with warmth and intention:
- **Success**: "done bestie ✦", "oop handled 🎀"
- **Errors**: "hmm that didn't work :( try again?"
- **Moderation**: "aww they got banned 🎀 take care out there"

Every interaction feels cute but capable, warm but firm.

## 📄 License

Looki is open-source and available for community use.

---

**Made with ♡ • Keep it cute & safe 🌸**