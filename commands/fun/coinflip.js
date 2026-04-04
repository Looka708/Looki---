const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'coinflip',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('🪙 flip a coin!'),
  execute: async (interaction, client) => {
    const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const embed = createEmbed('default', client)
      .setTitle('🪙 Coin Flip')
      .setDescription(`I flipped a coin and it landed on **${result}**! ✨`);

    await interaction.reply({ embeds: [embed] });
  },
};
