const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { safeJoin } = require('../../utils/audioPlayer');
const { createMusicEmbed } = require('../../utils/musicEmbed');

module.exports = {
  name: '247',
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('Keep Looki connected to a voice channel 24/7')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand
      .setName('enable')
      .setDescription('Keep Looki in a voice channel')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Voice channel to stay in')
        .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)))
    .addSubcommand(subcommand => subcommand
      .setName('disable')
      .setDescription('Disable 24/7 voice mode and disconnect'))
    .addSubcommand(subcommand => subcommand
      .setName('status')
      .setDescription('Show the current 24/7 voice status')),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'enable') {
        const voiceChannel = interaction.options.getChannel('channel')
          || interaction.member?.voice?.channel;

        if (!voiceChannel?.isVoiceBased()) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Choose a voice channel',
              description: 'Join a voice channel or provide one with the `channel` option.',
            })],
          });
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions?.has(PermissionFlagsBits.Connect)
          || !permissions?.has(PermissionFlagsBits.Speak)) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Cannot join that channel',
              description: `I need **Connect** and **Speak** permissions in ${voiceChannel}.`,
            })],
          });
        }

        let player = client.kazagumo.players.get(interaction.guildId);
        if (player?.voiceId && player.voiceId !== voiceChannel.id
          && (player.queue.current || player.queue.length || player.playing)) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Music is already active',
              description: 'Stop the current session before moving 24/7 mode to another voice channel.',
            })],
          });
        }

        if (!player || player.voiceId !== voiceChannel.id) {
          player = await safeJoin(
            client.kazagumo,
            interaction.guildId,
            voiceChannel.id,
            interaction.guild.shardId,
          );
        }
        player.textId = interaction.channelId;
        player.data.set('stay247', true);

        await ServerMusicSettings.set247Mode(
          interaction.guildId,
          true,
          voiceChannel.id,
          interaction.channelId,
        );

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: '24/7 mode enabled',
            description: `I will stay connected to ${voiceChannel}, even when the queue is empty.`,
            footer: 'This connection will be restored after a restart',
          }).addFields(
            { name: 'Voice channel', value: voiceChannel.name, inline: true },
            { name: 'Enabled by', value: interaction.user.username, inline: true },
          )],
        });
      }

      if (subcommand === 'disable') {
        await ServerMusicSettings.set247Mode(interaction.guildId, false);
        const player = client.kazagumo.players.get(interaction.guildId);
        if (player) {
          player.data.set('stay247', false);
          await player.destroy();
        }

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: '24/7 mode disabled',
            description: 'I disconnected and will no longer rejoin after restarts.',
          })],
        });
      }

      const settings = await ServerMusicSettings.getSettings(interaction.guildId);
      const voiceChannel = settings?.music_channel_id
        ? interaction.guild.channels.cache.get(settings.music_channel_id)
        : null;

      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: '24/7 Voice Status',
          description: settings?.stay_247
            ? `**Enabled** in ${voiceChannel || 'a saved voice channel'}`
            : '**Disabled**',
          footer: settings?.stay_247
            ? 'Looki remains connected while the queue is empty'
            : 'Use /247 enable to keep Looki connected',
        })],
      });
    } catch (error) {
      console.error('24/7 command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Could not update 24/7 mode',
          description: `\`${error.message}\``,
        })],
      });
    }
  },
};
