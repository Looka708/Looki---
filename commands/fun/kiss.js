const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const kisses = [
  'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
  'https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif',
  'https://media.giphy.com/media/hnNyVPIXgALV6/giphy.gif',
  'https://media.giphy.com/media/QGc8RgRvMonFm/giphy.gif',
  'https://media.giphy.com/media/W3CJjnkZihqOQ/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y1bXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/12V5fmTj0tDqH6/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/bmU7uLxG80Q5a/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/oH2V455f5I384/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/jR22gdcPiOLaE/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/vR06hAmS7YmUo/giphy.gif'
];

module.exports = {
  name: 'kiss',
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('💋 give someone a sweet kiss')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the cutie to kiss')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const randomKiss = kisses[Math.floor(Math.random() * kisses.length)];

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: 'you can\'t kiss yourself bestie! 🌸', ephemeral: true });
    }

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** gives **${user.username}** a sweet kiss! 💕`)
      .setImage(randomKiss);

    await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
  },
};
