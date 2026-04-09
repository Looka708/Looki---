const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const reactionGifs = require('../../utils/reactionGifs');

module.exports = {
  name: 'blush',
  data: new SlashCommandBuilder()
    .setName('blush')
    .setDescription('😊 you\'re making me blush!'),
  execute: async (interaction, client) => {
    try {
      const randomBlush = reactionGifs.getRandomGif('blush');

      const embed = createEmbed('default', client)
        .setDescription(`**${interaction.user.username}** is blushing! how cute~ 🌸`)
        .setImage(randomBlush);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('❌ [blush.js] Error:', error);
      await interaction.reply({ content: '❌ Failed to load blush gif', ephemeral: true }).catch(() => {});
    }
  },
};
