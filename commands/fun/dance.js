const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const dances = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/v0z6ST7vX7g6Q/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/BMMzT4W7hZ6X6/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Vn83SOnFvU6yY/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/5S4IdkvvB7i4M/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/v0z6ST7vX7g6Q/giphy.gif'
];

module.exports = {
  name: 'dance',
  data: new SlashCommandBuilder()
    .setName('dance')
    .setDescription('💃 show off your best pookie moves'),
  execute: async (interaction, client) => {
    const randomDance = dances[Math.floor(Math.random() * dances.length)];

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** is dancing! 💃✨`)
      .setImage(randomDance);

    await interaction.reply({ embeds: [embed] });
  },
};
