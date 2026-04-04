const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const pats = [
  'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
  'https://media.giphy.com/media/109OqaoamDwwXEQ/giphy.gif',
  'https://media.giphy.com/media/108M7gCS1JSoO4/giphy.gif',
  'https://media.giphy.com/media/3o85xoi6nNqJQJ95Qc/giphy.gif',
  'https://media.giphy.com/media/Ye3c10H0R5sQM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/ARSp9T7wwxNcs/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/v8Mskn92Ycll6/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/CL3fgeV298it2/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/H8X7pLqyK8aIM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/osYazL5nq77dC/giphy.gif'
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
