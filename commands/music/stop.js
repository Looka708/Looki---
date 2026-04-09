const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and leave the voice channel 🎀'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);

    if (!queue) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no active music session to stop! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      client.music.stop(interaction.guildId);
      
      const player = client.shoukaku.players.get(interaction.guildId);
      if (player) {
          await client.shoukaku.leaveVoiceChannel(interaction.guildId);
      }

      const stopEmbed = createEmbed('music', client)
        .setTitle('⏹️ Stopped Music')
        .setDescription('The music has been stopped and I have left the voice channel. Bye bye! ~ ✨');
      
      await interaction.editReply({ embeds: [stopEmbed] });
      
    } catch (error) {
      console.error('Stop command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Error Stopping')
        .setDescription('Something went wrong while trying to stop.');
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
