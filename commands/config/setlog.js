const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { updateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'setlog',
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the moderation log channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel for mod logs')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction, client) => {
    const channel = interaction.options.getChannel('channel');

    try {
      await updateConfig(interaction.guild.id, { modlog_channel: channel.id });

      const embed = createEmbed('success', client)
        .setTitle('✅ Modlog Channel Set')
        .setDescription(`Moderation logs will now post to ${channel}`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error')
        .setDescription('hmm that didn\'t work :( try again?');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};