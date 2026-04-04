const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const cries = [
  'https://media.giphy.com/media/ROF8OQvDsvvNu/giphy.gif',
  'https://media.giphy.com/media/L95W4wv8n4qze/giphy.gif',
  'https://media.giphy.com/media/2rtQMJvhzOnRe/giphy.gif',
  'https://media.giphy.com/media/m3864rBwwBToc/giphy.gif',
  'https://media.giphy.com/media/qQdL532ZANbjy/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/M28rUlcjueK9a/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/8pUfQ05O7g5p9p73rZ/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/6Q3MAnEAXigU3/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/7SF5scGB2AFrO/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Z77mPxl2Gis80/giphy.gif'
];

module.exports = {
  name: 'cry',
  data: new SlashCommandBuilder()
    .setName('cry')
    .setDescription('😢 let out some tears'),
  execute: async (interaction, client) => {
    const randomCry = cries[Math.floor(Math.random() * cries.length)];

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** is crying... there there! 🌸`)
      .setImage(randomCry);

    await interaction.reply({ embeds: [embed] });
  },
};
