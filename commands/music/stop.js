const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current song and clear the queue ⏹️'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      await queue.stop();

      const stopEmbed = createEmbed('music', client)
        .setTitle('⏹️ Stopped Playing')
        .setDescription('The queue has been cleared and I have disconnected from the voice channel! 🌸');
      
      await interaction.editReply({ embeds: [stopEmbed] });
      
    } catch (error) {
      console.error('Stop command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Error Stopping')
        .setDescription('Something went wrong while trying to stop.');
      if (interaction.deferred) await interaction.editReply({ embeds: [errorEmbed] });
      else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
