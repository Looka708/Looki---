const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'kick',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the kick').setMaxLength(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.deferReply();

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.editReply({ embeds: [moderationError(client, 'User not found', 'That user is not in this server.')] });
    if (user.id === interaction.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot kick yourself', 'Choose another user.')] });
    if (user.id === client.user.id) return interaction.editReply({ embeds: [moderationError(client, 'Cannot kick Looki', 'I cannot kick myself.')] });
    if (!member.kickable) return interaction.editReply({ embeds: [moderationError(client, 'Cannot kick user', 'That user may have a higher role than me.')] });

    try {
      await member.kick(`${interaction.user.tag}: ${reason}`);
      let caseId = null;
      try {
        caseId = await getNextCaseId(interaction.guildId);
        await createWarning(interaction.guildId, user.id, reason, interaction.user.id, caseId, 'kick');
      } catch (logError) {
        console.error('[Kick] Action succeeded but case logging failed:', logError);
      }

      const embed = createEmbed('moderation', client)
        .setTitle('User kicked')
        .setDescription(`${user.tag} has been kicked.`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'User', value: `<@${user.id}>`, inline: true },
          { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
        );

      await interaction.editReply({ embeds: [embed] });
      await sendModLog(interaction, client, 'Kick logged', [
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Case', value: caseId ? `#${caseId}` : 'Not recorded', inline: true },
        { name: 'Reason', value: reason },
      ]);

      const dm = new EmbedBuilder()
        .setColor(0xF4A261)
        .setTitle('You were kicked')
        .setDescription(`You were kicked from ${interaction.guild.name}.`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();
      await user.send({ embeds: [dm] }).catch(() => null);
    } catch (error) {
      console.error('Kick command error:', error);
      return interaction.editReply({ embeds: [moderationError(client, 'Kick failed', `Discord rejected the action:\n\`${error.message}\``)] });
    }
  },
};
