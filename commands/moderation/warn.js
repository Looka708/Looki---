const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'warn',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the warning').setMaxLength(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.deferReply();

    if (user.id === interaction.user.id) {
      return interaction.editReply({ embeds: [moderationError(client, 'Cannot warn yourself', 'Choose another user.')] });
    }
    if (user.id === client.user.id) {
      return interaction.editReply({ embeds: [moderationError(client, 'Cannot warn Looki', 'I cannot warn myself.')] });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.editReply({ embeds: [moderationError(client, 'User not found', 'That user is not in this server.')] });
    }

    try {
      const caseId = await getNextCaseId(interaction.guildId);
      await createWarning(interaction.guildId, user.id, reason, interaction.user.id, caseId, 'warn');

      const embed = createEmbed('moderation', client)
        .setTitle('Warning issued')
        .setDescription(`${user.tag} has been warned.`)
        .addFields(
          { name: 'User', value: `<@${user.id}>`, inline: true },
          { name: 'Case', value: `#${caseId}`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
        );

      await interaction.editReply({ embeds: [embed] });
      await sendModLog(interaction, client, 'Warning logged', [
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Case', value: `#${caseId}`, inline: true },
        { name: 'Reason', value: reason },
      ]);

      await user.send({
        embeds: [createEmbed('moderation', client)
          .setTitle('You received a warning')
          .setDescription(`You were warned in ${interaction.guild.name}.`)
          .addFields({ name: 'Reason', value: reason }, { name: 'Case', value: `#${caseId}` })],
      }).catch(() => null);
    } catch (error) {
      console.error('Warn command error:', error);
      return interaction.editReply({ embeds: [moderationError(client, 'Warning failed', `I could not create the warning:\n\`${error.message}\``)] });
    }
  },
};
