const { getQueue, getNextSong, setPlaying } = require('./musicManager');
const { createEmbed } = require('./embedBuilder');

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
    // Shoukaku v4 track mapping for player update
    await queue.player.playTrack({ track: { encoded: song.encoded } });

    const playEmbed = createEmbed('music', client)
      .setTitle('🎶 Now Playing')
      .setDescription(`**[${song.title}](${song.url})**`)
      .addFields(
        { name: '👤 Requester', value: song.requester, inline: true },
        { name: '⏲️ Duration', value: song.duration, inline: true }
      );
    if (song.thumbnail) playEmbed.setThumbnail(song.thumbnail);
    
    if (channel) channel.send({ embeds: [playEmbed] });
  } catch (error) {
    console.error('Lavalink Play Error:', error);
    if (channel) channel.send('❌ There was an error playing this track. Skipping...');
    playNext(guildId, client, channel);
  }
}

module.exports = {
  playNext
};
