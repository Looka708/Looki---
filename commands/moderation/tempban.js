const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const TemporaryBan = require('../../models/TemporaryBan');
const { getNextCaseId } = require('../../models/Warning');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'tempban',
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user from the server')
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration, like 1d or 1w').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setMaxLength(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const durationMs = parseDuration(durationInput);
    await interaction.deferReply();

    if (user.id === interaction.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban yourself', 'Choose another user.')] });
    if (user.id === client.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban Looki', 'I cannot ban myself.')] });
    if (!durationMs || durationMs < 1000) return interaction.editReply({ embeds: [moderationError(client, 'Invalid duration', 'Try a duration like `1d` or `1w`.')] });

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban user', 'That user may have a higher role than me.')] });

    const endTime = new Date(Date.now() + durationMs);
    const endTimestamp = Math.floor(endTime.getTime() / 1000);

    try {
      const caseId = await getNextCaseId(interaction.guildId);
      await user.send({
        embeds: [createEmbed('moderation', client)
          .setTitle('You were temporarily banned')
          .setDescription(`You were temporarily banned from ${interaction.guild.name}.`)
          .addFields(
            { name: 'Duration', value: durationInput, inline: true },
            { name: 'Unban time', value: `<t:${endTimestamp}:F>`, inline: true },
            { name: 'Reason', value: reason },
          )],
      }).catch(() => null);

      await interaction.guild.members.ban(user.id, { reason: `Tempban by ${interaction.user.tag}: ${reason}` });
      try {
        await TemporaryBan.createTempBan(
          interaction.guildId,
          user.id,
          endTime,
          reason,
          interaction.user.id,
          caseId,
        );
      } catch (persistenceError) {
        await interaction.guild.members.unban(
          user.id,
          'Temporary ban storage failed; action rolled back',
        ).catch(rollbackError => {
          console.error('[TempBan] Failed to roll back ban:', rollbackError);
        });
        throw new Error('The temporary ban could not be scheduled, so the ban was rolled back.');
      }

      const embed = createEmbed('moderation', client)
        .setTitle('Temporary ban issued')
        .setDescription(`${user.tag} has been banned until <t:${endTimestamp}:F>.`)
        .addFields(
          { name: 'Duration', value: durationInput, inline: true },
          { name: 'Unban', value: `<t:${endTimestamp}:R>`, inline: true },
          { name: 'Case', value: `#${caseId}`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
        );

      await interaction.editReply({ embeds: [embed] });
      await sendModLog(interaction, client, 'Temporary ban logged', [
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Case', value: `#${caseId}`, inline: true },
        { name: 'Unban', value: `<t:${endTimestamp}:F>`, inline: true },
        { name: 'Reason', value: reason },
      ]);
    } catch (error) {
      console.error('Tempban command error:', error);
      return interaction.editReply({ embeds: [moderationError(client, 'Tempban failed', `Discord rejected the action:\n\`${error.message}\``)] });
    }
  },
};
