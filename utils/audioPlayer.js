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

// ── Main Handler ─────────────────────────────────────────
function handleRiffyEvents(client) {
  client.riffy

    // ── Node Events ───────────────────────────────────────
    .on('nodeConnect', (node) => {
      console.log(`🌸 [Riffy] Node "${node.name}" connected!`);
    })
    .on('nodeError', (node, error) => {
      console.error(`🥺 [Riffy] Node "${node.name}" error: ${error?.message || error}`);
    })
    .on('nodeDisconnect', (node) => {
      console.warn(`⚠️ [Riffy] Node "${node.name}" disconnected. Will attempt reconnect...`);
    })

    // ── Track Start ───────────────────────────────────────
    .on('trackStart', async (player, track) => {
      try {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        const requester = track.info.requester;
        const requesterTag = requester?.tag || requester?.username || 'Unknown User';
        const requesterAvatar = requester?.displayAvatarURL?.() || null;

        const playEmbed = createEmbed('music', client)
          .setAuthor({
            name: '🎀 Now Playing 🎀',
            iconURL: requesterAvatar || client.user.displayAvatarURL(),
          })
          .setTitle(track.info.title)
          .setURL(track.info.uri)
          .setColor(0xFFB6C1)
          .addFields(
            { name: '🦋 Artist', value: `> **${track.info.author || 'Unknown'}**`, inline: true },
            { name: '💖 Duration', value: `> **${formatDuration(track.info.length)}**`, inline: true },
            { name: '🧸 Requested by', value: `> **${requesterTag}**`, inline: true }
          )
          .setImage(track.info.thumbnail || CATEGORY_GIFS?.music || null)
          .setThumbnail(CATEGORY_GIFS?.music || client.user.displayAvatarURL())
          .setFooter({
            text: `🎀 looki~ • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
            iconURL: client.user.displayAvatarURL(),
          });

        const message = await channel.send({
          embeds: [playEmbed],
          components: buildMusicControls(),
        }).catch(err => MusicLogger.logError('trackStart - send', err, { guildId: player.guildId }));

        // Store message ID to disable buttons later
        if (message) player.messageId = message.id;

        MusicLogger.logSuccess('trackStart', `Now playing ${track.info.title}`, {
          guildId: player.guildId,
          requester: requesterTag,
        });
        MusicLogger.logMusicActivity(player.guildId, 'play', { name: track.info.title });

      } catch (error) {
        MusicLogger.logError('trackStart', error);
      }
    })

    // ── Track End — disable buttons on old message ────────
    .on('trackEnd', async (player) => {
      try {
        if (player.messageId) {
          const channel = client.channels.cache.get(player.textChannel);
          if (channel) {
            const msg = await channel.messages.fetch(player.messageId).catch(() => null);
            if (msg) {
              const disabledRows = buildMusicControls().map(row => {
                row.components.forEach(btn => btn.setDisabled(true));
                return row;
              });
              await msg.edit({ components: disabledRows }).catch(() => { });
            }
          }
          player.messageId = null;
        }
      } catch (error) {
        MusicLogger.logError('trackEnd', error);
      }
    })

    // ── Track Error ───────────────────────────────────────
    .on('trackError', async (player, track, error) => {
      try {
        console.error(`🥺 [Riffy] Track error: ${error?.message || error}`);
        const channel = client.channels.cache.get(player.textChannel);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('error', client)
              .setTitle('🥺 Track Error')
              .setDescription(`Failed to play **${track?.info?.title || 'Unknown'}**. Skipping... ✨`)]
          }).catch(() => { });
        }
        // Auto-skip to next track
        if (player.queue.size > 0) {
          player.stop();
        } else {
          player.destroy();
        }
      } catch (err) {
        MusicLogger.logError('trackError', err);
      }
    })

    // ── Queue End ─────────────────────────────────────────
    .on('queueEnd', async (player) => {
      try {
        // Disable buttons on last now-playing message
        if (player.messageId) {
          const channel = client.channels.cache.get(player.textChannel);
          if (channel) {
            const msg = await channel.messages.fetch(player.messageId).catch(() => null);
            if (msg) {
              const disabledRows = buildMusicControls().map(row => {
                row.components.forEach(btn => btn.setDisabled(true));
                return row;
              });
              await msg.edit({ components: disabledRows }).catch(() => { });
            }
          }
        }

        const channel = client.channels.cache.get(player.textChannel);
        if (channel) {
          await channel.send({
            embeds: [createEmbed('music', client)
              .setTitle('🎀 Queue Finished')
              .setDescription('All songs have been played! Add more with `/play` ✨')]
          }).catch(err => MusicLogger.logError('queueEnd - send', err));
        }

        player.destroy();
      } catch (error) {
        MusicLogger.logError('queueEnd', error);
      }
    });
}

module.exports = { handleRiffyEvents };