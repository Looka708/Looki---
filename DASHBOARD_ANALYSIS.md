# 🌸 Looki Discord Bot Dashboard - Comprehensive Analysis

**Last Updated:** April 3, 2026
**Status:** Early Development - Core Structure Established

---

## 📋 Executive Summary

The Looki Dashboard is a sophisticated Next.js 14-based web interface for managing Discord servers. It features a hyper-aesthetic violet/pink glassmorphic design system built with Tailwind CSS and React. The dashboard integrates Discord OAuth authentication via NextAuth.js and connects to Supabase for data persistence.

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS 3.3
- **State Management:** Zustand, React hooks, Context API
- **UI Framework:** Framer Motion, Recharts
- **Authentication:** NextAuth.js 4.24 with Discord OAuth
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS with custom design tokens

---

## 🎨 1. STYLING & DESIGN SYSTEM

### Color Palette

**Background Colors:**
```css
--bg-void: #08070B        /* Darkest background */
--bg-base: #0D0C11        /* Primary surface */
--bg-surface: #13111A     /* Secondary surface */
--bg-elevated: #1A1823    /* Elevated elements */
--bg-overlay: #211F2C     /* Overlay background */
--bg-input: #161420       /* Form inputs */
```

**Primary Accents:**
```css
--pink: #FFB6C1           /* Main accent */
--pink-dim: #E89FA9       /* Dimmed pink */
```

**Secondary Accents (Semantic Colors):**
```css
--lavender: #C8A2C8       /* Secondary accent */
--peach: #FFCBA4          /* Tertiary accent */
--mint: #B5EAD7           /* Success color */
--rose: #FF9EAE           /* Danger color */
--sky: #AEC6CF            /* Info color */
--lemon: #FFDAC1          /* Warning color */
```

**Text Colors:**
```css
--text-primary: #F5F0FF   /* Main text */
--text-secondary: #9B8FAE /* Secondary text */
--text-tertiary: #6B6080  /* Tertiary text */
```

**Semantic Colors:**
- `--success: #B5EAD7` (Mint)
- `--warning: #FFDAC1` (Lemon)
- `--danger: #FF9EAE` (Rose)
- `--info: #AEC6CF` (Sky)

### Typography System

**Font Families:**
- **Display:** Playfair Display (serif) - Headlines, branding
- **Body:** DM Sans (sans-serif) - Main content
- **Mono:** JetBrains Mono (monospace) - Code, IDs
- **Script:** Dancing Script (cursive) - Accents

**Font Sizes (Custom Tailwind Scale):**
```
xs: 11px  | sm: 13px  | base: 14px | md: 15px | lg: 17px
xl: 20px  | 2xl: 24px | 3xl: 30px  | 4xl: 38px
```

**Letter Spacing:**
- Tight: -0.02em
- Normal: 0em
- Wide: 0.04em
- Wider: 0.08em
- Widest: 0.15em

### Glass Morphism & Effects

**Glass Card Style:**
```css
.glass-card {
  background: rgba(19, 17, 26, 0.7);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 182, 193, 0.14);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 182, 193, 0.08);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(255, 182, 193, 0.25);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 182, 193, 0.18);
}
```

**Glow Effects:**
- `shadow-glow`: Pink glow with 40px + 80px blur
- `shadow-glow-sm`: 20px pink glow
- `shadow-glow-pink`: 40px pink glow
- `shadow-glow-rose`: 20px rose glow
- `shadow-glow-mint`: 20px mint glow
- `shadow-glow-peach`: 20px peach glow

**Border Colors:**
- Glass subtle: `rgba(255, 182, 193, 0.08)`
- Glass default: `rgba(255, 182, 193, 0.14)`
- Glass strong: `rgba(255, 182, 193, 0.25)`
- Glass focus: `rgba(255, 182, 193, 0.5)`

### Animations

**Keyframe Animations:**
- `fade-in`: 0.3s ease-out opacity transition
- `slide-in-down`: 0.3s ease-out top slide
- `slide-in-up`: 0.3s ease-out bottom slide
- `slide-in-right`: 0.35s cubic-bezier shine effect
- `scale-in`: 0.2s ease-out scale transition
- `pulse-glow`: 2s infinite pink glow pulse

**Transition Timing:**
- Standard: `200ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🏗️ 2. CURRENT PAGE STRUCTURE & ROUTES

### Root-Level Pages

| Route | Status | Purpose |
|-------|--------|---------|
| `/` | ⚠️ Not shown | Landing page |
| `/auth/login` | ✅ Implemented | Discord OAuth login |
| `/servers` | ✅ Implemented | Guild selection hub |

### Dashboard Structure

All dashboard routes follow: `/dashboard/[guildId]/[section]`

#### Main Dashboard Pages

| Route | Status | Component | Features |
|-------|--------|-----------|----------|
| `/dashboard/[guildId]` | ✅ Implemented | `page.tsx` | **Overview/Hub** - Hero section, stats grid, quick actions, recent mod actions, bot health |

### Dashboard Subsections

#### **📊 Overview**
- **Route:** `/dashboard/[guildId]`
- **Page:** `app/dashboard/page.tsx`
- **Features:**
  - Hero welcome section with emoji
  - 4-stat grid: Members, Active Today, Warnings, Commands Run
  - Quick action buttons: Create Giveaway, Purge Channel, Lock Server
  - Recent Mod Actions table with time tracking
  - Bot Health section with uptime/latency bars

#### **🛡️ Moderation** 
- **Route:** `/dashboard/[guildId]/moderation`
- **Status:** ⚠️ Skeleton only (1 line)
- **Submenu:**
  - Actions
  - Warnings
  - AutoMod

#### **📈 Leveling**
- **Route:** `/dashboard/[guildId]/leveling`
- **Status:** ⚠️ Skeleton only
- **Submenu:**
  - Settings
  - Leaderboard
  - Rank Card

#### **🎭 Roles**
- **Route:** `/dashboard/[guildId]/roles`
- **Status:** ⚠️ Skeleton only
- **Submenu:**
  - Reaction Roles
  - Button Roles
  - Auto Roles

#### **👋 Welcome (Planned)**
- Submenu:
  - Join messages
  - Leave messages

#### **🎵 Music (Planned)**
- Single page for music controls

#### **🎉 Giveaways (Planned)**
- **Submenu:**
  - Active giveaways
  - Create new

#### **🎮 Fun (Planned)**
- General fun commands interface

#### **📊 Analytics (Planned)**
- **Submenu:**
  - Overview
  - Commands
  - Members

#### **⚙️ Settings (Planned)**
- **Submenu:**
  - General config
  - Moderation logs
  - Permissions
  - Danger Zone (reset/delete)

---

## 🎛️ 3. UI COMPONENTS & CAPABILITIES

### Component Library Structure

**Location:** `dashboard/components/ui/` and `dashboard/components/layout/`

#### Layout Components

**`Sidebar.tsx`**
- Collapsible navigation sidebar
- Variable width: 240px (expanded) / 64px (collapsed)
- Active state highlighting
- Submenu expansion/collapse
- Online status indicator with mint pulse
- Smooth transitions
- Props: `guildId`, `navItems`

**`Topnav.tsx`**
- Fixed top navigation bar (60px height)
- Logo with animated icon
- Server/guild switcher dropdown
- User menu with avatar
- Guild list with bot presence indicators
- Dynamic path handling for sub-pages
- Glass effect with blur
- Props: `guildName`, `guildIcon`, `guildId`

#### UI Components

**`Button.tsx`**
- **Variants:** primary (gradient pink), ghost (transparent), danger (rose)
- **Sizes:** sm (px-3 py-2), md (px-5 py-2), lg (px-6 py-3)
- **Features:**
  - Loading state with spinner
  - Disabled state styling
  - TypeScript support
  - Tailwind + CSS class integration
  - Smooth hover/active states

**`Card.tsx`** (GlassCard Components)
- `GlassCard`: Base glass container
- `CardHeader`: Title + subtitle + action slot
- `CardBody`: Spaced content container
- `CardFooter`: Action buttons area with border
- Hoverable option with shadow transitions

**`Modal.tsx`**
- `Modal`: Reusable modal dialog
- `ConfirmDialog`: Destructive action confirmation
- `Drawer`: Slide-out panel (exported but implementation unclear)
- **Features:**
  - Backdrop blur and click-to-close
  - Customizable size (sm/md/lg)
  - Animated scale-in
  - Header, body, footer sections
  - Destructive variant for dangerous actions
  - CloseOnBackdrop option

**`FormElements.tsx`**
- `Input`: Glass-styled text input with label, error, helperText, icon support
- `Textarea`: Multi-line glass input
- `Select`: Dropdown selector
- `Toggle`: Switch component
- All with error states and helper text

**`Badge.tsx`**
- **Variants:** ban, kick, mute, warn, note, tempban, success, danger, warning, info
- **Styling:** Color-coded backgrounds + borders + text
- `StatCard`: Stat display with icon, label, value, trend %, variant
- Icon support (emoji or React component)
- Trend indicator with percentage

**`Toast.tsx`**
- Toast notification system
- Types: success, error, info, warning
- Context-based API: `useToast()`
- Auto-dismiss (default 4000ms)
- `ToastProvider` wrapper required
- Fixed bottom-right positioning
- Stacked with max-width constraint

**`Navbar.tsx`**
- Top navigation for landing pages
- Animated logo with hover rotation
- Responsive links to Servers
- User session display with avatar
- Login/Logout buttons
- Smooth animations with Framer Motion

### Component Index Files

**`ui/index.ts`** - Central exports:
```typescript
export { Button }
export { GlassCard, CardHeader, CardBody, CardFooter }
export { Badge, StatCard }
export { Input, Textarea, Select, Toggle }
export { ToastProvider, useToast }
export { Modal, ConfirmDialog, Drawer }
export { Navbar }
```

**`layout/index.ts`** - Layout exports:
```typescript
export { Sidebar }
export { Topnav, Breadcrumb }
```

### Additional Components

**`UIComponents.tsx`** (Legacy/Exported Components)
- `GlassCard`, `StatCard`, `Badge`, `UserChip`, `ToggleSwitch`
- Variants and styling wrapper functions
- Some duplication with ui/ folder

**`ProtectedRoute.tsx`**
- Authentication wrapper (location: `app/components/`)

**`UserMenu.tsx`**
- User dropdown menu (location: `app/components/`)

---

## 🔐 4. AUTHENTICATION & DATA PATTERNS

### Authentication Flow

**Provider:** NextAuth.js 4.24 with Discord OAuth

**Auth Route Structure:**
```
/api/auth/[...nextauth]
  ├── Handlers: GET, POST
  └── Config: @/lib/auth.ts
```

**Auth Configuration (`lib/auth.ts`):**

```typescript
// Discord OAuth Provider
DiscordProvider({
  clientId: process.env.DISCORD_CLIENT_ID
  clientSecret: process.env.DISCORD_CLIENT_SECRET
  scope: 'identify email guilds'
})

// Session Strategy
session: {
  strategy: 'jwt'
  maxAge: 30 * 24 * 60 * 60  // 30 days
}

// Callbacks
- jwt(): Attach accessToken, provider, user.id
- session(): Add accessToken + user.id to session
- redirect(): Handle post-login routing
```

**Session Type Extensions:**
```typescript
interface Session {
  user: { id, name?, email?, image? }
  accessToken?: string
}

interface JWT {
  accessToken?: string
  sub?: string
}
```

### Login Page (`app/auth/login/page.tsx`)

- Decorative gradient mesh + noise texture backgrounds
- Floating glass card with animation
- Logo + branding section
- Discord OAuth button with loading state
- Shine effect animation (slide-in-right 2s)
- Redirect logic: authenticated → `/servers`
- Error handling with console logging

### Guild/Server Fetching

**Route:** `/api/guilds` (GET)

**Features:**
- Requires NextAuth session + accessToken
- Fetches from Discord API: `GET /users/@me/guilds`
- Filters to manageable guilds (owner OR manage permissions)
- Checks bot presence in each guild via `GET /guilds/{id}/members/{botId}`
- Returns: `{ id, name, icon, owner, permissions, looki: boolean }`
- Sorts alphabetically by name

**Bot Presence Check:**
- Uses `DISCORD_BOT_TOKEN` environment variable
- Returns `looki: true/false` indicator
- Gracefully falls back if token not configured

### API Route Patterns

**Supabase Data Fetching (`lib/supabase-client.ts`):**

```typescript
// Functions Available:
- getModActions(guildId, limit?)    // Get warnings/mod actions
- getXPSettings(guildId)             // Fetch leveling config
- updateXPSettings(guildId, settings) // Update leveling config
- getLeaderboard(guildId, limit?)   // Get XP rankings
```

**Leveling API (`api/leveling/route.ts`):**

```typescript
GET /api/leveling?guildId=...&type=[settings|leaderboard|user]
  - type=settings: XP configuration
  - type=leaderboard: Guild leaderboard
  - type=user: Individual user XP with userId param

PUT /api/leveling?guildId=...
  - Body: Settings to update
  - Returns: Updated config with success message
```

### Data Fetching Patterns

**Client-Side (React Hooks):**
```typescript
useEffect(() => {
  fetchGuilds()
}}

const fetchGuilds = async () => {
  const res = await fetch('/api/guilds')
  const data = await res.json()
  setGuilds(data.guilds)
}
```

**Server-Side (API Routes):**
```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return 401
  
  // Fetch + transform
  return NextResponse.json({ data })
}
```

---

## 📦 5. SERVER MANAGEMENT FEATURES - CURRENT STATUS

### ✅ Implemented Features

#### Overview/Dashboard Hub
- **Stats Display:**
  - Member count
  - Active users today
  - Warning count
  - Commands run (total)
- **Quick Actions:**
  - Create Giveaway button
  - Purge Channel button
  - Lock Server button
- **Recent Moderation:**
  - Action type badge (BAN/WARN/MUTE)
  - User + reason
  - Timestamp
  - Color-coded by action type
- **Bot Health:**
  - Uptime percentage bar
  - Latency display (ms)
  - Visual health indicator

#### Server Selection
- Guild list with icons
- Owner badge
- Permissions display
- Bot presence indicator (checkmark if installed)
- Smooth navigation between servers

#### Authentication
- Discord OAuth login
- Session persistence (30 days)
- Profile display with avatar
- Quick logout

---

### ⚠️ Partially Implemented

**Planned Navigation Items** (in sidebar navItems):
- Moderation → Actions, Warnings, AutoMod
- Leveling → Settings, Leaderboard, Rank Card
- Roles → Reaction Roles, Button Roles, Auto Roles
- Welcome → Join, Leave messages
- Music
- Giveaways → Active, Create
- Fun
- Analytics → Overview, Commands, Members
- Settings → General, Logs, Permissions, Danger Zone

**Status:** Navigation structure defined but page components are skeleton files (1 line)

---

### ❌ Not Implemented / Missing

**Server Management Areas:**

1. **Moderation Management**
   - No warning history interface
   - No mod action execution (ban/kick/mute UI)
   - No AutoMod configuration panel
   - No moderation logging channel setup

2. **Leveling System**
   - No XP settings configuration page
   - No interactive leaderboard display
   - No rank card builder/preview
   - No level-up message customization

3. **Roles Management**
   - No reaction role message builder
   - No button role configuration
   - No auto-role assignment setup
   - No role hierarchy management

4. **Welcome Messages**
   - No join message editor
   - No leave message editor
   - No embed customization
   - No variable/placeholder system

5. **Music System**
   - No music player interface
   - No queue management
   - No playlist support
   - No equalizer/volume controls

6. **Giveaway Management**
   - No giveaway creation form
   - No active giveaway display
   - No winner management
   - No prize configuration

7. **Analytics**
   - No command usage statistics
   - No member activity tracking
   - No charts/graphs
   - No export functionality

8. **Server Settings**
   - No general configuration form
   - No log channel selection
   - No permission role setup
   - No dangerous actions (reset/delete)

---

## 🔌 6. DATABASE & BACKEND INTEGRATION

### Supabase Schema (Referenced in Codebase)

**Tables Used:**
- `warnings` - Moderation warnings/actions
  - Fields: id, guild_id, user_id, reason, type, created_at, updated_at
  - Queried by: guild_id (order by created_at DESC)

- `server_config` - Guild settings
  - Fields: guild_id, xp_enabled, xp_multiplier, level_up_message, etc.
  - Upsert pattern (create or update)

- `xp` - User leveling data
  - Fields: id, guild_id, user_id, total_xp, level, created_at, updated_at
  - Queried by: guild_id + user_id

**Supabase Client:**
- Singleton pattern in `lib/supabase-client.ts`
- Lazy initialization
- Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS (Row Level Security) can be configured

---

## 📱 7. LAYOUT & RESPONSIVE DESIGN

### Layout Structure

```
┌─────────────────────────────────┐ 60px (topnav-height)
│          TOPNAV                 │
├────────────┬────────────────────┤
│            │                    │
│  SIDEBAR   │   MAIN CONTENT     │
│ 240px      │   Flexible         │
│ (or 64px)  │                    │
│            │                    │
└────────────┴────────────────────┘
```

**Fixed Elements:**
- Topnav: Fixed top, 60px height, z-40
- Sidebar: Fixed left, full viewport height minus topnav, z-30

**Content Area:**
- Left margin: 240px (or 64px if sidebar collapsed)
- Top margin: 60px
- Responsive breakpoints: md (768px), lg (1024px)

**Spacing:**
- Card gap: 20px
- Content padding: 32px
- Sidebar width: 240px
- Max content width: 1320px

### Responsive Breakpoints

**Tailwind Defaults + Custom:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Grid Systems:**
- Dashboard stats: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Content areas: `grid-cols-1 lg:grid-cols-3`

---

## 🔄  8. STATE MANAGEMENT & HOOKS

### State Management Tools

**Available in package.json:**
- **Zustand** - Global state (not actively used in current code)
- **React Context** - Toast notifications, Providers
- **React Hooks** - useState, useEffect, useCallback

### Custom Hooks

**Toast System:**
```typescript
const { toasts, addToast, removeToast } = useToast()
```

**NextAuth Hooks:**
```typescript
const { data: session, status } = useSession()
const router = useRouter()
const pathname = usePathname()
```

### Context Providers

**`ToastContext`** - Global toast notifications
**`SessionProvider`** - NextAuth session management

---

## 🎯 9. DEVELOPMENT WORKFLOW & PATTERNS

### File Structure Conventions

```
app/
  ├── dashboard/
  │   ├── [guildId]/         # Guild-specific pages
  │   ├── layout.tsx         # Dashboard wrapper with auth + sidebar
  │   └── page.tsx          # Main overview page
  ├── api/                  # Backend routes
  ├── auth/login/           # Auth pages
  └── servers/              # Guild selection

components/
  ├── ui/                   # Reusable UI components
  ├── layout/               # Layout-only components
  └── [domain]/             # Feature-specific components

lib/
  ├── auth.ts              # NextAuth configuration
  ├── supabase-client.ts   # Database client + queries

public/                    # Static assets
```

### TypeScript Usage

**Strong typing throughout:**
- Interface definitions for Guild, NavItem, Session
- Component prop types (ButtonProps, ModalProps)
- API response types
- NextAuth type extensions

### Error Handling Patterns

```typescript
// API Routes
try {
  // Logic
} catch (error) {
  console.error('Error message:', error)
  return NextResponse.json({ error }, { status: 500 })
}

// React Components
try {
  const data = await fetch(...)
} catch (error) {
  console.error('Failed:', error)
  // User feedback via toast or state
}
```

### Animation Patterns

**Framer Motion:**
```typescript
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  transition={{ staggerChildren: 0.1 }}
>
```

**Framer Motion for elements:**
- Hover effects: `whileHover={{ scale: 1.05 }}`
- Tap effects: `whileTap={{ scale: 0.95 }}`
- Page transitions: Staggered children

---

## 📊 10. DEPENDENCIES & VERSIONS

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0"
}
```

### Key Libraries
```json
{
  "@supabase/supabase-js": "^2.38.4",        // Database
  "next-auth": "^4.24.0",                    // Auth
  "framer-motion": "^10.16.0",               // Animations
  "recharts": "^2.10.0",                     // Charts
  "react-hook-form": "^7.48.0",              // Forms
  "zod": "^3.22.0",                          // Validation
  "@hookform/resolvers": "^3.3.0",           // Form validation
  "zustand": "^4.4.0",                       // State
  "axios": "^1.6.0",                         // HTTP client
  "clsx": "^2.0.0"                           // Class utilities
}
```

---

## 🚀 11. WHAT NEEDS TO BE IMPLEMENTED

### High Priority - Core Features

1. **Moderation Management Dashboard**
   - Warning log viewer with filters
   - Recent/current mod actions display
   - User mod history
   - Quick action buttons (warn/kick/ban from UI)

2. **Leveling Configuration Page**
   - Toggle XP system on/off
   - Set XP multiplier
   - Configure level-up messages
   - Leaderboard display with pagination

3. **Settings & Configuration Hub**
   - General server settings
   - Moderation log channel selector
   - Prefix configuration
   - Permission role assignment

### Medium Priority - Enhanced Features

4. **Role Management**
   - Reaction/button role builder
   - Role assignment automation
   - Role hierarchy visualization

5. **Welcome Messages**
   - Message editor (text + embeds)
   - Preview system
   - Variable placeholders

6. **Giveaway System**
   - Creation form with prize setup
   - Active/ended display
   - Winner management

### Lower Priority - Advanced Features

7. **Music Player Interface** (if music feature is active)
8. **Analytics Dashboard** (charts, stats, trends)
9. **AutoMod Configuration** (word filters, spam protection)
10. **API Management & Webhooks**

---

## 🎨 12. DESIGN PATTERNS & AESTHETICS

### Visual Language

**Aesthetic:** Soft, hyper-aesthetic, "pookie-coded" design

**Key Visual Elements:**
- Glassmorphic cards with backdrop blur
- Soft rounded corners (16-20px)
- Gradient accents (pink → lavender)
- Glowing shadows for emphasis
- Emoji use throughout (🌸, 🎀, ✦, etc.)
- Smooth, playful animations

**Color Strategy:**
- Dark void backgrounds for accessibility
- Bright pink/lavender for call-to-action
- Soft secondary colors for categorization
- Consistent semantic coloring (red=danger, green=success)

**Typography:**
- Elegant serif (Playfair) for headings
- Clean sans-serif (DM Sans) for body
- Monospace for technical data

---

## 📝 13. ENVIRONMENT VARIABLES NEEDED

```env
# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
BOT_ID=
GUILD_ID= (optional, for testing)

# NextAuth
NEXTAUTH_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEXT_PUBLIC_BOT_ID=
```

---

## 🏆 RECOMMENDATION SUMMARY

### Immediate Next Steps

1. **Complete Moderation Dashboard** - Users need to see/manage mod actions
2. **Implement Settings Hub** - Core configuration interface
3. **Add Leveling Management** - XP system configuration & leaderboard
4. **Create Roles Management** - Role assignment automation

### Architecture Strengths
✅ Solid authentication flow
✅ Well-organized component library
✅ Consistent design system
✅ TypeScript throughout
✅ Proper API route structure

### Areas for Improvement
⚠️ Most dashboard pages are skeleton files
⚠️ Limited data visualization (only stats overview)
⚠️ No form validation libraries integrated
⚠️ Error handling could be more robust
⚠️ Loading states incomplete

