require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const axios = require('axios');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { initializeTables } = require('./utils/supabase');
const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');
const { handleKazagumoEvents } = require('./utils/audioPlayer');

// ── Connectivity Test ────────────────────────────────────
const https = require('https');
https.get('https://lavalink.jirayu.net', (res) => {
  console.log('✅ [Connectivity] Jirayu reachable, status:', res.statusCode);
}).on('error', (e) => {
  console.error('❌ [Connectivity] Cannot reach Jirayu from this environment:', e.message);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🥺 [Anti-Crash] Unhandled Rejection:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🥺 [Anti-Crash] Uncaught Exception:', err);
});

// ── Heartbeat Server ────────────────────────────────────
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Looki Bot is awake and flourishing 🌸\n');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌸 Heartbeat server listening on port ${PORT}`);

  const SELF_URL = process.env.SELF_URL;
  if (SELF_URL) {
    axios.get(SELF_URL)
      .then(() => console.log(`🌸 [Keep-Alive] Initial ping successful: ${SELF_URL}`))
      .catch(err => console.error(`❌ [Keep-Alive] Initial ping failed: ${err.message}`));

    setInterval(async () => {
      try {
        await axios.get(SELF_URL);
        console.log(`🌸 [Keep-Alive] Periodic ping successful: ${SELF_URL}`);
      } catch (error) {
        console.error(`❌ [Keep-Alive] Periodic ping failed: ${error.message}`);
      }
    }, 5 * 60 * 1000);
  }
});

// ── Discord Client ──────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Lavalink Nodes ──────────────────────────────────────
const nodes = [
  {
    name: 'Jirayu',
    url: 'lavalink.jirayu.net:443',
    auth: 'youshallnotpass',
    secure: true,
  },
  {
    name: 'Serenetia',
    url: 'lavalinkv4.serenetia.com:443',
    auth: 'https://dsc.gg/ajidevserver',
    secure: true,
  },
  {
    name: 'G3V',
    url: 'lava.g3v.co.uk:9008',
    auth: 'lavalinklol',
    secure: false,
  },
];

// ── Kazagumo Init ──────────────────────────────────────────
client.kazagumo = new Kazagumo({
  defaultSearchEngine: 'youtube',
  plugins: [
    new Plugins.PlayerMoved(client),
  ],
  send: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  }
}, new Connectors.DiscordJS(client), nodes, {
  moveOnDisconnect: false,
  resumable: false,
  reconnectTries: 3,
  reconnectInterval: 5000,
  restTimeout: 10000,
});

// Initialize Kazagumo Events
handleKazagumoEvents(client);

// ── Collections ─────────────────────────────────────────
client.commands = new Collection();
client.prefixCommands = new Collection();

// ── Database ─────────────────────────────────────────────
async function connectDatabase() {
  try {
    await initializeTables();
    console.log('🌸 Supabase connected successfully');
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    process.exit(1);
  }
}

// ── Command Loader ───────────────────────────────────────
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const categories = fs.readdirSync(commandsPath);
  categories.forEach((category) => {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    commandFiles.forEach((file) => {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);
        const commandName = command.name || command.data?.name;
        if (commandName) {
          client.commands.set(commandName, command);
          client.prefixCommands.set(commandName, command);
          if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => client.prefixCommands.set(alias, command));
          }
        }
      } catch (error) {
        console.error(`Error loading command ${file}:`, error);
      }
    });
  });
  console.log(`✦ Loaded ${client.commands.size} commands`);
}

// ── Event Loader ─────────────────────────────────────────
function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
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
  console.log('✦ Event handlers loaded');
}

// ── Start ────────────────────────────────────────────────
async function start() {
  try {
    const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('❌ DISCORD_TOKEN is not set');
      process.exit(1);
    }
    await connectDatabase();
    loadCommands();
    loadEvents();
    await client.login(token);
  } catch (error) {
    console.error('❌ Bot startup error:', error);
    process.exit(1);
  }
}

start();