const { addXP, getOrCreateXP } = require('../models/XP');
const { getOrCreateConfig } = require('../models/ServerConfig');
const { EmbedBuilder, Collection } = require('discord.js');

// Global command cooldowns
const commandCooldowns = new Collection();

const {
  hasProfanity,
  checkSpam,
  hasSuspiciousLinks,
  hasMassMentions,
  cleanupSpamTracker,
  filterProfanity,
} = require('../utils/automod');

// Cooldown tracking for XP (per user-guild)
const xpCooldowns = new Map();
const XP_COOLDOWN_MS = 60000; // 1 minute
const XP_GAIN = 10; // XP per message
const LEVEL_UP_THRESHOLD = 100; // XP for level up
module.exports = {
  name: 'messageCreate',
  execute: async (message, client) => {
    if (message.author.bot || !message.guild) return;

    // 🌸 1. Fetch Server Config (Dynamic Prefix Support) ───────────
    const config = await getOrCreateConfig(message.guildId);
    const prefix = config?.prefix || 'p!'; // Fallback to p!

    // 🌸 2. Check for Prefix or Bot Mention ───────────
    const mentionRegex = new RegExp(`^<@!?${client.user.id}> `);
    const hasMention = message.content.match(mentionRegex);
    const usedPrefix = hasMention ? hasMention[0] : prefix;

    if (message.content.startsWith(prefix) || hasMention) {
      await handlePrefixCommand(message, client, usedPrefix);
      return;
    }

    // 🌸 3. Handle AutoMod checks
    await handleAutoMod(message, client);

    // 🌸 4. Handle XP gain from messages
    await handleXPGain(message, client);
  },
};

async function handlePrefixCommand(message, client, prefix) {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  // -- Global Rate Limiting Cooldown --
  const cooldownAmount = 3000; // 3 seconds
  if (commandCooldowns.has(message.author.id)) {
    const expirationTime = commandCooldowns.get(message.author.id) + cooldownAmount;
    if (Date.now() < expirationTime) {
      const timeLeft = (expirationTime - Date.now()) / 1000;
      return message.reply({ content: `🥺 Please wait ${timeLeft.toFixed(1)} more second(s) before putting another command!` })
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000))
        .catch(() => {});
    }
  }
  commandCooldowns.set(message.author.id, Date.now());
  setTimeout(() => commandCooldowns.delete(message.author.id), cooldownAmount);

  // 🌸 Interaction Proxy (Mimics SlashCommandInteraction) ───────────
  // This allows the same command.execute() to work for both Slash and Prefix!
  const interactionProxy = {
    isChatInputCommand: () => true, // Some commands might check this
    guildId: message.guildId,
    channelId: message.channelId,
    guild: message.guild,
    channel: message.channel,
    member: message.member,
    user: message.author,
    author: message.author, // Fallback
    createdTimestamp: message.createdTimestamp,
    deferred: false,
    replied: false,
    ephemeral: false,

    // Proxy methods for interaction-like behavior
    reply: async (payload) => {
      interactionProxy.replied = true;
      return message.reply(payload);
    },
    deferReply: async (options) => {
      interactionProxy.deferred = true;
      if (options?.ephemeral) interactionProxy.ephemeral = true;
      // We don't really defer on prefix, but some commands call it then editReply
      // So let's send a placeholder or just wait
      const thinking = await message.reply('🌸 *Processing command...*');
      interactionProxy.lastMessage = thinking;
      return thinking;
    },
    editReply: async (payload) => {
      interactionProxy.replied = true;
      if (interactionProxy.lastMessage) {
        return interactionProxy.lastMessage.edit(payload);
      }
      return message.reply(payload);
    },
    followUp: async (payload) => {
      return message.reply(payload);
    },
    deleteReply: async () => {
      if (interactionProxy.lastMessage) return interactionProxy.lastMessage.delete().catch(() => {});
    },

    // Proxy for options
    options: {
      getString: (name) => {
        if (!args.length) return null;
        return args.join(' ');
      },
      getUser: (name) => {
        const mention = message.mentions.users.first();
        return mention || client.users.cache.get(args[0]);
      },
      getMember: (name) => {
        const mention = message.mentions.members.first();
        return mention || message.guild.members.cache.get(args[0]);
      },
      getInteger: (name) => parseInt(args[0]),
      getNumber: (name) => parseFloat(args[0]),
      getBoolean: (name) => ['true', 'on', 'yes'].includes(args[0]?.toLowerCase()),
      getChannel: (name) => message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
    }
  };

  try {
    // 🌸 Execute command with proxy
    await command.execute(interactionProxy, client);
  } catch (error) {
    console.error(`ERROR in Prefix Command (${commandName}):`, error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xF4C2C2)
      .setTitle('❌ Error')
      .setDescription('hmm that didn\'t work :( check the prefix/args and try again?')
      .setTimestamp();

    if (interactionProxy.deferred || interactionProxy.replied) {
      await interactionProxy.editReply({ embeds: [errorEmbed] }).catch(() => {});
    } else {
      await message.reply({ embeds: [errorEmbed] }).catch(() => {});
    }
  }
}

async function handleAutoMod(message, client) {
  try {
    // Get server config
    const config = await getOrCreateConfig(message.guildId);

    if (!config?.automod_enabled) return;

    // Check for profanity
    if (config?.automod_antiswear && hasProfanity(message.content, true)) {
      await message.delete().catch(() => {});

      try {
        await message.author.send(
          `🤖 Your message in **${message.guild.name}** was deleted for containing profanity.`
        );
      } catch (e) {
        // DM failed, silently ignore
      }
      return;
    }

    // Check for spam
    if (config?.automod_antispam) {
      const spamCheck = checkSpam(message.guildId, message.author.id, message.channelId, 5);
      if (spamCheck.isSpam) {
        await message.delete().catch(() => {});

        try {
          await message.author.send(
            `🤖 You've been temporarily muted in **${message.guild.name}** for spam.`
          );
        } catch (e) {
          // DM failed, silently ignore
        }
        return;
      }
    }

    // Check for suspicious links
    if (config?.automod_antilinks && hasSuspiciousLinks(message.content)) {
      await message.delete().catch(() => {});

      try {
        await message.author.send(
          `🤖 Your message in **${message.guild.name}** was deleted for containing suspicious links.`
        );
      } catch (e) {
        // DM failed, silently ignore
      }
      return;
    }

    // Check for mass mentions
    if (hasMassMentions(message)) {
      await message.delete().catch(() => {});

      try {
        await message.author.send(
          `🤖 Your message in **${message.guild.name}** was deleted for mass mentions.`
        );
      } catch (e) {
        // DM failed, silently ignore
      }
      return;
    }

    cleanupSpamTracker();
  } catch (error) {
    console.error('Error in AutoMod handling:', error);
  }
}

async function handleXPGain(message, client) {
  try {
    // Check cooldown
    const cooldownKey = `${message.guildId}-${message.author.id}`;
    const now = Date.now();
    const cooldownExpiry = xpCooldowns.get(cooldownKey);

    if (cooldownExpiry && now < cooldownExpiry) {
      return; // Still on cooldown
    }

    // Get server config
    const config = await getOrCreateConfig(message.guildId);

    // Check if channel is blacklisted
    if (config?.xp_blacklist_channels?.includes(message.channelId)) {
      return;
    }

    // Check if user has blacklisted role
    if (config?.xp_blacklist_roles && config.xp_blacklist_roles.length > 0) {
      const hasBlacklistedRole = message.member?.roles.cache.some(role =>
        config.xp_blacklist_roles.includes(role.id)
      );
      if (hasBlacklistedRole) return;
    }

    // Add XP to user
    const previousUser = await getOrCreateXP(message.guildId, message.author.id);
    const previousLevel = previousUser?.level || 0;

    const updated = await addXP(
      message.guildId,
      message.author.id,
      XP_GAIN
    );

    const newLevel = updated?.level || 0;

    // Check for level up
    if (newLevel > previousLevel) {
      const levelUpMessage = config?.levelup_message || '🎉 {user} just reached level {level}!';
      const formattedMessage = levelUpMessage
        .replace('{user}', `<@${message.author.id}>`)
        .replace('{level}', newLevel.toString());

      const levelUpChannel = config?.levelup_channel
        ? message.guild.channels.cache.get(config.levelup_channel)
        : message.channel;

      if (levelUpChannel?.isSendable?.()) {
        try {
          await levelUpChannel.send(formattedMessage);
        } catch (e) {
          console.error('Failed to send level up message:', e);
        }
      }
    }

    // Set cooldown
    xpCooldowns.set(cooldownKey, now + XP_COOLDOWN_MS);

    // Clean up old cooldowns (every 100 messages)
    if (Math.random() < 0.01) {
      for (const [key, time] of xpCooldowns.entries()) {
        if (now > time) xpCooldowns.delete(key);
      }
    }
  } catch (error) {
    console.error('Error handling XP gain:', error);
  }
}