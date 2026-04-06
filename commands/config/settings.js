const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'settings',
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('✨ View and manage bot settings')
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
      .setTitle('✨ Server Settings');

    switch (subcommand) {
      case 'view':
        const { getOrCreateConfig } = require('../../models/ServerConfig');
        const currentConfig = await getOrCreateConfig(interaction.guildId);
        
        embed
          .setDescription('Current Server Configuration')
          .addFields(
            { name: '🎯 Prefix', value: `\`${currentConfig.prefix || 'p!'}\``, inline: true },
            { name: '📋 Modlog Channel', value: currentConfig.modlog_channel ? `<#${currentConfig.modlog_channel}>` : '`Not Set`', inline: true },
            { name: '👋 Welcome Channel', value: currentConfig.welcome_channel ? `<#${currentConfig.welcome_channel}>` : '`Not Set`', inline: true },
            { name: '🎀 XP System', value: 'Enabled', inline: true },
            { name: '🤖 AutoMod', value: currentConfig.automod_enabled ? 'Enabled' : 'Disabled', inline: true },
            { name: '🎀 Music', value: 'Enabled', inline: true }
          );
        break;

      case 'prefix':
        const newPrefix = interaction.options.getString('prefix');
        if (newPrefix.length > 5) {
          return interaction.reply({ 
            content: '🥺 Prefix must be 5 characters or less!', 
            ephemeral: true 
          });
        }
        
        const { setConfigValue } = require('../../models/ServerConfig');
        await setConfigValue(interaction.guildId, 'prefix', newPrefix);

        embed
          .setDescription(`✓ Prefix changed to \`${newPrefix}\``)
          .addFields(
            { name: 'Example', value: `Use \`${newPrefix}ping\` for commands` }
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
