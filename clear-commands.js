require('dotenv').config();

const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID || process.env.BOT_ID || process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function getGuildIds() {
  const guildIds = [];
  let after;

  while (true) {
    const query = new URLSearchParams({ limit: '200' });
    if (after) query.set('after', after);

    const guilds = await rest.get(Routes.userGuilds(), { query });
    guildIds.push(...guilds.map((guild) => guild.id));

    if (guilds.length < 200) break;
    after = guilds[guilds.length - 1].id;
  }

  return guildIds;
}

async function clearCommands() {
  const guildIds = await getGuildIds();

  await rest.put(Routes.applicationCommands(clientId), { body: [] });

  for (const guildId of guildIds) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
  }

  console.log(`Cleared global commands and commands in ${guildIds.length} guild(s).`);
}

clearCommands().catch((error) => {
  console.error('Failed to clear commands:', error);
  process.exitCode = 1;
});
