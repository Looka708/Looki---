const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { addXP } = require('../../models/XP');

module.exports = {
  name: 'givexp',
  data: new SlashCommandBuilder()
    .setName('givexp')
    .setDescription('Give XP to a user')
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to give XP to')
      .setRequired(true))
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Amount of XP to give')
      .setMinValue(1)
      .setMaxValue(100000)
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    await interaction.deferReply({ flags: 64 });

    try {
      const data = await addXP(interaction.guild.id, user.id, amount);

      return interaction.editReply({
        embeds: [createEmbed('success', client)
          .setTitle('XP Granted')
          .setDescription(`Gave **${amount} XP** to ${user}.`)
          .addFields({ name: 'New Total', value: `\`${data.xp} XP\` (Level ${data.level})`, inline: true })],
      });
    } catch (error) {
      console.error('Givexp command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('XP Failed')
          .setDescription('I could not grant XP right now.')],
      });
    }
  },
};
