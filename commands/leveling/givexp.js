const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { addXP } = require('../../models/XP');

module.exports = {
  name: 'givexp',
  data: new SlashCommandBuilder()
    .setName('givexp')
    .setDescription('📈 Give XP to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give XP to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of XP to give (1-100000)')
        .setMinValue(1)
        .setMaxValue(100000)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    try {
      const data = await addXP(interaction.guild.id, user.id, amount);

      const embed = createEmbed('success', client)
        .setTitle('📈 XP Granted')
        .setDescription(`Gave **${amount} XP** to ${user}! 🌸`)
        .addFields(
          { name: '✨ New Total', value: `\`${data.xp} XP\` (Level ${data.level})`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('Failed to grant XP :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
