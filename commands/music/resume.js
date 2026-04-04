const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song ▶️'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.player || !queue.isPlaying) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song playing to resume! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!queue.player.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('▶️ Already Resumed')
        .setDescription('The player is already playing! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      await queue.player.pause(false);

      const resumeEmbed = createEmbed('music', client)
        .setTitle('▶️ Song Resumed')
        .setDescription(`Resumed **[${queue.currentSong?.title}](${queue.currentSong?.url})**! 🎶`);
      
      await interaction.editReply({ embeds: [resumeEmbed] });
      
    } catch (error) {
       console.error('Resume error:', error);
       await interaction.editReply({ content: '❌ Failed to resume the player.' });
    }
  },
};
