const { addXP, getOrCreateXP } = require('../models/XP');
const { getOrCreateConfig } = require('../models/ServerConfig');
const { EmbedBuilder } = require('discord.js');
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

    // Handle prefix commands
    const prefix = '~';
    if (message.content.startsWith(prefix)) {
      await handlePrefixCommand(message, client, prefix);
      return;
    }

    // Handle AutoMod checks
    await handleAutoMod(message, client);

    // Handle XP gain from messages
    await handleXPGain(message, client);
  },
};

async function handlePrefixCommand(message, client, prefix) {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    await message.reply({ content: 'hmm that didn\'t work :( try again?' });
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