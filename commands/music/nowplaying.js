const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('🎶 See detailed info about the current song'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.currentSong) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song playing right now.');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    const song = queue.currentSong;
    let playbackTime = 0;
    
    if (queue.audioPlayer && queue.audioPlayer.state.status === 'playing' && queue.audioPlayer.state.resource) {
        playbackTime = queue.audioPlayer.state.resource.playbackDuration;
    }

    // Attempt to format if we have durationRaw from play-dl, else default to unknown
    // Actually, play-dl handles duration directly. Let's just create a nice embed.
    
    // Creating a mock progress bar
    // Assume typical song is 3:00 if durationRaw is not available/easy to parse, 
    // but durationRaw is available from yt-search/play-dl
    
    const embed = createEmbed('music', client)
      .setTitle('🎶 Now Playing')
      .setDescription(`**[${song.title}](${song.url})**`)
      .addFields(
        { name: '👤 Requester', value: song.requester, inline: true },
        { name: '🔊 Volume', value: `${Math.round(queue.volume * 100)}%`, inline: true },
        { name: '🔁 Loop Mode', value: queue.repeat === 'off' ? 'Off' : (queue.repeat === 'one' ? 'Track' : 'Queue'), inline: true },
      );

    if (song.durationRaw) {
       embed.addFields({ name: '⏱️ Duration', value: song.durationRaw, inline: true });
    }

    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
