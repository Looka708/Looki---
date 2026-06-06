const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'ban',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setMaxLength(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.deferReply();

    if (user.id === interaction.user.id) {
      return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban yourself', 'Choose another user.')] });
    }
    if (user.id === client.user.id) {
      return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban Looki', 'I cannot ban myself.')] });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.editReply({ embeds: [moderationError(client, 'Cannot ban user', 'That user may have a higher role than me.')] });
    }

    try {
      await interaction.guild.members.ban(user.id, { reason: `${interaction.user.tag}: ${reason}` });
      let caseId = null;
      try {
        caseId = await getNextCaseId(interaction.guildId);
        await createWarning(interaction.guildId, user.id, reason, interaction.user.id, caseId, 'ban');
      } catch (logError) {
        console.error('[Ban] Action succeeded but case logging failed:', logError);
      }

      const embed = createEmbed('moderation', client)
        .setTitle('User banned')
        .setDescription(`${user.tag} has been banned.`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'User', value: `<@${user.id}>`, inline: true },
          { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
        );

      await interaction.editReply({ embeds: [embed] });
      await sendModLog(interaction, client, 'Ban logged', [
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
        { name: 'Reason', value: reason },
      ]);

      const dm = new EmbedBuilder()
        .setColor(0xED6A8A)
        .setTitle('You were banned')
        .setDescription(`You were banned from ${interaction.guild.name}.`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();
      await user.send({ embeds: [dm] }).catch(() => null);
    } catch (error) {
      console.error('Ban command error:', error);
      return interaction.editReply({ embeds: [moderationError(client, 'Ban failed', `Discord rejected the action:\n\`${error.message}\``)] });
    }
  },
};
