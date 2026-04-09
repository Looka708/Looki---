const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song 🧸'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song to skip! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      if (queue.songs.length <= 1 && !queue.autoplay) {
          queue.stop();
          const stopEmbed = createEmbed('music', client)
            .setTitle('🧸 Queue Ended')
            .setDescription('No more songs in queue! Stopping playback. ✨');
          return interaction.editReply({ embeds: [stopEmbed] });
      }

      await queue.skip();

      const skipEmbed = createEmbed('music', client)
        .setTitle('🧸 Song Skipped')
        .setDescription('Skipped to the next melody! 🎀');
      
      await interaction.editReply({ embeds: [skipEmbed] });
      
    } catch (error) {
       console.error('Skip error:', error);
       // Handle "No next song" error gracefully
       if (error.message.includes('NO_UP_NEXT')) {
           queue.stop();
           return interaction.editReply({ content: '🧸 No more songs to skip to! Stopping playback. ✨' });
       }
       await interaction.editReply({ content: '🥺 Failed to skip the song.' });
    }
  },
};
