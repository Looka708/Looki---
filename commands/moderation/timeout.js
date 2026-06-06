const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');
const { createWarning, getNextCaseId } = require('../../models/Warning');

module.exports = {
  name: 'timeout',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Temporarily timeout a user')
    .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration, like 10m, 1h, or 1d').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the timeout').setMaxLength(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const durationMs = parseDuration(durationInput);
    await interaction.deferReply();

    if (!durationMs || durationMs < 1000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.editReply({ embeds: [moderationError(client, 'Invalid duration', 'Duration must be between `1s` and `28d`.')] });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.editReply({ embeds: [moderationError(client, 'User not found', 'That user is not in this server.')] });
    if (user.id === interaction.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot timeout yourself', 'Choose another user.')] });
    if (user.id === client.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot timeout Looki', 'I cannot timeout myself.')] });
    if (!member.moderatable) return interaction.editReply({ embeds: [moderationError(client, 'Cannot timeout user', 'That user may have a higher role than me.')] });

    try {
      await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);
      let caseId = null;
      try {
        caseId = await getNextCaseId(interaction.guildId);
        await createWarning(interaction.guildId, user.id, reason, interaction.user.id, caseId, 'mute', durationMs);
      } catch (logError) {
        console.error('[Timeout] Action succeeded but case logging failed:', logError);
      }
      const until = Math.floor((Date.now() + durationMs) / 1000);
      const embed = createEmbed('moderation', client)
        .setTitle('Timeout issued')
        .setDescription(`${user} has been timed out.`)
        .addFields(
          { name: 'Duration', value: `\`${durationInput}\``, inline: true },
          { name: 'Ends', value: `<t:${until}:R>`, inline: true },
          { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
        );

      await interaction.editReply({ embeds: [embed] });
      await sendModLog(interaction, client, 'Timeout logged', [
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
        { name: 'Ends', value: `<t:${until}:F>`, inline: true },
        { name: 'Reason', value: reason },
      ]);
      await user.send({ embeds: [createEmbed('moderation', client).setTitle('You were timed out').setDescription(`You were timed out in ${interaction.guild.name}.`).addFields({ name: 'Duration', value: durationInput }, { name: 'Reason', value: reason })] }).catch(() => null);
    } catch (error) {
      console.error('Timeout command error:', error);
      return interaction.editReply({ embeds: [moderationError(client, 'Timeout failed', `Discord rejected the action:\n\`${error.message}\``)] });
    }
  },
};
