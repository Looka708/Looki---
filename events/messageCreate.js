const { addXP, getOrCreateXP } = require('../models/XP');
const { getOrCreateConfig } = require('../models/ServerConfig');
const { EmbedBuilder, Collection } = require('discord.js');

const commandCooldowns = new Collection();
const xpCooldowns = new Map();

const {
  hasProfanity,
  checkSpam,
  hasSuspiciousLinks,
  hasMassMentions,
  cleanupSpamTracker,
} = require('../utils/automod');

const XP_COOLDOWN_MS = 60000;
const XP_GAIN = 10;

module.exports = {
  name: 'messageCreate',
  execute: async (message, client) => {
    if (message.author.bot || !message.guild) return;

    const config = await getOrCreateConfig(message.guildId);
    const prefix = config?.prefix || 'p!';

    const mentionRegex = new RegExp(`^<@!?${client.user.id}> `);
    const hasMention = message.content.match(mentionRegex);
    const usedPrefix = hasMention ? hasMention[0] : prefix;

    if (message.content.startsWith(prefix) || hasMention) {
      await handlePrefixCommand(message, client, usedPrefix);
      return;
    }

    await handleAutoMod(message);
    await handleXPGain(message);
  },
};

async function handlePrefixCommand(message, client, prefix) {
  const args = message.content.slice(prefix.length).trim().split(/ +/).filter(Boolean);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  const cooldownAmount = 3000;
  if (commandCooldowns.has(message.author.id)) {
    const expirationTime = commandCooldowns.get(message.author.id) + cooldownAmount;
    if (Date.now() < expirationTime) {
      const timeLeft = (expirationTime - Date.now()) / 1000;
      return message.reply({
        content: `Please wait ${timeLeft.toFixed(1)} more second(s) before using another command.`,
      })
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000))
        .catch(() => {});
    }
  }
  commandCooldowns.set(message.author.id, Date.now());
  setTimeout(() => commandCooldowns.delete(message.author.id), cooldownAmount);

  const interactionProxy = createInteractionProxy(message, client, args);

  try {
    await command.execute(interactionProxy, client);
  } catch (error) {
    console.error(`ERROR in Prefix Command (${commandName}):`, error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xF4C2C2)
      .setTitle('Command error')
      .setDescription('That did not work. Check the prefix command arguments and try again.')
      .setTimestamp();

    if (interactionProxy.deferred || interactionProxy.replied) {
      await interactionProxy.editReply({ embeds: [errorEmbed] }).catch(() => {});
    } else {
      await message.reply({ embeds: [errorEmbed] }).catch(() => {});
    }
  }
}

function createInteractionProxy(message, client, args) {
  let subcommandUsed = false;

  const proxy = {
    isChatInputCommand: () => true,
    guildId: message.guildId,
    channelId: message.channelId,
    guild: message.guild,
    channel: message.channel,
    member: message.member,
    user: message.author,
    author: message.author,
    createdTimestamp: message.createdTimestamp,
    deferred: false,
    replied: false,
    lastMessage: null,

    reply: async (payload) => {
      proxy.replied = true;
      return message.reply(payload);
    },
    deferReply: async (options = {}) => {
      proxy.deferred = true;
      proxy.lastMessage = await message.reply('*Processing command...*');
      return proxy.lastMessage;
    },
    editReply: async (payload) => {
      proxy.replied = true;
      if (proxy.lastMessage) return proxy.lastMessage.edit(payload);
      return message.reply(payload);
    },
    followUp: async (payload) => message.reply(payload),
    deleteReply: async () => {
      if (proxy.lastMessage) return proxy.lastMessage.delete().catch(() => {});
      return null;
    },

    options: {
      getSubcommand: () => {
        subcommandUsed = true;
        return args[0];
      },
      getString: () => {
        const values = subcommandUsed ? args.slice(1) : args;
        return values.join(' ') || null;
      },
      getUser: () => {
        const mention = message.mentions.users.first();
        const values = subcommandUsed ? args.slice(1) : args;
        return mention || client.users.cache.get(values[0]) || null;
      },
      getMember: () => {
        const mention = message.mentions.members.first();
        const values = subcommandUsed ? args.slice(1) : args;
        return mention || message.guild.members.cache.get(values[0]) || null;
      },
      getInteger: () => {
        const values = subcommandUsed ? args.slice(1) : args;
        const value = Number.parseInt(values[0], 10);
        return Number.isNaN(value) ? null : value;
      },
      getNumber: () => {
        const values = subcommandUsed ? args.slice(1) : args;
        const value = Number.parseFloat(values[0]);
        return Number.isNaN(value) ? null : value;
      },
      getBoolean: () => {
        const values = subcommandUsed ? args.slice(1) : args;
        return ['true', 'on', 'yes', 'enable', 'enabled'].includes(values[0]?.toLowerCase());
      },
      getChannel: () => {
        const values = subcommandUsed ? args.slice(1) : args;
        return message.mentions.channels.first() || message.guild.channels.cache.get(values[0]) || null;
      },
    },
  };

  return proxy;
}

async function handleAutoMod(message) {
  try {
    const config = await getOrCreateConfig(message.guildId);
    if (!config?.automod_enabled) return;

    if (config?.automod_antiswear && hasProfanity(message.content, true)) {
      await message.delete().catch(() => {});
      await message.author.send(
        `Your message in **${message.guild.name}** was deleted for containing profanity.`,
      ).catch(() => {});
      return;
    }

    if (config?.automod_antispam) {
      const spamCheck = checkSpam(message.guildId, message.author.id, message.channelId, 5);
      if (spamCheck.isSpam) {
        await message.delete().catch(() => {});
        await message.author.send(
          `You've been temporarily muted in **${message.guild.name}** for spam.`,
        ).catch(() => {});
        return;
      }
    }

    if (config?.automod_antilinks && hasSuspiciousLinks(message.content)) {
      await message.delete().catch(() => {});
      await message.author.send(
        `Your message in **${message.guild.name}** was deleted for containing suspicious links.`,
      ).catch(() => {});
      return;
    }

    if (hasMassMentions(message)) {
      await message.delete().catch(() => {});
      await message.author.send(
        `Your message in **${message.guild.name}** was deleted for mass mentions.`,
      ).catch(() => {});
      return;
    }

    cleanupSpamTracker();
  } catch (error) {
    console.error('Error in AutoMod handling:', error);
  }
}

async function handleXPGain(message) {
  try {
    const cooldownKey = `${message.guildId}-${message.author.id}`;
    const now = Date.now();
    const cooldownExpiry = xpCooldowns.get(cooldownKey);
    if (cooldownExpiry && now < cooldownExpiry) return;

    const config = await getOrCreateConfig(message.guildId);
    if (config?.xp_blacklist_channels?.includes(message.channelId)) return;

    if (config?.xp_blacklist_roles?.length) {
      const hasBlacklistedRole = message.member?.roles.cache.some(role =>
        config.xp_blacklist_roles.includes(role.id));
      if (hasBlacklistedRole) return;
    }

    const previousUser = await getOrCreateXP(message.guildId, message.author.id);
    const previousLevel = previousUser?.level || 0;
    const updated = await addXP(message.guildId, message.author.id, XP_GAIN);
    const newLevel = updated?.level || 0;

    if (newLevel > previousLevel) {
      const levelUpMessage = config?.levelup_message || '{user} just reached level {level}!';
      const formattedMessage = levelUpMessage
        .replace('{user}', `<@${message.author.id}>`)
        .replace('{level}', newLevel.toString());

      const levelUpChannel = config?.levelup_channel
        ? message.guild.channels.cache.get(config.levelup_channel)
        : message.channel;

      if (levelUpChannel?.isSendable?.()) {
        await levelUpChannel.send(formattedMessage).catch(error => {
          console.error('Failed to send level up message:', error);
        });
      }
    }

    xpCooldowns.set(cooldownKey, now + XP_COOLDOWN_MS);

    if (Math.random() < 0.01) {
      for (const [key, time] of xpCooldowns.entries()) {
        if (now > time) xpCooldowns.delete(key);
      }
    }
  } catch (error) {
    console.error('Error handling XP gain:', error);
  }
}
