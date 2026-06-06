const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { updateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'setlog',
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the moderation log channel')
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('The channel for mod logs')
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel', true);
    await interaction.deferReply({ flags: 64 });

    try {
      await updateConfig(interaction.guild.id, { modlog_channel: channel.id });

      return interaction.editReply({
        embeds: [createEmbed('success', client)
          .setTitle('Modlog Channel Set')
          .setDescription(`Moderation logs will now post to ${channel}.`)],
      });
    } catch (error) {
      console.error('Setlog command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('Setlog Failed')
          .setDescription('I could not update the moderation log channel.')],
      });
    }
  },
};
