const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'lock',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('🔒 lock a channel so no one can chat')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('specific channel to lock (defaults to current)')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('role to lock (defaults to @everyone)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  execute: async (interaction, client) => {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const targetRole = interaction.options.getRole('role') || interaction.guild.roles.everyone;

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ content: 'I can only lock text channels right now! 🌸', ephemeral: true });
    }

    try {
      await targetChannel.permissionOverwrites.edit(targetRole.id, {
        SendMessages: false,
      });

      const embed = createEmbed('moderation', client)
        .setTitle('🔒 Channel Locked')
        .setDescription(`${targetChannel} is now locked for ${targetRole} ✨`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( check my permissions? 🎀');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
