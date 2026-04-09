const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'volume',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the music volume (0-100) 🎀')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Volume percentage (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);
    const player = client.shoukaku.players.get(interaction.guildId);

    if (!queue || !player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const amount = interaction.options.getInteger('amount');
      
      queue.volume = amount;
      await player.setVolume(amount / 100);

      const volEmbed = createEmbed('music', client)
        .setTitle('🔊 Volume Adjusted')
        .setDescription(`Set the volume to **${amount}%** ✨`);
      
      await interaction.reply({ embeds: [volEmbed] });
      
    } catch (error) {
       console.error('Volume error:', error);
       await interaction.reply({ content: '❌ Failed to set volume.', ephemeral: true });
    }
  },
};
