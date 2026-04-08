const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song 🎀'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to resume! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!queue.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🎀 Already Resumed')
        .setDescription('The player is already playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      queue.resume();

      const resumeEmbed = createEmbed('music', client)
        .setTitle('🎀 Song Resumed')
        .setDescription(`Resumed **[${queue.songs[0].name}](${queue.songs[0].url})**! ✨`);
      
      await interaction.editReply({ embeds: [resumeEmbed] });
      
    } catch (error) {
       console.error('Resume error:', error);
       await interaction.editReply({ content: '🥺 Failed to resume the player.' });
    }
  },
};
