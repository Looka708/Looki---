const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue 🧸'),
  execute: async (interaction, client) => {
    const player = client.kazagumo.players.get(interaction.guildId);

    if (!player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      player.destroy();

      const stopEmbed = createEmbed('music', client)
        .setTitle('🧸 Music Stopped')
        .setDescription('The melody has faded... See you soon! ✨');
      
      await interaction.editReply({ embeds: [stopEmbed] });
      
    } catch (error) {
       console.error('Stop error:', error);
       await interaction.editReply({ content: '🥺 Failed to stop the music.' });
    }
  },
};
