require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const axios = require('axios');

// 🌸 Environment Debugging ───────────
console.log('🌸 [System] Initializing Looki with Shoukaku Lavalink support...');

const { Shoukaku, Connectors } = require('shoukaku');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { initializeTables } = require('./utils/supabase');

// 🌸 Lavalink Configuration (Public Nodes) ───────────
const Nodes = [
  { name: 'Jirayu', url: 'lavalink.jirayu.net:13592', auth: 'youshallnotpass', secure: false },
  { name: 'Serenetia', url: 'lavalinkv4.serenetia.com:80', auth: 'https://dsc.gg/ajidevserver', secure: false },
  { name: 'SerenetiaSSL', url: 'lavalinkv4.serenetia.com:443', auth: 'https://dsc.gg/ajidevserver', secure: true }
];

// ── Heartbeat Server (Prevents Koyeb from sleeping) ───────────
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Looki Bot is awake and flourishing 🌸\n');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌸 Heartbeat server listening on port ${PORT}`);
});

// Self-ping to keep service active (optional but recommended for free tiers)
if (process.env.SELF_URL) {
  setInterval(async () => {
    try {
      await axios.get(process.env.SELF_URL);
      console.log('💓 Self-ping successful: Staying awake!');
    } catch (err) {
      console.error('💓 Self-ping failed:', err.message);
    }
  }, 900000); // Ping every 15 minutes
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 🌸 Shoukaku Initialization — MUST happen after Client
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes, {
    moveOnDisconnect: false,
    resumable: false,
    resumableTimeout: 30,
    reconnectTries: 3,
    restTimeout: 10000,
});
shoukaku.on('ready', (name) => console.log(`🌸 [Lavalink] Node ${name} is ready!`));
shoukaku.on('error', (name, error) => console.error(`❌ [Lavalink] Node ${name} error:`, error));
client.shoukaku = shoukaku;

// Initialize command collection
client.commands = new Collection();
client.prefixCommands = new Collection();

// Connect to Supabase
async function connectDatabase() {
  try {
    await initializeTables();
    console.log('🌸 Supabase connected successfully');
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    process.exit(1);
  }
}

// Load commands
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
        if (command.data || command.name) {
          client.commands.set(command.data?.name || command.name, command);
          client.prefixCommands.set(command.name, command);
        }
      } catch (error) {
        console.error(`Error loading command ${file}:`, error);
      }
    });
  });

  console.log(`✦ Loaded ${client.commands.size} commands`);
}

// Load events
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

  console.log('✦ Event handlers loaded');
}

// Initialize bot
async function start() {
  try {
    const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('❌ DISCORD_TOKEN / DISCORD_BOT_TOKEN is not set in environment variables');
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