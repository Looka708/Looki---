const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song 🧸'),
  execute: async (interaction, client) => {
    const player = client.kazagumo.players.get(interaction.guildId);

    if (!player || !player.queue.current) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song to skip! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      player.skip();

      const skipEmbed = createEmbed('music', client)
        .setTitle('🧸 Song Skipped')
        .setDescription('Skipped to the next melody! 🎀');
      
      await interaction.editReply({ embeds: [skipEmbed] });
      
    } catch (error) {
       console.error('Skip error:', error);
       await interaction.editReply({ content: '🥺 Failed to skip the song.' });
    }
  },
};
