const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { addXP, getOrCreateXP } = require('../../models/XP');

module.exports = {
  name: 'removexp',
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('Remove XP from a user')
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to take XP from')
      .setRequired(true))
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Amount of XP to remove')
      .setMinValue(1)
      .setMaxValue(100000)
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    await interaction.deferReply({ flags: 64 });

    try {
      const currentData = await getOrCreateXP(interaction.guild.id, user.id);
      const amountToRemove = Math.min(currentData.xp || 0, amount);
      const data = await addXP(interaction.guild.id, user.id, -amountToRemove);

      return interaction.editReply({
        embeds: [createEmbed('moderation', client)
          .setTitle('XP Removed')
          .setDescription(`Removed **${amountToRemove} XP** from ${user}.`)
          .addFields({ name: 'New Total', value: `\`${data.xp} XP\` (Level ${data.level})`, inline: true })],
      });
    } catch (error) {
      console.error('Removexp command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('XP Failed')
          .setDescription('I could not remove XP right now.')],
      });
    }
  },
};
