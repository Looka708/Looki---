const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getOrCreateConfig, updateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'automod',
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('🤖 Configure AutoMod system for your server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable AutoMod system')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable AutoMod system')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('settings')
        .setDescription('View AutoMod settings')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('antiswear')
        .setDescription('Toggle profanity filter')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable profanity filter')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('antispam')
        .setDescription('Toggle spam detection')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable spam detection')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('antilinks')
        .setDescription('Toggle suspicious link detection')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Enable link detection')
            .setRequired(true)
        )
    ),
  execute: async (interaction, client) => {
    try {
      const subcommand = interaction.options.getSubcommand();
      const config = await getOrCreateConfig(interaction.guildId);

      const embed = createEmbed('info', client)
        .setTitle('🤖 AutoMod System');

      switch (subcommand) {
        case 'enable':
          await updateConfig(interaction.guildId, { automod_enabled: true });
          embed
            .setDescription('✓ AutoMod system has been **enabled**')
            .addFields(
              { name: 'Features', value: '• Spam detection\n• Profanity filter\n• Link detection\n• Mass mention protection' }
            );
          break;

        case 'disable':
          await updateConfig(interaction.guildId, { automod_enabled: false });
          embed
            .setDescription('✗ AutoMod system has been **disabled**')
            .setColor('#FF6B6B');
          break;

        case 'settings':
          embed
            .setDescription('Current AutoMod Configuration')
            .addFields(
              { name: '✓ Status', value: config.automod_enabled ? '🟢 Enabled' : '🔴 Disabled' },
              { name: '💬 Profanity Filter', value: config.automod_antiswear ? '✓ Active' : '✗ Inactive' },
              { name: '📨 Spam Detection', value: config.automod_antispam ? '✓ Active' : '✗ Inactive' },
              { name: '🔗 Link Detection', value: config.automod_antilinks ? '✓ Active' : '✗ Inactive' },
              { name: '👥 Raid Protection', value: config.automod_antiraid ? '✓ Active' : '✗ Inactive' }
            );
          break;

        case 'antiswear':
          const antiswear = interaction.options.getBoolean('enabled');
          await updateConfig(interaction.guildId, { automod_antiswear: antiswear });
          embed
            .setDescription(`✓ Profanity filter has been **${antiswear ? 'enabled' : 'disabled'}**`)
            .addFields(
              { name: 'Action', value: antiswear ? 'Messages with profanity will be deleted' : 'Profanity will not be filtered' }
            );
          break;

        case 'antispam':
          const antispam = interaction.options.getBoolean('enabled');
          await updateConfig(interaction.guildId, { automod_antispam: antispam });
          embed
            .setDescription(`✓ Spam detection has been **${antispam ? 'enabled' : 'disabled'}**`)
            .addFields(
              { name: 'Threshold', value: 'More than 5 messages/minute = spam' },
              { name: 'Action', value: antispam ? 'Spam messages will be deleted' : 'Spam will not be detected' }
            );
          break;

        case 'antilinks':
          const antilinks = interaction.options.getBoolean('enabled');
          await updateConfig(interaction.guildId, { automod_antilinks: antilinks });
          embed
            .setDescription(`✓ Link detection has been **${antilinks ? 'enabled' : 'disabled'}**`)
            .addFields(
              { name: 'Targets', value: 'Suspicious shortened URLs and invite links' },
              { name: 'Action', value: antilinks ? 'Suspicious links will be deleted' : 'Links will not be filtered' }
            );
          break;
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('AutoMod error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error')
        .setDescription('Something went wrong configuring AutoMod.');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
