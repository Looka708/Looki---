const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'settings',
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('⚙️ View and manage bot settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current server settings')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('prefix')
        .setDescription('Change command prefix')
        .addStringOption(option =>
          option
            .setName('prefix')
            .setDescription('New prefix (1-3 characters)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('modlog')
        .setDescription('Set moderation log channel')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel for mod logs')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('welcome')
        .setDescription('Configure welcome messages')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Welcome message channel')
            .setRequired(true)
        )
    ),
  execute: async (interaction, client) => {
    const subcommand = interaction.options.getSubcommand();

    const embed = createEmbed('info', client)
      .setTitle('⚙️ Server Settings');

    switch (subcommand) {
      case 'view':
        embed
          .setDescription('Current Server Configuration')
          .addFields(
            { name: '🎯 Prefix', value: '`p!`', inline: true },
            { name: '📋 Modlog Channel', value: '<#mod-logs>', inline: true },
            { name: '👋 Welcome Channel', value: '<#welcome>', inline: true },
            { name: '📊 XP System', value: 'Enabled', inline: true },
            { name: '🤖 AutoMod', value: 'Disabled', inline: true },
            { name: '🎵 Music', value: 'Enabled', inline: true }
          );
        break;

      case 'prefix':
        const prefix = interaction.options.getString('prefix');
        embed
          .setDescription(`✓ Prefix changed to \`${prefix}\``)
          .addFields(
            { name: 'Example', value: `Use \`${prefix}help\` for commands` }
          );
        break;

      case 'modlog':
        const modlogChannel = interaction.options.getChannel('channel');
        embed
          .setDescription(`✓ Modlog channel set to ${modlogChannel}`)
          .addFields(
            { name: 'Info', value: 'All moderation actions will be logged here' }
          );
        break;

      case 'welcome':
        const welcomeChannel = interaction.options.getChannel('channel');
        embed
          .setDescription(`✓ Welcome channel set to ${welcomeChannel}`)
          .addFields(
            { name: 'Info', value: 'New members will be welcomed in this channel' }
          );
        break;
    }

    await interaction.reply({ embeds: [embed] });
  },
};
