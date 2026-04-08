const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { deleteQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current song and clear the queue ⏹️'),
  execute: async (interaction, client) => {
    try {
      await interaction.deferReply();
      
      const guildId = interaction.guildId;
      await deleteQueue(guildId, client); // This will cleanly destroy the Shoukaku player too

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
