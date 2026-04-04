const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'unlock',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('🔓 unlock a previously locked channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('specific channel to unlock (defaults to current)')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('role to unlock (defaults to @everyone)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  execute: async (interaction, client) => {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const targetRole = interaction.options.getRole('role') || interaction.guild.roles.everyone;

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ content: 'I can only unlock text channels right now! 🌸', ephemeral: true });
    }

    try {
      await targetChannel.permissionOverwrites.edit(targetRole.id, {
        SendMessages: null,
      });

      const embed = createEmbed('success', client)
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`${targetChannel} is now unlocked for ${targetRole} ✨`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( check my permissions? 🎀');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
