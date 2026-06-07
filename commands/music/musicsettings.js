const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { createMusicEmbed } = require('../../utils/musicEmbed');

const LOOP_NAMES = ['Off', 'Track', 'Queue'];

module.exports = {
  name: 'musicsettings',
  data: new SlashCommandBuilder()
    .setName('musicsettings')
    .setDescription('View or change server music settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName('view')
      .setDescription('View current music settings'))
    .addSubcommand(sub => sub
      .setName('volume')
      .setDescription('Set the default player volume')
      .addIntegerOption(option => option
        .setName('amount')
        .setDescription('Default volume percentage')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('djrole')
      .setDescription('Set the role allowed to control music')
      .addRoleOption(option => option
        .setName('role')
        .setDescription('DJ role')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('cleardj')
      .setDescription('Remove the configured DJ role'))
    .addSubcommand(sub => sub
      .setName('announcements')
      .setDescription('Enable or disable Now Playing announcements')
      .addBooleanOption(option => option
        .setName('enabled')
        .setDescription('Whether Now Playing messages are enabled')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('loopdefault')
      .setDescription('Set the loop mode for new music sessions')
      .addIntegerOption(option => option
        .setName('mode')
        .setDescription('Default loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 0 },
          { name: 'Track', value: 1 },
          { name: 'Queue', value: 2 },
        )))
    .addSubcommand(sub => sub
      .setName('textchannel')
      .setDescription('Set the channel used for music announcements')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Music text channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('cleartextchannel')
      .setDescription('Use the channel where each music session starts')),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });
    const subcommand = interaction.options.getSubcommand();

    try {
      const settings = await ServerMusicSettings.getSettings(interaction.guildId);
      if (!settings) throw new Error('Music settings are unavailable');

      if (subcommand === 'view') {
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Music Settings',
            description: 'Current server-wide music behavior.',
          }).addFields(
            { name: 'Default volume', value: `${settings.default_volume ?? 50}%`, inline: true },
            { name: 'DJ role', value: settings.dj_role_id ? `<@&${settings.dj_role_id}>` : 'Not set', inline: true },
            { name: 'Announcements', value: settings.announce_songs ? 'Enabled' : 'Disabled', inline: true },
            { name: 'Default loop', value: LOOP_NAMES[settings.loop_default_mode || 0], inline: true },
            { name: '24/7 mode', value: settings.stay_247 ? 'Enabled' : 'Disabled', inline: true },
            { name: 'Music channel', value: settings.music_text_channel_id ? `<#${settings.music_text_channel_id}>` : 'Current command channel', inline: true },
          )],
        });
      }

      if (subcommand === 'volume') {
        const amount = interaction.options.getInteger('amount', true);
        await ServerMusicSettings.setDefaultVolume(interaction.guildId, amount);
        const player = client.kazagumo.players.get(interaction.guildId);
        if (player) player.setVolume(amount);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Default volume updated',
            description: `New and active sessions will use **${amount}%** volume.`,
          })],
        });
      }

      if (subcommand === 'djrole') {
        const role = interaction.options.getRole('role', true);
        await ServerMusicSettings.setDJRole(interaction.guildId, role.id);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'DJ role updated',
            description: `${role} can now control protected music actions.`,
          })],
        });
      }

      if (subcommand === 'cleardj') {
        await ServerMusicSettings.setDJRole(interaction.guildId, null);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'DJ role removed',
            description: 'Music control now uses requester and moderator permissions only.',
          })],
        });
      }

      if (subcommand === 'announcements') {
        const enabled = interaction.options.getBoolean('enabled', true);
        await ServerMusicSettings.setAnnouncements(interaction.guildId, enabled);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Announcements updated',
            description: `Now Playing messages are now **${enabled ? 'enabled' : 'disabled'}**.`,
          })],
        });
      }

      if (subcommand === 'loopdefault') {
        const mode = interaction.options.getInteger('mode', true);
        await ServerMusicSettings.setLoopDefault(interaction.guildId, mode);
        const player = client.kazagumo.players.get(interaction.guildId);
        if (player) player.setLoop(['none', 'track', 'queue'][mode]);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Default loop updated',
            description: `New and active music sessions now use loop mode **${LOOP_NAMES[mode]}**.`,
          })],
        });
      }

      if (subcommand === 'cleartextchannel') {
        await ServerMusicSettings.setMusicTextChannel(interaction.guildId, null);
        const player = client.kazagumo.players.get(interaction.guildId);
        if (player) player.textId = interaction.channelId;
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Music channel reset',
            description: 'Announcements will use the channel where the music session starts.',
          })],
        });
      }

      const channel = interaction.options.getChannel('channel', true);
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(PermissionFlagsBits.ViewChannel)
        || !permissions?.has(PermissionFlagsBits.SendMessages)
        || !permissions?.has(PermissionFlagsBits.EmbedLinks)) {
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            type: 'error',
            title: 'Cannot use that channel',
            description: `I need **View Channel**, **Send Messages**, and **Embed Links** in ${channel}.`,
          })],
        });
      }

      await ServerMusicSettings.setMusicTextChannel(interaction.guildId, channel.id);
      const player = client.kazagumo.players.get(interaction.guildId);
      if (player) player.textId = channel.id;
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: 'Music channel updated',
          description: `Now Playing announcements will use ${channel}.`,
        })],
      });
    } catch (error) {
      console.error('Musicsettings command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Music settings failed',
          description: 'I could not update the music settings.',
        })],
      });
    }
  },
};
