const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { addXP, getOrCreateXP } = require('../../models/XP');

module.exports = {
  name: 'removexp',
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('📉 Remove XP from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to take XP from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of XP to remove (1-100000)')
        .setMinValue(1)
        .setMaxValue(100000)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    try {
      const currentData = await getOrCreateXP(interaction.guild.id, user.id);
      
      // Make sure we don't go below 0
      const amountToRemove = currentData.xp < amount ? currentData.xp : amount;
      
      const data = await addXP(interaction.guild.id, user.id, -amountToRemove);

      const embed = createEmbed('moderation', client)
        .setTitle('📉 XP Removed')
        .setDescription(`Removed **${amountToRemove} XP** from ${user}! 🎀`)
        .addFields(
          { name: '✨ New Total', value: `\`${data.xp} XP\` (Level ${data.level})`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('Failed to remove XP :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
