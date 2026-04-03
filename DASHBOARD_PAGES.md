# Dashboard Pages Documentation

This document outlines all the dashboard pages created for the Looki Discord Bot web dashboard.

## Page Structure

```
app/dashboard/
├── page.tsx                    # Home/Overview page
├── moderation/
│   └── page.tsx               # Moderation actions tracker
├── leveling/
│   └── page.tsx               # XP settings & configuration
├── ranks/
│   └── page.tsx               # Leaderboard & rankings view
├── roles/
│   └── page.tsx               # Role management (reaction, button, auto-roles)
├── config/
│   └── page.tsx               # Server configuration
└── analytics/
    └── page.tsx               # Analytics & metrics
```

## Pages Overview

### 1. **Home Page** (`/dashboard`)
- **Purpose**: Server overview and quick stats
- **Features**:
  - 4 quick stat cards (members, XP given, bans, active mutes)
  - Recent moderation actions list
  - Bot health status widget
  - API latency chart
  - XP leaderboard preview
  - Quick action buttons

### 2. **Moderation Page** (`/dashboard/moderation`)
- **Purpose**: View and manage moderation actions
- **Features**:
  - Filter by action type (all, bans, kicks, mutes, warns)
  - Recent actions in card layout
  - User information with Discord avatars
  - Reason for each action
  - Detail side panel (drawer) for full case info
  - Edit & delete case options
  - Stats: bans/kicks/warnings/mutes this week

### 3. **Leveling Page** (`/dashboard/leveling`)
- **Purpose**: Configure XP and leveling system
- **Features**:
  - Enable/disable leveling system
  - XP per message slider (1-100)
  - XP cooldown configuration (5-300 seconds)
  - Level up notifications toggle
  - Notification channel selector
  - Ignore channel management
  - Allowed role configuration
  - Save/reset buttons with feedback

### 4. **Leaderboard Page** (`/dashboard/ranks`)
- **Purpose**: View member rankings and progression
- **Features**:
  - Top 3 showcase with medal emojis (🥇🥈🥉)
  - Top 3 progress bars to next level
  - Extended ranking list (expandable)
  - Search/filter by player
  - Your rank card with personal stats
  - XP progress bar to next level
  - Timeframe filter (this week, this month, all-time)

### 5. **Roles Page** (`/dashboard/roles`)
- **Purpose**: Manage role assignment systems
- **Features**:
  - 3 tabs: Reaction Roles, Button Roles, Auto-Assign Roles
  - **Reaction Roles**:
    - Create new role groups
    - Assign emoji → role mappings
    - Per-channel configuration
    - Edit/delete role groups
  - **Button Roles**:
    - Create button messages
    - Title & description
    - Color picker for buttons
    - Channel selector
  - **Auto-Assign**:
    - Auto-assign roles on join
    - Add/remove roles from list

### 6. **Configuration Page** (`/dashboard/config`)
- **Purpose**: Server-wide bot settings
- **Features**:
  - **Basic Settings**:
    - Command prefix (1-3 chars)
    - Default log level (debug/info/warn/error)
  - **Moderation**:
    - Modlog channel selector
    - AutoMod enable/disable
    - Spam threshold configuration
  - **Welcome**:
    - Welcome messages toggle
    - Channel selector
    - Custom message template with variables
  - **Dangerous Actions**:
    - Reset all settings
    - Clear server data
  - Save/discard changes with feedback

### 7. **Analytics Page** (`/dashboard/analytics`)
- **Purpose**: Server activity and performance metrics
- **Features**:
  - **Key Metrics** (4 stat cards):
    - Total members with growth
    - Messages sent today
    - Total XP given this week
    - Moderation actions this month
  - **Member Growth Chart**: Line chart (7 days)
  - **Top Commands**: Horizontal bar chart
  - **Message Distribution**: Pie chart by channel
  - **Daily Activity**: Bar chart (7 days)
  - **Summary Stats**: Average activity, most active day, total commands

## Component Reuse

All pages leverage the shared component library in `dashboard/components/UIComponents.tsx`:

| Component | Used In | Purpose |
|-----------|---------|---------|
| `GlassCard` | All pages | Glassmorphism container |
| `StatCard` | Home, Analytics | Metric display |
| `Badge` | Moderation, Roles, Ranks | Colored labels |
| `UserChip` | Moderation, Ranks | User display |
| `ToggleSwitch` | Leveling, Config | Toggle controls |
| `LoadingSpinner` | Various | Loading states |

## Design System

All pages follow the Looki design system:

- **Colors**: 9 CSS variables (pink, lavender, peach, cyan, green, danger, warning, etc.)
- **Styling**: Tailwind CSS + custom glass-card class
- **Animations**: Framer Motion for entrance/hover effects
- **Fonts**: Display font for headers, inter for body
- **Spacing**: Consistent grid/gap utilities

## Mock Data

All pages use mock data for demonstration:
- Moderation actions (4 examples with types)
- Leaderboard (8 users)
- Reaction role groups (2 groups)
- Analytics charts (7-day data)

## Next Steps

To fully integrate these pages:

1. **Connect to backend API**:
   - Replace mock data with API calls
   - Add loading states and error handling
   - Implement real-time updates

2. **Add CRUD operations**:
   - API endpoints for settings changes
   - Form validation and error messages
   - Confirmation dialogs for destructive actions

3. **Database integration**:
   - Fetch data from Supabase
   - Update via API route handlers
   - Implement optimistic updates

4. **Authentication**:
   - Verify user is server owner/admin
   - Role-based access control
   - Session management

5. **Performance**:
   - Add pagination for large lists
   - Implement infinite scroll
   - Cache frequently accessed data

## File Sizes

- Moderation page: ~6.2 KB
- Leveling page: ~4.8 KB
- Leaderboard page: ~5.9 KB
- Roles page: ~8.1 KB
- Config page: ~6.4 KB
- Analytics page: ~7.2 KB

**Total**: ~38.6 KB across all new pages
