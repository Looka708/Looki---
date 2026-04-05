const { getQueue, getNextSong, setPlaying, toggleRepeat } = require('./musicManager');
const { createEmbed } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function playNext(guildId, client, channel) {
  const queue = getQueue(guildId);
  if (!queue.player) return;

  const song = getNextSong(guildId);
  if (!song) {
    queue.isPlaying = false;
    const endEmbed = createEmbed('music', client)
      .setTitle('🎵 Queue Ended')
      .setDescription('Finished playing all songs in the queue.');
    if (channel) channel.send({ embeds: [endEmbed] });
    return;
  }

  queue.currentSong = song;
  queue.isPlaying = true;

  try {
    // ── Shoukaku track mapping ───────────
    await queue.player.playTrack({ track: { encoded: song.encoded } });

    // ── Build Embed ───────────
    const playEmbed = createEmbed('music', client)
      .setTitle('🎶 Now Playing')
      .setDescription(`**[${song.title}](${song.url})**`)
      .addFields(
        { name: '👤 Requester', value: song.requester, inline: true },
        { name: '⏲️ Duration', value: song.duration, inline: true },
        { name: '🔁 Loop', value: `\`${queue.repeat.toUpperCase()}\``, inline: true }
      );
    if (song.thumbnail) playEmbed.setThumbnail(song.thumbnail);

    // ── Build Buttons (Thematic Aesthetic) ───────────
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('music_pause_resume')
        .setLabel('⏯️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_skip')
        .setLabel('⏭️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_stop')
        .setLabel('⏹️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_loop')
        .setLabel('🔁')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_queue')
        .setLabel('📜')
        .setStyle(ButtonStyle.Secondary)
    );

    if (channel) channel.send({ embeds: [playEmbed], components: [row] });

  } catch (error) {
    console.error('Lavalink Play Error:', error);
    if (channel) channel.send('❌ There was an error playing this track. Skipping...');
    playNext(guildId, client, channel);
  }
}

module.exports = {
  playNext
};
