require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const axios = require('axios');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { initializeTables } = require('./utils/supabase');
const { Kazagumo, Plugins } = require('kazagumo');
const Spotify = require('kazagumo-spotify');
const { Connectors } = require('shoukaku');
const { handleKazagumoEvents } = require('./utils/audioPlayer');

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Anti-Crash] Unhandled Rejection:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Anti-Crash] Uncaught Exception:', error);
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Looki Bot is awake and running\n');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Heartbeat server listening on port ${PORT}`);

  const selfUrl = process.env.SELF_URL;
  if (!selfUrl) return;

  axios.get(selfUrl)
    .then(() => console.log(`[Keep-Alive] Initial ping successful: ${selfUrl}`))
    .catch(error => console.error(`[Keep-Alive] Initial ping failed: ${error.message}`));

  setInterval(async () => {
    try {
      await axios.get(selfUrl);
      console.log(`[Keep-Alive] Periodic ping successful: ${selfUrl}`);
    } catch (error) {
      console.error(`[Keep-Alive] Periodic ping failed: ${error.message}`);
    }
  }, 5 * 60 * 1000);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

function envBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
}

function lavalinkNodeFromEnv(label, prefix) {
  const url = process.env[`${prefix}_URL`];
  const auth = process.env[`${prefix}_PWD`] || process.env[`${prefix}_PASSWORD`];
  if (!url || !auth) return null;

  return {
    name: label,
    url,
    auth,
    secure: envBool(process.env[`${prefix}_SECURE`], url.includes(':443')),
  };
}

const availableEnvNodes = [
  lavalinkNodeFromEnv('Primary', 'LAVALINK'),
  lavalinkNodeFromEnv('Lexis', 'LAVALINK_LEXIS'),
  lavalinkNodeFromEnv('Jirayu', 'LAVALINK_JIRAYU'),
  lavalinkNodeFromEnv('Serenetia', 'LAVALINK_SERENETIA'),
  lavalinkNodeFromEnv('G3V', 'LAVALINK_G3V'),
].filter(Boolean);

const requestedNodeNames = (process.env.LAVALINK_NODE_NAMES || '')
  .split(',')
  .map(name => name.trim().toLowerCase())
  .filter(Boolean);

const envNodes = requestedNodeNames.length
  ? availableEnvNodes.filter(node => requestedNodeNames.includes(node.name.toLowerCase()))
  : availableEnvNodes;

const nodes = envNodes.length ? envNodes : [
  {
    name: 'Jirayu',
    url: 'lavalink.jirayu.net:443',
    auth: 'youshallnotpass',
    secure: true,
  },
];

console.log(`[Music] Loaded ${nodes.length} Lavalink node(s): ${nodes.map(node => node.name).join(', ')}`);

client.kazagumo = new Kazagumo({
  defaultSearchEngine: 'youtube',
  plugins: [
    new Plugins.PlayerMoved(client),
    new Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      playlistPageLimit: 1,
      albumPageLimit: 1,
      searchLimit: 10,
      searchMarket: 'US',
    }),
  ],
  send: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
}, new Connectors.DiscordJS(client), nodes, {
  moveOnDisconnect: nodes.length > 1,
  resume: true,
  reconnectTries: Number(process.env.LAVALINK_RECONNECT_TRIES || 5),
  reconnectInterval: Number(process.env.LAVALINK_RECONNECT_INTERVAL || 10000),
  restTimeout: Number(process.env.LAVALINK_REST_TIMEOUT || 15000),
});

handleKazagumoEvents(client);

client.commands = new Collection();
client.prefixCommands = new Collection();

async function connectDatabase() {
  try {
    await initializeTables();
    console.log('Supabase connected successfully');
  } catch (error) {
    console.error('Supabase connection error:', error);
    process.exit(1);
  }
}

function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const categories = fs.readdirSync(commandsPath);

  categories.forEach((category) => {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    commandFiles.forEach((file) => {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);
        const commandName = command.name || command.data?.name;
        if (!commandName) return;

        client.commands.set(commandName, command);
        client.prefixCommands.set(commandName, command);
        if (Array.isArray(command.aliases)) {
          command.aliases.forEach(alias => client.prefixCommands.set(alias, command));
        }
      } catch (error) {
        console.error(`Error loading command ${file}:`, error);
      }
    });
  });

  console.log(`Loaded ${client.commands.size} commands`);
}

function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  eventFiles.forEach((file) => {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } catch (error) {
      console.error(`Error loading event ${file}:`, error);
    }
  });

  console.log('Event handlers loaded');
}

async function start() {
  try {
    const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('DISCORD_TOKEN is not set');
      process.exit(1);
    }

    await connectDatabase();
    loadCommands();
    loadEvents();
    await client.login(token);
  } catch (error) {
    console.error('Bot startup error:', error);
    process.exit(1);
  }
}

start();
