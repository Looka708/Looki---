const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const highfives = [
  'https://media.giphy.com/media/l41YtzJvVlK4RnsMo/giphy.gif',
  'https://media.giphy.com/media/s2qXK8wAvkHTO/giphy.gif',
  'https://media.giphy.com/media/Vz58J8shFW6BvqnYTm/giphy.gif',
  'https://media.giphy.com/media/UvPLmK0wKKhH2/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/9pGo7stAsu9sAcS1pZ/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/pHb82xtBPfqEg/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/I9mG9UXGk99n2/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26gsjCZpPolPr3sBy/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0ExghDSRLoJqcS5y/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/xT9IgvEOZ2YI88pLPy/giphy.gif'
];

module.exports = {
  name: 'highfive',
  data: new SlashCommandBuilder()
    .setName('highfive')
    .setDescription('🙌 give someone a huge high five')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the bestie to high-five')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const randomHighfive = highfives[Math.floor(Math.random() * highfives.length)];

    if (user.id === interaction.user.id) {
       return interaction.reply({ content: 'high-fiving yourself? ok sure 🙌', ephemeral: true });
    }

    const embed = createEmbed('default', client)
      .setDescription(`**${interaction.user.username}** gives **${user.username}** a massive high-five! 🙌`)
      .setImage(randomHighfive);

    await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
  },
};
