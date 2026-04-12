require('dotenv').config();
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.BOT_ID || process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or BOT_ID in .env file');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function clearCommands() {
  try {
    console.log('🌸 Starting to clear commands...\n');

    // 1. Clear Global Commands
    console.log('🌍 Clearing global commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    console.log('✅ Successfully cleared global commands.');

    // 2. Clear Guild Commands if GUILD_ID is provided
    if (GUILD_ID) {
      console.log(`🎯 Clearing guild commands for: ${GUILD_ID}`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
      console.log('✅ Successfully cleared guild commands.');
    } else {
      console.log('ℹ️ No GUILD_ID found in .env, skipping guild-specific clearance.');
    }

    console.log('\n✨ All commands cleared! You can now run `npm run deploy` to re-register them correctly.');
  } catch (error) {
    console.error('❌ Error clearing commands:', error);
  }
}

clearCommands();
