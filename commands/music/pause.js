const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song 🧸'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to pause! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (queue.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🧸 Already Paused')
        .setDescription('The player is already paused! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      queue.pause();

      const pauseEmbed = createEmbed('music', client)
        .setTitle('🧸 Song Paused')
        .setDescription(`Paused **[${queue.songs[0].name}](${queue.songs[0].url})**! Use /resume to continue! ✨`);
      
      await interaction.editReply({ embeds: [pauseEmbed] });
      
    } catch (error) {
       console.error('Pause error:', error);
       await interaction.editReply({ content: '🥺 Failed to pause the player.' });
    }
  },
};
