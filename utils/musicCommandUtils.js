const { PermissionFlagsBits } = require('discord.js');
const ServerMusicSettings = require('../models/ServerMusicSettings');
const { createMusicEmbed } = require('./musicEmbed');

function requirePlayer(interaction, client, { requireTrack = true } = {}) {
  const player = client.kazagumo.players.get(interaction.guildId);
  if (!player || (requireTrack && !player.queue.current)) {
    return {
      error: createMusicEmbed(client, {
        type: 'error',
        title: 'Nothing is playing',
        description: 'Start a song with `/play` first.',
      }),
    };
  }
  return { player };
}

function requireSameVoice(interaction, client, player) {
  const voiceChannel = interaction.member?.voice?.channel;
  if (!voiceChannel) {
    return {
      error: createMusicEmbed(client, {
        type: 'error',
        title: 'Join a voice channel',
        description: 'You need to be in a voice channel to use this music command.',
      }),
    };
  }

  if (player?.voiceId && voiceChannel.id !== player.voiceId) {
    return {
      error: createMusicEmbed(client, {
        type: 'error',
        title: 'Wrong voice channel',
        description: 'Join the same voice channel as Looki first.',
      }),
    };
  }

  return { voiceChannel };
}

function canManageMusic(interaction, track) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
    || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    || track?.requester?.id === interaction.user.id;
}

async function canControlMusic(interaction, player, track = player?.queue?.current) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
    || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return true;
  }

  const settings = await ServerMusicSettings.getSettings(interaction.guildId);
  if (settings?.dj_role_id && interaction.member?.roles?.cache?.has(settings.dj_role_id)) {
    return true;
  }

  return Boolean(track?.requester?.id && track.requester.id === interaction.user.id);
}

function getRequiredSkipVotes(interaction, player) {
  const voiceChannel = interaction.guild?.channels?.cache?.get(player.voiceId)
    || interaction.member?.voice?.channel;
  const listeners = voiceChannel?.members?.filter(member => !member.user.bot).size || 1;
  return Math.max(1, Math.ceil(listeners / 2));
}

async function requestSkipVote(interaction, client, player) {
  const votes = player.data.get('skipVotes') || new Set();
  votes.add(interaction.user.id);
  player.data.set('skipVotes', votes);

  const required = getRequiredSkipVotes(interaction, player);
  if (votes.size >= required) {
    const skipped = player.queue.current;
    player.data.set('skipVotes', new Set());
    player.skip();
    return {
      skipped: true,
      embed: createMusicEmbed(client, {
        title: 'Vote skip passed',
        description: `Skipped **[${skipped.title}](${skipped.uri})** with **${votes.size}/${required}** vote(s).`,
      }),
    };
  }

  return {
    skipped: false,
    embed: createMusicEmbed(client, {
      title: 'Skip vote added',
      description: `You voted to skip. **${votes.size}/${required}** vote(s) needed.`,
    }),
  };
}

function parseSeekTime(input) {
  const value = String(input || '').trim().toLowerCase();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);

  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(value)) {
    const parts = value.split(':').map(Number);
    return parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1];
  }

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return null;

  const seconds =
    Number(match[1] || 0) * 3600 +
    Number(match[2] || 0) * 60 +
    Number(match[3] || 0);

  return Number.isFinite(seconds) ? seconds : null;
}

module.exports = {
  canManageMusic,
  canControlMusic,
  getRequiredSkipVotes,
  parseSeekTime,
  requestSkipVote,
  requirePlayer,
  requireSameVoice,
};
