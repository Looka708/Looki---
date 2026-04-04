const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');
const { playNext } = require('../../utils/audioPlayer');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song ⏭️'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.player || !queue.isPlaying) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song playing to skip! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      const currentSong = queue.currentSong;
      await queue.player.stopTrack(); // Shoukaku 'end' event will trigger playNext

      const skipEmbed = createEmbed('music', client)
        .setTitle('⏭️ Skipped Song')
        .setDescription(`Skipped **[${currentSong.title}](${currentSong.url})**`);
      
      await interaction.editReply({ embeds: [skipEmbed] });
      
    } catch (error) {
      console.error('Skip command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error Skipping')
        .setDescription('Something went wrong while trying to skip.');
      if (interaction.deferred) await interaction.editReply({ embeds: [errorEmbed] });
      else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
