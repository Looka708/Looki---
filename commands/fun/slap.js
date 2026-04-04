const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const slaps = [
  'https://media.giphy.com/media/RXGNsyRb1hDJm/giphy.gif',
  'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
  'https://media.giphy.com/media/tX29X2Dx3sAXS/giphy.gif',
  'https://media.giphy.com/media/xUNd9HZq1itMkiK652/giphy.gif',
  'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/m6nOLv3hD2396/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/686n96UPhF8A/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/P8X4hvSfs3mms/giphy.gif',
  'https://media.giphy.com/media/1082yS2HMbLMSQ/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Y6S0I7bR7Hsc0/giphy.gif'
];

module.exports = {
  name: 'slap',
  data: new SlashCommandBuilder()
    .setName('slap')
    .setDescription('💢 give someone a playful slap')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the user to slap')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const randomSlap = slaps[Math.floor(Math.random() * slaps.length)];

    if (user.id === interaction.user.id) {
       return interaction.reply({ content: 'why would you slap yourself bestie! no! 🌸', ephemeral: true });
    }

    if (user.id === client.user.id) {
       return interaction.reply({ content: 'you can\'t slap me! i\'m too cute! 🎀', ephemeral: true });
    }

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** playfully slaps **${user.username}**! 💢`)
      .setImage(randomSlap);

    await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
  },
};
