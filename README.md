# Looki

A soft, aesthetic Discord bot with music, moderation, leveling, giveaways, utility commands, and a Next.js dashboard.

## Bot Features

### Music
- Lavalink playback through Kazagumo and Shoukaku.
- YouTube, Spotify, and SoundCloud search support.
- Queue, skip, pause, resume, loop, seek, remove, volume, now playing, and music stats.
- User favorites and server playlists.
- 24/7 voice mode with restart restoration.

### Moderation
- Ban, temporary ban, kick, warn, timeout, clear, lock, unlock, and slowmode commands.
- Persistent warning/case storage in Supabase.
- Optional modlog channel support through server config.
- Expired temporary bans are restored automatically.

### Community
- Leveling and leaderboard commands.
- Giveaways.
- Fun reaction commands with centralized GIF handling.
- Utility commands for server, role, channel, user, avatar, bot, ping, and stats info.

## Requirements

- Node.js 20+
- Discord bot token and application ID
- Supabase project with the schema from `supabase_schema.sql`
- Lavalink node access

## Environment

Create `.env` from the example files and provide:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GUILD_ID=optional_test_guild_id
PORT=8080
```

`GUILD_ID` is optional. When present, command deployment targets that guild for faster testing.

## Commands

```bash
npm install
npm run deploy
npm start
```

Inside Discord, administrators can run `/sync` to clear old registrations and publish the current command set.

## Project Structure

```text
commands/   Discord slash commands
events/     Discord event handlers
models/     Supabase data access
utils/      Shared embed, music, moderation, and audio helpers
dashboard/  Next.js dashboard
index.js    Bot entry point
```

## Database

Run `supabase_schema.sql` in the Supabase SQL editor before starting the bot. The schema includes:

- moderation warnings and temporary bans
- server config
- XP and leveling
- giveaways
- music favorites, stats, settings, playlists, and activity logs

## Notes

- Do not commit `.env` files or bot tokens.
- Public Lavalink nodes can be unstable; production deployments should use reliable nodes.
- Dashboard development is separate from bot command development.
