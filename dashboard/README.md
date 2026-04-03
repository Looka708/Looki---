# 🌸 Looki Dashboard

A beautiful, fully-featured web dashboard for the Looki Discord bot. Manage your server with style — soft cyberpunk kawaii vibes with glassmorphism design and pastel neon accents.

## ✨ Features

- 🎀 **Soft Cyberpunk Aesthetic** — Dark glassmorphism UI with blush pink and lavender accents
- 📊 **Dashboard Home** — Server stats, recent mod actions, bot health, leaderboard
- 🛡️ **Moderation Suite** — View and manage warnings, cases, mod actions
- 📈 **Leveling System** — Configure XP, view leaderboards, create role rewards
- 🎭 **Role Management** — Reaction roles, button roles, autoroles
- 👋 **Welcome/Farewell** — Customize join and leave messages
- 🎉 **Giveaway Manager** — Create and manage giveaways
- ⚙️ **Server Configuration** — Channels, roles, permissions, integrations
- 📊 **Analytics** — Activity heatmaps, command usage, server growth trends
- 🔐 **Discord OAuth** — Secure login with Discord account

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (same as the bot)
- Discord OAuth2 credentials

### Installation

1. **Navigate to dashboard directory:**
```bash
cd dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Fill in your Supabase and Discord OAuth credentials.

4. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## 📁 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles & animations
│   ├── page.tsx             # Home page (redirects to auth/login)
│   ├── auth/
│   │   └── login/page.tsx   # Login page with Discord OAuth
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout with sidebar
│       ├── page.tsx         # Dashboard home
│       ├── moderation/      # Mod actions, warnings, cases
│       ├── leveling/        # XP settings, leaderboard, rank cards
│       ├── roles/           # Reaction roles, button roles, autoroles
│       └── config/          # General settings, channels, integrations
├── components/              # Reusable components (to be created)
├── lib/                     # Utilities
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## 🎨 Design System

### Color Palette
```css
--color-surface-base: #0D0D0F       /* Deep charcoal background */
--color-surface-card: #16151A       /* Glass card surfaces */
--color-surface-elevated: #1E1C24   /* Elevated glass surfaces */
--color-accent-pink: #FFB6C1        /* Primary accent - blush pink */
--color-accent-lavender: #C8A2C8    /* Secondary accent */
--color-accent-peach: #FFCBA4       /* Tertiary accent */
--color-success: #B5EAD7            /* Success state */
--color-danger: #FF9EAE             /* Danger/ban state */
--color-warning: #FFDAC1            /* Warning state */
--color-text-primary: #F5F0FF       /* Primary text */
--color-text-secondary: #9B8FAE     /* Secondary text */
```

### Typography
- **Display**: Playfair Display (serif, elegant)
- **Body**: DM Sans (clean, modern)
- **Mono**: JetBrains Mono (IDs, case numbers)

### Visual Elements
- **Glassmorphism** — Blur (20px) + semi-transparent backgrounds
- **Soft Glow** — box-shadow: `0 0 30px rgba(255,182,193,0.2)`
- **Smooth Transitions** — cubic-bezier(0.4, 0, 0.2, 1) at 200–300ms
- **Gradient Mesh** — Animated blurred blobs in background

## 🔧 Tech Stack

| Purpose | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS variables |
| Animation | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js + Discord OAuth |
| Deployment | Vercel |

## 🔐 Authentication

The dashboard uses Discord OAuth2 for authentication:

1. User clicks "Login with Discord"
2. Redirected to Discord OAuth consent screen
3. Returns with authorization code
4. NextAuth exchanges code for access token
5. User data stored in session
6. Redirects to dashboard

## 📊 Key Pages

### Dashboard Home (`/dashboard`)
- Server stats (members, active users, warnings, commands)
- Recent mod actions table
- Bot health widget (uptime, latency, memory)
- API latency chart
- XP leaderboard preview

### Moderation (`/dashboard/moderation`)
- **Actions**: View/filter mod actions
- **Cases**: Case history with detail drawer
- **Warnings**: Per-user warnings with thresholds
- **AutoMod**: Configure word filters and automod settings

### Leveling (`/dashboard/leveling`)
- **XP Settings**: Global XP rate, cooldown, message settings
- **Leaderboard**: Top 10 members with filters
- **Role Rewards**: Level → Role assignments
- **Rank Card**: Live editor for rank card design

### Roles (`/dashboard/roles`)
- **Reaction Roles**: Drag-and-drop emoji pairing
- **Button Roles**: Create button-based role menus
- **Auto Roles**: Assign roles on member join

### Configuration (`/dashboard/config`)
- **General**: Bot nickname, prefix, ignored channels
- **Channels & Roles**: Mod roles, admin roles, mute role, log channels
- **Integrations**: Connected services and APIs

## 🎨 Component Library (To Be Created)

Planned reusable components:
- `<GlassCard>` — Glassmorphism surface
- `<StatCard>` — Icon + number + trend
- `<Badge>` — Color-coded pills (BAN, KICK, MUTE, etc.)
- `<UserChip>` — Avatar + username
- `<ToggleSwitch>` — On/off with animation
- `<RangeSlider>` — Pink-themed slider
- `<TagInput>` — Removable tag pills
- `<EmbedPreview>` — Discord embed replica
- `<Drawer>` — Right-side slide-in panel
- `<Toast>` — Success/error notifications
- `<ConfirmModal>` — Two-step confirmation

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel
4. Deploy

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXTAUTH_SECRET
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# NextAuth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Bot API
NEXT_PUBLIC_BOT_API_URL=https://api.yourdomain.com
```

## 📝 Development Notes

- All components use `'use client'` for client-side rendering
- Animations use Framer Motion for smooth transitions
- Forms use React Hook Form for validation
- Charts use Recharts with custom styling
- Zustand for global state (server config, user preferences)

## 🎀 UX Moments

- ✨ Cards fade in with staggered upward drift on page load
- 💾 Save button pulses pink while saving, turns mint checkmark on success
- 🗑️ Destructive actions trigger red border flash + confirmation input
- 😴 Empty states show cute sleeping Looki mascot + "nothing here yet bestie 🌸"
- ❌ Gentle error messages: "hmm something went wrong :( try again?"
- 📱 Mobile sidebar swipes in from left with spring physics

## 📚 Documentation

See [DASHBOARD_SPEC.md](./DASHBOARD_SPEC.md) for detailed feature specifications and design requirements.

---

**Made with ♡ • Keep it cute & safe 🌸**