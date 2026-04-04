require('dotenv').config();
const fs = require('fs');
const { execSync } = require('child_process');

// 🌸 Environment Debugging ───────────
process.env.FFMPEG_PATH = fs.existsSync('/tmp/ffmpeg') ? '/tmp/ffmpeg' : require('ffmpeg-static');
console.log('🌸 [System] ffmpeg Path:', process.env.FFMPEG_PATH);
console.log('🌸 [System] yt-dlp binary found:', fs.existsSync('/tmp/yt-dlp'));
try { console.log('🌸 [System] yt-dlp version:', execSync('/tmp/yt-dlp --version').toString().trim()); } 
catch(e) { console.error('⚠️ [System] yt-dlp exec failed. Will fallback to python3 if possible.'); }

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { initializeTables } = require('./utils/supabase');
const http = require('http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    // Environment Diagnostics 🌸
    const { execSync } = require('child_process');
    const ffmpegPath = require('ffmpeg-static');
    
    try {
        const ffVer = execSync(`${ffmpegPath} -version`).toString().split('\n')[0];
        console.log(`🌸 [System] ffmpeg Ready: ${ffVer}`);
    } catch(e) { console.error('❌ [System] ffmpeg-static failed check!'); }

    const localDlPath = path.join(__dirname, 'yt-dlp');
    if (fs.existsSync(localDlPath)) {
        try {
            const ytVer = execSync(`${localDlPath} --version`).toString().trim();
            console.log(`🌸 [System] Standalone yt-dlp Ready: ${ytVer}`);
        } catch(e) { 
            console.log(`⚠️  [System] Found local yt-dlp but failed to run. Check permissions.`); 
        }
    } else {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        try {
            const ytVer = execSync(`${pythonCmd} -m yt_dlp --version`).toString().trim();
            console.log(`🌸 [System] yt-dlp (Python) Ready: ${ytVer}`);
        } catch(e) { 
            console.log(`⚠️  [System] yt-dlp not found. It should download via package.json start script.`); 
        }
    }

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