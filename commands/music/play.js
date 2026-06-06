const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { safeJoin } = require('../../utils/audioPlayer');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from YouTube, Spotify, or SoundCloud')
    .addStringOption(option => option
      .setName('query')
      .setDescription('Song name or URL')
      .setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply();
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Join a voice channel',
          description: 'Connect to a voice channel first, then run `/play` again.',
        })],
      });
    }

    const botPermissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!botPermissions?.has(PermissionFlagsBits.Connect)
      || !botPermissions?.has(PermissionFlagsBits.Speak)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Missing voice permissions',
          description: `I need **Connect** and **Speak** permissions in ${voiceChannel}.`,
        })],
      });
    }

    let player = client.kazagumo.players.get(interaction.guildId);
    if (player?.voiceId && player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Wrong voice channel',
          description: 'Join the same voice channel as Looki before adding music.',
        })],
      });
    }

    const query = interaction.options.getString('query', true).trim();
    await interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Finding your music',
        description: `Searching for **${query.slice(0, 150)}**...`,
        footer: 'YouTube • Spotify • SoundCloud',
      })],
    });

    try {
      const result = await client.kazagumo.search(query, { requester: interaction.user });
      if (!result?.tracks?.length) {
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            type: 'error',
            title: 'No results found',
            description: `I could not find **${query.slice(0, 150)}**.\n\nTry a more specific title or check that the link is public.`,
          })],
        });
      }

      let createdPlayer = false;
      if (!player) {
        player = await safeJoin(client.kazagumo, interaction.guildId, voiceChannel.id, interaction.guild.shardId);
        player.textId = interaction.channelId;
        createdPlayer = true;
      }

      const settings = await ServerMusicSettings.getSettings(interaction.guildId);
      if (createdPlayer && settings?.default_volume !== undefined) player.setVolume(settings.default_volume);
      if (settings?.stay_247) player.data.set('stay247', true);

      if (result.type === 'PLAYLIST') {
        for (const track of result.tracks) player.queue.add(track);
        if (!player.playing && !player.paused) player.play();

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Playlist added',
            description: `**${result.playlistName || 'Playlist'}** is ready in the queue.`,
            thumbnail: result.tracks[0]?.thumbnail,
            footer: `${result.tracks.length} tracks added • Requested by ${interaction.user.username}`,
          }).addFields(
            { name: 'Tracks', value: `${result.tracks.length}`, inline: true },
            { name: 'Voice channel', value: voiceChannel.name, inline: true },
          )],
        });
      }

      const track = result.tracks[0];
      const wasIdle = !player.queue.current && !player.playing;
      player.queue.add(track);
      if (!player.playing && !player.paused) player.play();

      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: wasIdle ? 'Now playing' : 'Added to queue',
          description: `**[${track.title}](${track.uri})**`,
          thumbnail: track.thumbnail,
          footer: `Requested by ${interaction.user.username}`,
        }).addFields(
          { name: 'Artist', value: track.author || 'Unknown', inline: true },
          { name: 'Duration', value: formatDuration(track.length), inline: true },
          { name: 'Position', value: wasIdle ? 'Now' : `#${player.queue.length}`, inline: true },
        )],
      });
    } catch (error) {
      console.error('Play command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Could not play that song',
          description: `The audio service returned:\n\`${error.message}\``,
        })],
      }).catch(() => null);
    }
  },
};
