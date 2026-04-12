const { createEmbed, CATEGORY_GIFS } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MusicLogger = require('./musicLogger');

// ── Helpers ──────────────────────────────────────────────
function formatDuration(ms) {
  if (!ms || ms <= 0) return '0:00';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function buildMusicControls() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_previous').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_pause_resume').setEmoji('🌸').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_skip').setEmoji('✨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_loop').setEmoji('🦋').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_clear').setEmoji('🧹').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_vol_down').setEmoji('◀️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('music_vol_up').setEmoji('🎀').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_like').setEmoji('🤍').setStyle(ButtonStyle.Secondary)
  );
  return [row1, row2];
}

/**
 * Fix for "guild already has connection" bug.
 * Cleans up existing stuck players before joining.
 */
async function safeJoin(kazagumo, guildId, channelId, shardId = 0) {
  // Destroy existing player if stuck
  const existing = kazagumo.players.get(guildId);
  if (existing) {
    await existing.destroy();
    // Brief wait for cleanup
    await new Promise(r => setTimeout(r, 500));
  }

  return await kazagumo.createPlayer({
    guildId,
    voiceId: channelId,
    textId: null, // set later in command
    shardId,
    deaf: true
  });
}

// ── Main Handler ─────────────────────────────────────────
function handleKazagumoEvents(client) {
  client.kazagumo.shoukaku

    // ── Shoukaku Node Events ──────────────────────────────
    .on('ready', (name) => {
      console.log(`🌸 [Kazagumo/Shoukaku] Node "${name}" connected!`);
    })
    .on('error', (name, error) => {
      console.error(`🥺 [Kazagumo/Shoukaku] Node "${name}" error: ${error?.message || error}`);
    })
    .on('close', (name, code, reason) => {
      console.warn(`⚠️ [Kazagumo/Shoukaku] Node "${name}" closed (Code: ${code}). Reason: ${reason}`);
    })
    .on('disconnect', (name, moved) => {
      console.warn(`⚠️ [Kazagumo/Shoukaku] Node "${name}" disconnected. Moved: ${moved}`);
    });

  client.kazagumo

    // ── Player Start ───────────────────────────────────────
    .on('playerStart', async (player, track) => {
      try {
        const channel = client.channels.cache.get(player.textId);
        if (!channel) return;

        const currentNowPlaying = player.data.get('nowPlaying');
        if (currentNowPlaying) {
           player.data.set('previousTrack', currentNowPlaying);
        }
        player.data.set('nowPlaying', track);

        const requester = track.requester;
        const requesterTag = requester?.tag || requester?.username || 'Unknown User';
        const requesterAvatar = requester?.displayAvatarURL?.() || null;

        const playEmbed = createEmbed('music', client)
          .setAuthor({
            name: '🎀 Now Playing 🎀',
            iconURL: requesterAvatar || client.user.displayAvatarURL(),
          })
          .setTitle(track.title)
          .setURL(track.uri)
          .setColor(0xFFB6C1)
          .setThumbnail(track.thumbnail || CATEGORY_GIFS?.music || client.user.displayAvatarURL())
          .addFields(
            { name: '🦋 Artist', value: `> **${track.author || 'Unknown'}**`, inline: true },
            { name: '💖 Duration', value: `> **${formatDuration(track.length)}**`, inline: true },
            { name: '🧸 Requested by', value: `> **${requesterTag}**`, inline: true }
          )
          .setImage(track.thumbnail || CATEGORY_GIFS?.music || null)
          .setFooter({
            text: `🎀 looki~ • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
            iconURL: client.user.displayAvatarURL(),
          });

        const message = await channel.send({
          embeds: [playEmbed],
          components: buildMusicControls(),
        }).catch(err => MusicLogger.logError('playerStart - send', err, { guildId: player.guildId }));

        // Store message ID to disable buttons later
        if (message) player.data.set('messageId', message.id);

        MusicLogger.logSuccess('playerStart', `Now playing ${track.title}`, {
          guildId: player.guildId,
          requester: requesterTag,
        });
        MusicLogger.logMusicActivity(player.guildId, 'play', { name: track.title });

      } catch (error) {
        MusicLogger.logError('playerStart', error);
      }
    })

    // ── Player End — disable buttons on old message ────────
    .on('playerEnd', async (player) => {
      try {
        const messageId = player.data.get('messageId');
        if (messageId) {
          const channel = client.channels.cache.get(player.textId);
          if (channel) {
            const msg = await channel.messages.fetch(messageId).catch(() => null);
            if (msg) {
              const disabledRows = buildMusicControls().map(row => {
                row.components.forEach(btn => btn.setDisabled(true));
                return row;
              });
              await msg.edit({ components: disabledRows }).catch(() => { });
            }
          }
          player.data.delete('messageId');
        }
      } catch (error) {
        MusicLogger.logError('playerEnd', error);
      }
    })

    // ── Player Empty ──────────────────────────────────────
    .on('playerEmpty', async (player) => {
      try {
        const messageId = player.data.get('messageId');
        if (messageId) {
          const channel = client.channels.cache.get(player.textId);
          if (channel) {
            const msg = await channel.messages.fetch(messageId).catch(() => null);
            if (msg) {
              const disabledRows = buildMusicControls().map(row => {
                row.components.forEach(btn => btn.setDisabled(true));
                return row;
              });
              await msg.edit({ components: disabledRows }).catch(() => { });
            }
          }
        }

        const channel = client.channels.cache.get(player.textId);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('music', client)
              .setTitle('🎀 Queue Finished')
              .setDescription('All songs have been played! Add more with `/play` ✨')]
          }).catch(err => MusicLogger.logError('playerEmpty - send', err));
        }

        player.destroy();
      } catch (error) {
        MusicLogger.logError('playerEmpty', error);
      }
    })

    // ── Player Error ──────────────────────────────────────
    .on('playerError', async (player, track, error) => {
      try {
        console.error(`🥺 [Kazagumo] Player error: ${error?.message || error}`);
        const channel = client.channels.cache.get(player.textId);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('error', client)
              .setTitle('🥺 Track Error')
              .setDescription(`Failed to play **${track?.title || 'Unknown'}**. Skipping... ✨`)]
          }).catch(() => { });
        }
      } catch (err) {
        MusicLogger.logError('playerError', err);
      }
    });
}

module.exports = { handleKazagumoEvents, safeJoin };