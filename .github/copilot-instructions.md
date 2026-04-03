# Looki Discord Bot - Development Instructions

## Project Overview
Looki is a soft, hyper-aesthetic Discord bot built with discord.js v14, MongoDB, and Node.js 20+. The bot features moderation, leveling, music streaming, giveaways, and fun engagement commands with a pookie-coded aesthetic.

## Getting Started

1. **Install Dependencies**: Run `npm install` to set up all required packages
2. **Configure Environment**: Copy `.env.example` to `.env` and fill in:
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
   - `MONGO_URI`: MongoDB connection string
   - `BOT_ID`: Your bot's ID
   - `GUILD_ID` (optional): Testing guild ID for slash command development

3. **Start Development**:
   ```bash
   npm run dev        # With auto-reload (requires nodemon)
   npm start          # Standard start
   ```

## Project Structure

```
commands/
  ├── moderation/    # Ban, kick, mute, warn commands
  ├── leveling/      # Rank, leaderboard, XP management
  ├── music/         # Play, skip, queue, volume
  ├── utility/       # Ping, help, user/server info
  ├── fun/           # 8ball, poll, games
  └── config/        # Server settings

events/
  ├── ready.js       # Bot initialization
  ├── interactionCreate.js  # Slash command handling
  └── messageCreate.js      # Prefix command handling

models/
  ├── Warning.js     # Moderation warnings
  ├── XP.js          # User levels and XP
  ├── ServerConfig.js  # Guild settings
  └── Giveaway.js    # Giveaway data

utils/
  ├── embedBuilder.js  # Global embed styling
  └── duration.js      # Time parsing (10s, 5m, 2h, 1d)
```

## Key Features Implemented

✅ **Moderation**: Ban, kick, mute with DM notifications
✅ **Leveling**: XP tracking, rank cards, leaderboard
✅ **Utility**: Server/user info, help system
✅ **Fun**: 8-ball, polls, interactive commands
✅ **Configuration**: Database-backed server settings
✅ **Aesthetic**: Consistent embed design system

## Next Steps for Development

1. **Implement Music System**
   - Connect @discordjs/voice and play-dl
   - Add play, skip, queue, volume commands
   - Implement playlist support

2. **Complete Moderation**
   - Add modlog posting to configured channel
   - Implement tempban with cron scheduling
   - Add role-based moderation actions

3. **Enhance Leveling**
   - Add message-based XP gain with cooldowns
   - Implement level-up announcements
   - Create visual rank cards

4. **Giveaway System**
   - Implement giveaway creation and management
   - Add automatic winner selection
   - Set up expiry handling

5. **AutoMod System**
   - Implement word filtering
   - Add spam/raid protection
   - Configure mention and emoji limits

## Development Tips

- **Slash Commands**: Use `data: new SlashCommandBuilder()` for new commands
- **Embeds**: Always use `createEmbed(category, client)` from utils/embedBuilder.js
- **Database**: Models auto-create/fetch documents; always await operations
- **Error Handling**: Wrap commands in try-catch, always provide user feedback

## Testing

- Use `/help` command to view all features
- Test with `/ping` for latency checks
- Use test server for development vs production

## Deployment

1. Ensure `.env` is configured with production values
2. Run `npm start` in a process manager (PM2, systemd, etc.)
3. Set appropriate intents and permissions in Discord Developer Portal

---

**Made with ♡ by Looki Team**