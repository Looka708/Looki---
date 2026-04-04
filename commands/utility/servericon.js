const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'servericon',
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('🏫 view the server\'s beautiful icon'),
  execute: async (interaction, client) => {
    const guild = interaction.guild;
    const iconUrl = guild.iconURL({ size: 1024, dynamic: true });

    if (!iconUrl) {
      const errorEmbed = createEmbed('error', client)
        .setDescription('this server doesn\'t have an icon yet! 🌸');
      return interaction.reply({ embeds: [errorEmbed] });
    }

    const embed = createEmbed('default', client)
      .setTitle(`🏫 ${guild.name}`)
      .setImage(iconUrl)
      .setDescription(`[download high-res](${iconUrl}) ✨`);

    await interaction.reply({ embeds: [embed] });
  },
};
