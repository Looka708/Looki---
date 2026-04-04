const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('See information about the song currently playing 🎶'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.player || !queue.isPlaying) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song currently playing! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      const song = queue.currentSong;
      const position = queue.player.position;
      const length = song.duration;
      
      // Progress bar (basic)
      const totalParts = 15;
      const progress = Math.min(Math.floor((position / (song.durationMs || 1000)) * totalParts), totalParts);
      const bar = '▬'.repeat(progress) + '○' + '▬'.repeat(totalParts - progress);
      
      const npEmbed = createEmbed('music', client)
        .setTitle('🎶 Now Playing')
        .setDescription(`**[${song.title}](${song.url})**`)
        .addFields(
           { name: '👤 Requester', value: song.requester, inline: true },
           { name: '⏲️ Duration', value: `${new Date(position).toISOString().substr(11, 8).replace(/^00:/, '')} / ${length}`, inline: true }
        );
      
      if (bar) npEmbed.addFields({ name: 'Progress', value: `\`${bar}\`` });
      if (song.thumbnail) npEmbed.setThumbnail(song.thumbnail);

      await interaction.editReply({ embeds: [npEmbed] });
      
    } catch (error) {
       console.error('NowPlaying error:', error);
       await interaction.editReply({ content: '❌ Failed to fetch track information.' });
    }
  },
};
