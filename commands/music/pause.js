const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song 🧸'),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.player || !queue.isPlaying) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to pause! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (queue.player.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🧸 Already Paused')
        .setDescription('The player is already paused! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      await queue.player.pause(true);

      const pauseEmbed = createEmbed('music', client)
        .setTitle('🧸 Song Paused')
        .setDescription(`Paused **[${queue.currentSong?.title}](${queue.currentSong?.url})**! Use /resume to continue! ✨`);
      
      await interaction.editReply({ embeds: [pauseEmbed] });
      
    } catch (error) {
       console.error('Pause error:', error);
       await interaction.editReply({ content: '🥺 Failed to pause the player.' });
    }
  },
};
