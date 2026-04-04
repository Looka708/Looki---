const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'roll',
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('🎲 roll some dice!')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('how many sides should the dice have? (default: 6)')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false)
    ),
  execute: async (interaction, client) => {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = createEmbed('default', client)
      .setTitle('🎲 Dice Roll')
      .setDescription(`I rolled a d${sides} and got... **${result}**! 🌸`);

    await interaction.reply({ embeds: [embed] });
  },
};
