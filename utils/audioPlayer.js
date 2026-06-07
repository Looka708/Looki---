const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const UserFavorites = require('../models/UserFavorites');
const ServerMusicSettings = require('../models/ServerMusicSettings');
const { createEmbed } = require('./embedBuilder');
const MusicLogger = require('./musicLogger');

function formatDuration(ms) {
  if (!ms || ms <= 0) return '0:00';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return hours
    ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${mins}:${String(secs).padStart(2, '0')}`;
}

function buildMusicControls() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_shuffle').setLabel('Shuffle').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_previous').setLabel('Previous').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_pause_resume').setLabel('Pause/Resume').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_skip').setLabel('Skip').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_loop').setLabel('Loop').setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_clear').setLabel('Clear').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_vol_down').setLabel('Vol -').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('music_vol_up').setLabel('Vol +').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_like').setLabel('Favorite').setStyle(ButtonStyle.Secondary),
  );

  return [row1, row2];
}

function getGuildMe(channel, client) {
  return channel?.guild?.members?.me || channel?.guild?.members?.cache?.get(client.user.id) || null;
}

function canSendMusicMessage(channel, client) {
  if (!channel?.isTextBased?.()) {
    return { ok: false, reason: 'channel is not text-based' };
  }

  const me = getGuildMe(channel, client);
  const permissions = me ? channel.permissionsFor(me) : null;
  if (!permissions) {
    return { ok: false, reason: 'missing permission cache' };
  }

  const required = [
    ['View Channel', PermissionFlagsBits.ViewChannel],
    ['Send Messages', PermissionFlagsBits.SendMessages],
    ['Embed Links', PermissionFlagsBits.EmbedLinks],
  ];
  const missing = required
    .filter(([, permission]) => !permissions.has(permission))
    .map(([name]) => name);

  return missing.length
    ? { ok: false, reason: `missing ${missing.join(', ')}` }
    : { ok: true };
}

async function sendMusicMessage(client, channel, payload, context, guildId) {
  const permissionCheck = canSendMusicMessage(channel, client);
  if (!permissionCheck.ok) {
    console.warn(`[Music] Skipping ${context} in guild ${guildId}: ${permissionCheck.reason}`);
    return null;
  }

  return channel.send(payload).catch(error => {
    if (error?.code === 50013) {
      console.warn(`[Music] Missing permission for ${context} in guild ${guildId}.`);
      return null;
    }

    MusicLogger.logError(context, error, { guildId });
    return null;
  });
}

function getOnlineMusicNodes(client) {
  const nodes = client.kazagumo?.shoukaku?.nodes;
  if (!nodes) return [];
  return [...nodes.values()].filter(node => node.state === 1);
}

function hasOnlineMusicNode(client) {
  return getOnlineMusicNodes(client).length > 0;
}

async function waitForOnlineMusicNode(client, timeoutMs = 8000) {
  if (hasOnlineMusicNode(client)) return true;

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (hasOnlineMusicNode(client)) return true;
  }

  return false;
}

function createMusicServiceOfflineEmbed(client) {
  const nodes = client.kazagumo?.shoukaku?.nodes;
  const nodeNames = nodes?.size
    ? [...nodes.values()].map(node => `${node.name}: ${getNodeStateName(node.state)}`).join('\n')
    : 'No Lavalink nodes are configured.';

  return createEmbed('error', client)
    .setTitle('Music service offline')
    .setDescription('No Lavalink node is online yet, so I cannot search or join voice right now.')
    .addFields(
      { name: 'Current nodes', value: nodeNames.slice(0, 1024) || 'No status available.' },
      { name: 'What to do', value: 'Check your Lavalink host/password, restart the bot, or use a stable private Lavalink node.' },
    );
}

function getNodeStateName(state) {
  const names = ['CONNECTING', 'CONNECTED', 'DISCONNECTING', 'DISCONNECTED'];
  return names[state] || `UNKNOWN(${state})`;
}

async function resolveMusicChannel(client, player, settings = null) {
  const channelIds = [
    settings?.music_text_channel_id,
    player.textId,
  ].filter((channelId, index, values) => channelId && values.indexOf(channelId) === index);

  for (const channelId of channelIds) {
    const channel = client.channels.cache.get(channelId)
      || await client.channels.fetch(channelId).catch(() => null);
    if (channel?.isTextBased?.()) {
      player.textId = channel.id;
      return channel;
    }
  }

  return null;
}

async function safeJoin(kazagumo, guildId, channelId, shardId = 0) {
  if (!hasOnlineMusicNode({ kazagumo })) {
    throw new Error('No Lavalink nodes are online.');
  }

  const existing = kazagumo.players.get(guildId);
  if (existing?.voiceId === channelId) return existing;

  if (existing) {
    await existing.destroy();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return kazagumo.createPlayer({
    guildId,
    voiceId: channelId,
    textId: null,
    shardId,
    deaf: true,
  });
}

function handleKazagumoEvents(client) {
  client.kazagumo.shoukaku
    .on('ready', name => {
      console.log(`[Kazagumo/Shoukaku] Node "${name}" connected.`);
    })
    .on('error', (name, error) => {
      const message = error?.message || error;
      if (String(message).includes('ECONNRESET')) {
        console.warn(`[Kazagumo/Shoukaku] Node "${name}" reset the connection. Shoukaku will retry.`);
        return;
      }
      console.error(`[Kazagumo/Shoukaku] Node "${name}" error: ${message}`);
    })
    .on('close', (name, code, reason) => {
      const detail = reason ? ` Reason: ${reason}` : '';
      console.warn(`[Kazagumo/Shoukaku] Node "${name}" closed (${code}). Reconnecting if available.${detail}`);
    })
    .on('disconnect', (name, moved) => {
      console.warn(`[Kazagumo/Shoukaku] Node "${name}" disconnected. Moved: ${moved}`);
    });

  client.kazagumo
    .on('playerStart', async (player, track) => {
      try {
        const previous = player.data.get('nowPlaying');
        if (previous) player.data.set('previousTrack', previous);
        player.data.set('nowPlaying', track);
        player.data.set('skipVotes', new Set());

        const requester = track.requester;
        const requesterTag = requester?.tag || requester?.username || 'Unknown User';
        const requesterAvatar = requester?.displayAvatarURL?.() || null;
        const settings = await ServerMusicSettings.getSettings(player.guildId);
        const channel = await resolveMusicChannel(client, player, settings);

        if (channel && settings?.announce_songs !== false) {
          const embed = createEmbed('music', client)
            .setAuthor({
              name: 'Now Playing',
              iconURL: requesterAvatar || client.user.displayAvatarURL(),
            })
            .setTitle(track.title)
            .setURL(track.uri)
            .setColor(0xB86BFF)
            .setThumbnail(track.thumbnail || client.user.displayAvatarURL())
            .addFields(
              { name: 'Artist', value: `> **${track.author || 'Unknown'}**`, inline: true },
              { name: 'Duration', value: `> **${formatDuration(track.length)}**`, inline: true },
              { name: 'Requested by', value: `> **${requesterTag}**`, inline: true },
            )
            .setFooter({
              text: `Looki Music | ${new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}`,
              iconURL: client.user.displayAvatarURL(),
            });

          const message = await sendMusicMessage(client, channel, {
            embeds: [embed],
            components: buildMusicControls(),
          }, 'playerStart - send', player.guildId);

          if (message) player.data.set('messageId', message.id);
        }

        MusicLogger.logSuccess('playerStart', `Now playing ${track.title}`, {
          guildId: player.guildId,
          requester: requesterTag,
        });
        MusicLogger.logMusicActivity(player.guildId, 'play', { name: track.title });

        if (track.requester?.id) {
          await UserFavorites.recordPlay(track.requester.id, {
            name: track.title,
            url: track.uri,
            uploader: { name: track.author || 'Unknown' },
          }, track.length || 0);
        }
      } catch (error) {
        MusicLogger.logError('playerStart', error, { guildId: player.guildId });
      }
    })
    .on('playerEnd', async player => {
      await disablePreviousControls(client, player);
    })
    .on('playerEmpty', async player => {
      try {
        await disablePreviousControls(client, player);

        const settings = await ServerMusicSettings.getSettings(player.guildId);
        const channel = await resolveMusicChannel(client, player, settings);
        if (channel && settings?.announce_songs !== false) {
          await sendMusicMessage(client, channel, {
            embeds: [createEmbed('music', client)
              .setTitle('Queue finished')
              .setDescription('All songs have been played. Add more with `/play`.')],
          }, 'playerEmpty - send', player.guildId);
        }

        if (player.data.get('stay247')) {
          player.queue.clear();
          return;
        }

        await player.destroy();
      } catch (error) {
        MusicLogger.logError('playerEmpty', error, { guildId: player.guildId });
      }
    })
    .on('playerError', async (player, track, error) => {
      try {
        console.error(`[Kazagumo] Player error: ${error?.message || error}`);
        const settings = await ServerMusicSettings.getSettings(player.guildId);
        const channel = await resolveMusicChannel(client, player, settings);
        if (channel) {
          await sendMusicMessage(client, channel, {
            embeds: [createEmbed('error', client)
              .setTitle('Track error')
              .setDescription(`Failed to play **${track?.title || 'Unknown'}**. Skipping...`)],
          }, 'playerError - send', player.guildId);
        }
      } catch (sendError) {
        MusicLogger.logError('playerError', sendError, { guildId: player.guildId });
      }
    });
}

async function disablePreviousControls(client, player) {
  const messageId = player.data.get('messageId');
  if (!messageId) return;

  const settings = await ServerMusicSettings.getSettings(player.guildId);
  const channel = await resolveMusicChannel(client, player, settings);
  if (!channel || !canSendMusicMessage(channel, client).ok) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return;

  const disabledRows = buildMusicControls().map(row => {
    row.components.forEach(button => button.setDisabled(true));
    return row;
  });

  await message.edit({ components: disabledRows }).catch(() => null);
  player.data.delete('messageId');
}

module.exports = {
  buildMusicControls,
  canSendMusicMessage,
  createMusicServiceOfflineEmbed,
  getOnlineMusicNodes,
  handleKazagumoEvents,
  hasOnlineMusicNode,
  resolveMusicChannel,
  safeJoin,
  sendMusicMessage,
  waitForOnlineMusicNode,
};
