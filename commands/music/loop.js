const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'loop',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle loop mode 🔁')
    .addIntegerOption(option =>
      option.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 0 },
          { name: 'Track', value: 1 },
          { name: 'Queue', value: 2 }
        )
    ),
  execute: async (interaction, client) => {
    const player = client.riffy.players.get(interaction.guildId);

    if (!player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const mode = interaction.options.getInteger('mode');
      const modes = ['none', 'track', 'queue'];
      player.setLoop(modes[mode]);
      
      const displayModes = ['OFF', 'TRACK', 'QUEUE'];
      const embed = createEmbed('music', client)
        .setTitle('🔁 Loop Mode Updated')
        .setDescription(`Set loop mode to: **${displayModes[mode]}** ✨`);
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
       console.error('Loop error:', error);
       await interaction.reply({ content: '❌ Failed to update loop mode.', ephemeral: true });
    }
  },
};
