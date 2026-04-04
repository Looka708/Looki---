const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the current song queue 📜'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.isPlaying && queue.songs.length === 0) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Queue Empty')
        .setDescription('There is nothing in the queue! Use /play to add something! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      const currentSong = queue.currentSong;
      const nextSongs = queue.songs.slice(0, 10);
      
      const queueList = nextSongs.map((song, i) => `${i + 1}. **[${song.title}](${song.url})** | ${song.duration}`).join('\n');
      
      const queueEmbed = createEmbed('music', client)
        .setTitle('📜 Current Queue')
        .addFields(
           { name: '🎶 Now Playing', value: `**[${currentSong?.title}](${currentSong?.url})** | ${currentSong?.duration || 'Unknown'}` }
        );
      
      if (queueList) {
        queueEmbed.addFields({ name: '⏭️ Up Next', value: queueList });
      } else if (queue.songs.length > 10) {
        queueEmbed.setFooter({ text: `And ${queue.songs.length - 10} more songs...` });
      }

      await interaction.editReply({ embeds: [queueEmbed] });
      
    } catch (error) {
       console.error('Queue error:', error);
       await interaction.editReply({ content: '❌ Failed to fetch queue.' });
    }
  },
};
