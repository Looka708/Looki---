const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'roleinfo',
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('🏷️ get detailed info about a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('the role you want to inspect details about')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const role = interaction.options.getRole('role');

    const embed = createEmbed('default', client)
      .setTitle(`🏷️ Role Info: ${role.name}`)
      .setColor(role.color || '#E85D75') // Optional visual flair to match their color
      .addFields(
        { name: '🆔 ID', value: `\`${role.id}\``, inline: true },
        { name: '🎨 Hex Color', value: `\`${role.hexColor}\``, inline: true },
        { name: '👥 Members', value: `\`${role.members.size}\``, inline: true },
        { name: '✨ Mentionable?', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '🛡️ Hoisted?', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
