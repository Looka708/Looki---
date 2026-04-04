const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const pats = [
  'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
  'https://media.giphy.com/media/109OqaoamDwwXEQ/giphy.gif',
  'https://media.giphy.com/media/108M7gCS1JSoO4/giphy.gif',
  'https://media.giphy.com/media/3o85xoi6nNqJQJ95Qc/giphy.gif',
  'https://media.giphy.com/media/Ye3c10H0R5sQM/giphy.gif'
];

module.exports = {
  name: 'pat',
  data: new SlashCommandBuilder()
    .setName('pat')
    .setDescription('🐾 give someone a gentle headpat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the cutie to pat')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const randomPat = pats[Math.floor(Math.random() * pats.length)];

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: 'giving you headpats! good job today 🌸', ephemeral: true });
    }

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** gently pats **${user.username}**! 🐾`)
      .setImage(randomPat);

    await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
  },
};
