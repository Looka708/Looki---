require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const axios = require('axios');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const ffmpeg = require('ffmpeg-static');
const { initializeTables } = require('./utils/supabase');
const { handleDistubeEvents } = require('./utils/audioPlayer');
const { parseCookies, getCookiePath } = require('./utils/youtube');

// ── Global Error Handling to Prevent Crashes ───────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('🥺 [Anti-Crash] Unhandled Rejection:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🥺 [Anti-Crash] Uncaught Exception:', err);
});

// ── Heartbeat Server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Looki Bot is awake and flourishing 🌸\n');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌸 Heartbeat server listening on port ${PORT}`);
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

// 🌸 YouTube Cookie Loading
const cookiePath = getCookiePath();
let youtubeCookies = [];
if (cookiePath) {
  youtubeCookies = parseCookies(cookiePath);
  console.log(`🌸 [System] Loaded ${youtubeCookies.length} YouTube cookies from ${path.basename(cookiePath)}`);
} else {
  console.log('🥺 [System] No YouTube cookies found. Using default session (risk of bot detection).');
}

// 🌸 DisTube Initialization
client.distube = new DisTube(client, {
    ffmpeg: {
        path: ffmpeg
    },
    emitNewSongOnly: true,
    nsfw: true,
    plugins: [
        new YouTubePlugin({
            cookies: youtubeCookies.length > 0 ? youtubeCookies : undefined,
            ytdlOptions: {
                highWaterMark: 1 << 25,
                filter: 'audioonly',
                quality: 'highestaudio',
                dlChunkSize: 0
            }
        }),
        new YtDlpPlugin({
            update: true,
            cookies: cookiePath || undefined
        }),
        new SpotifyPlugin(),
        new SoundCloudPlugin()
    ]
});

// Initialize DisTube Events
handleDistubeEvents(client);

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

// Load commands, events, etc.
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