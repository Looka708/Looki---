const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song ✨'),
  execute: async (interaction, client) => {
    const player = client.riffy.players.get(interaction.guildId);

    if (!player || !player.current) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song to resume! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!player.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('✨ Already Playing')
        .setDescription('The player is not paused! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      player.pause(false);

      const resumeEmbed = createEmbed('music', client)
        .setTitle('✨ Song Resumed')
        .setDescription(`Resumed **[${player.current.info.title}](${player.current.info.uri})**! 🎀`);
      
      await interaction.editReply({ embeds: [resumeEmbed] });
      
    } catch (error) {
       console.error('Resume error:', error);
       await interaction.editReply({ content: '🥺 Failed to resume the player.' });
    }
  },
};
