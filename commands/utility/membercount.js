const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'membercount',
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('👥 view the current member count'),
  execute: async (interaction, client) => {
    const guild = interaction.guild;

    const embed = createEmbed('default', client)
      .setTitle('👥 Member Count')
      .setDescription(`There are currently \`${guild.memberCount}\` cuties in **${guild.name}**! 🌸`);

    await interaction.reply({ embeds: [embed] });
  },
};
