const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserFavorites = require('../models/UserFavorites');
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

async function safeJoin(kazagumo, guildId, channelId, shardId = 0) {
  const existing = kazagumo.players.get(guildId);
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
      console.error(`[Kazagumo/Shoukaku] Node "${name}" error: ${error?.message || error}`);
    })
    .on('close', (name, code, reason) => {
      console.warn(`[Kazagumo/Shoukaku] Node "${name}" closed (${code}). Reason: ${reason}`);
    })
    .on('disconnect', (name, moved) => {
      console.warn(`[Kazagumo/Shoukaku] Node "${name}" disconnected. Moved: ${moved}`);
    });

  client.kazagumo
    .on('playerStart', async (player, track) => {
      try {
        const channel = client.channels.cache.get(player.textId);
        if (!channel) return;

        const previous = player.data.get('nowPlaying');
        if (previous) player.data.set('previousTrack', previous);
        player.data.set('nowPlaying', track);

        const requester = track.requester;
        const requesterTag = requester?.tag || requester?.username || 'Unknown User';
        const requesterAvatar = requester?.displayAvatarURL?.() || null;

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
            text: `Looki Music • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
            iconURL: client.user.displayAvatarURL(),
          });

        const message = await channel.send({
          embeds: [embed],
          components: buildMusicControls(),
        }).catch(error => MusicLogger.logError('playerStart - send', error, { guildId: player.guildId }));

        if (message) player.data.set('messageId', message.id);

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
        MusicLogger.logError('playerStart', error);
      }
    })
    .on('playerEnd', async player => {
      await disablePreviousControls(client, player);
    })
    .on('playerEmpty', async player => {
      try {
        await disablePreviousControls(client, player);

        const channel = client.channels.cache.get(player.textId);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('music', client)
              .setTitle('Queue finished')
              .setDescription('All songs have been played. Add more with `/play`.')],
          }).catch(error => MusicLogger.logError('playerEmpty - send', error));
        }

        if (player.data.get('stay247')) {
          player.queue.clear();
          return;
        }

        player.destroy();
      } catch (error) {
        MusicLogger.logError('playerEmpty', error);
      }
    })
    .on('playerError', async (player, track, error) => {
      try {
        console.error(`[Kazagumo] Player error: ${error?.message || error}`);
        const channel = client.channels.cache.get(player.textId);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('error', client)
              .setTitle('Track error')
              .setDescription(`Failed to play **${track?.title || 'Unknown'}**. Skipping...`)],
          }).catch(() => null);
        }
      } catch (sendError) {
        MusicLogger.logError('playerError', sendError);
      }
    });
}

async function disablePreviousControls(client, player) {
  const messageId = player.data.get('messageId');
  if (!messageId) return;

  const channel = client.channels.cache.get(player.textId);
  if (!channel) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return;

  const disabledRows = buildMusicControls().map(row => {
    row.components.forEach(button => button.setDisabled(true));
    return row;
  });

  await message.edit({ components: disabledRows }).catch(() => null);
  player.data.delete('messageId');
}

module.exports = { buildMusicControls, handleKazagumoEvents, safeJoin };
