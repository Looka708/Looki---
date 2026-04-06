const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue, setVolume } = require('../../utils/musicManager');

module.exports = {
  name: 'volume',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the music volume (0-100) ✨')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume level (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),
  execute: async (interaction, client) => {
    const queue = getQueue(interaction.guildId);

    if (!queue.player || !queue.isPlaying) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to adjust volume! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      const level = interaction.options.getInteger('level');

      setVolume(interaction.guildId, level);

      const volEmbed = createEmbed('music', client)
        .setTitle('✨ Volume Adjusted')
        .setDescription(`Volume set to **${level}%**!`);
      
      await interaction.editReply({ embeds: [volEmbed] });
      
    } catch (error) {
       console.error('Volume error:', error);
       await interaction.editReply({ content: '🥺 Failed to adjust volume.' });
    }
  },
};
