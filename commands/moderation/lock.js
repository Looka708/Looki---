const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'lock',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a text channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to lock'))
    .addRoleOption(option => option.setName('role').setDescription('Role to lock, defaults to @everyone'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const role = interaction.options.getRole('role') || interaction.guild.roles.everyone;

    if (!channel.isTextBased()) return interaction.reply({ embeds: [moderationError(client, 'Text channel required', 'I can only lock text-based channels.')], flags: 64 });

    try {
      await channel.permissionOverwrites.edit(role.id, { SendMessages: false }, { reason: `Locked by ${interaction.user.tag}` });
      await interaction.reply({ embeds: [createEmbed('moderation', client).setTitle('Channel locked').setDescription(`${channel} is now locked for ${role}.`)] });
      await sendModLog(interaction, client, 'Channel locked', [
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
      ]);
      return null;
    } catch (error) {
      console.error('Lock command error:', error);
      return interaction.reply({ embeds: [moderationError(client, 'Lock failed', `Check my channel permissions:\n\`${error.message}\``)], flags: 64 });
    }
  },
};
