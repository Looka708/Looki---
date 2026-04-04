const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const hugs = [
  'https://media.giphy.com/media/3bzA1E0FDEq4kY0Tj9/giphy.gif',
  'https://media.giphy.com/media/lrr9cScdxK0NO/giphy.gif',
  'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
  'https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif',
  'https://media.giphy.com/media/u9BxQbM5bxvwY/giphy.gif'
];

module.exports = {
  name: 'hug',
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('🤗 give someone a warm hug')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the cutie to hug')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const randomHug = hugs[Math.floor(Math.random() * hugs.length)];

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: 'sending you a self-hug! 🌸', ephemeral: true });
    }

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** gives **${user.username}** a big hug! 🤗`)
      .setImage(randomHug);

    await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
  },
};
