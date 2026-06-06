const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'unlock',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a text channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to unlock'))
    .addRoleOption(option => option.setName('role').setDescription('Role to unlock, defaults to @everyone'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const role = interaction.options.getRole('role') || interaction.guild.roles.everyone;

    if (!channel.isTextBased()) return interaction.reply({ embeds: [moderationError(client, 'Text channel required', 'I can only unlock text-based channels.')], flags: 64 });

    try {
      await channel.permissionOverwrites.edit(role.id, { SendMessages: null }, { reason: `Unlocked by ${interaction.user.tag}` });
      await interaction.reply({ embeds: [createEmbed('success', client).setTitle('Channel unlocked').setDescription(`${channel} is now unlocked for ${role}.`)] });
      await sendModLog(interaction, client, 'Channel unlocked', [
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
      ]);
      return null;
    } catch (error) {
      console.error('Unlock command error:', error);
      return interaction.reply({ embeds: [moderationError(client, 'Unlock failed', `Check my channel permissions:\n\`${error.message}\``)], flags: 64 });
    }
  },
};
