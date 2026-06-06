const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getOrCreateConfig, setConfigValue } = require('../../models/ServerConfig');

module.exports = {
  name: 'settings',
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View and manage bot settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand
      .setName('view')
      .setDescription('View current server settings'))
    .addSubcommand(subcommand => subcommand
      .setName('prefix')
      .setDescription('Change command prefix')
      .addStringOption(option => option
        .setName('prefix')
        .setDescription('New prefix, 1-5 characters')
        .setRequired(true)
        .setMaxLength(5)))
    .addSubcommand(subcommand => subcommand
      .setName('modlog')
      .setDescription('Set moderation log channel')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Channel for mod logs')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('welcome')
      .setDescription('Configure welcome messages')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Welcome message channel')
        .setRequired(true))),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });
    const subcommand = interaction.options.getSubcommand();

    try {
      const embed = createEmbed('info', client).setTitle('Server Settings');

      if (subcommand === 'view') {
        const currentConfig = await getOrCreateConfig(interaction.guildId);
        embed
          .setDescription('Current server configuration')
          .addFields(
            { name: 'Prefix', value: `\`${currentConfig.prefix || 'p!'}\``, inline: true },
            { name: 'Modlog Channel', value: currentConfig.modlog_channel ? `<#${currentConfig.modlog_channel}>` : '`Not Set`', inline: true },
            { name: 'Welcome Channel', value: currentConfig.welcome_channel ? `<#${currentConfig.welcome_channel}>` : '`Not Set`', inline: true },
            { name: 'XP System', value: 'Enabled', inline: true },
            { name: 'AutoMod', value: currentConfig.automod_enabled ? 'Enabled' : 'Disabled', inline: true },
            { name: 'Music', value: 'Enabled', inline: true },
          );
      }

      if (subcommand === 'prefix') {
        const newPrefix = interaction.options.getString('prefix', true).trim();
        if (!newPrefix) {
          return interaction.editReply({
            embeds: [createEmbed('error', client)
              .setTitle('Invalid Prefix')
              .setDescription('Prefix cannot be empty.')],
          });
        }

        await setConfigValue(interaction.guildId, 'prefix', newPrefix);
        embed
          .setDescription(`Prefix changed to \`${newPrefix}\`.`)
          .addFields({ name: 'Example', value: `Use \`${newPrefix}ping\` for prefix commands.` });
      }

      if (subcommand === 'modlog') {
        const modlogChannel = interaction.options.getChannel('channel', true);
        await setConfigValue(interaction.guildId, 'modlog_channel', modlogChannel.id);
        embed
          .setDescription(`Modlog channel set to ${modlogChannel}.`)
          .addFields({ name: 'Info', value: 'Moderation actions will be logged there.' });
      }

      if (subcommand === 'welcome') {
        const welcomeChannel = interaction.options.getChannel('channel', true);
        await setConfigValue(interaction.guildId, 'welcome_channel', welcomeChannel.id);
        embed
          .setDescription(`Welcome channel set to ${welcomeChannel}.`)
          .addFields({ name: 'Info', value: 'New member welcomes will use that channel.' });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Settings command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('Settings Failed')
          .setDescription('I could not update the server settings.')],
      });
    }
  },
};
