require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.BOT_ID || process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Optional: for guild-specific commands

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN/DISCORD_BOT_TOKEN or BOT_ID/DISCORD_CLIENT_ID in environment variables');
  process.exit(1);
}

const commands = [];

// Load all commands
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
        if (command.data) {
          commands.push(command.data.toJSON());
          console.log(`✓ Loaded: ${command.data.name}`);
        }
      } catch (error) {
        console.error(`❌ Error loading command ${file}:`, error.message);
      }
    });
  });

  return commands;
}

// Deploy commands
async function deploy() {
  console.log('🌸 Starting command deployment...\n');

  const commands_array = loadCommands();

  if (commands_array.length === 0) {
    console.error('❌ No commands found to deploy!');
    process.exit(1);
  }

  console.log(`\n📤 Deploying ${commands_array.length} commands...\n`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    let data;

    if (GUILD_ID) {
      // Deploy to specific guild (instant, for testing)
      console.log(`🎯 Deploying to guild: ${GUILD_ID}`);
      data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands_array,
      });
      console.log(`✅ Successfully deployed ${data.length} commands to guild!`);
    } else {
      // Deploy globally (takes up to 1 hour)
      console.log('🌍 Deploying globally...');
      data = await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands_array,
      });
      console.log(`✅ Successfully deployed ${data.length} commands globally!`);
      console.log('⏱️  Commands may take up to 1 hour to appear on Discord');
    }

    console.log('\n🌸 Deployment complete!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
