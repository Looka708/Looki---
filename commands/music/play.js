const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const {
  canSendMusicMessage,
  createMusicServiceOfflineEmbed,
  hasOnlineMusicNode,
  safeJoin,
  waitForOnlineMusicNode,
} = require('../../utils/audioPlayer');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');

function addControlPermissionWarning(embed, canSendControls) {
  if (canSendControls.ok) return embed;

  return embed.addFields({
    name: 'Music controls',
    value: 'Playback started, but I cannot post Now Playing controls here. Give me View Channel, Send Messages, and Embed Links.',
  });
}

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
    let canSendControls = canSendMusicMessage(interaction.channel, client);

    if (!hasOnlineMusicNode(client) && !await waitForOnlineMusicNode(client)) {
      return interaction.editReply({
        embeds: [createMusicServiceOfflineEmbed(client)],
      });
    }

    await interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Finding your music',
        description: `Searching for **${query.slice(0, 150)}**...`,
        footer: 'YouTube | Spotify | SoundCloud',
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
        createdPlayer = true;
      }

      const settings = await ServerMusicSettings.getSettings(interaction.guildId);
      player.textId = settings?.music_text_channel_id || interaction.channelId;
      player.data.set('stay247', Boolean(settings?.stay_247));

      if (createdPlayer) {
        if (settings?.default_volume !== undefined) player.setVolume(settings.default_volume);
        const loopModes = ['none', 'track', 'queue'];
        player.setLoop(loopModes[settings?.loop_default_mode] || 'none');
      }

      if (settings?.music_text_channel_id) {
        const configuredChannel = client.channels.cache.get(settings.music_text_channel_id)
          || await client.channels.fetch(settings.music_text_channel_id).catch(() => null);
        canSendControls = canSendMusicMessage(configuredChannel, client);
      }

      if (result.type === 'PLAYLIST') {
        for (const track of result.tracks) player.queue.add(track);
        if (!player.playing && !player.paused) player.play();

        const embed = createMusicEmbed(client, {
          title: 'Playlist added',
          description: `**${result.playlistName || 'Playlist'}** is ready in the queue.`,
          thumbnail: result.tracks[0]?.thumbnail,
          footer: `${result.tracks.length} tracks added | Requested by ${interaction.user.username}`,
        }).addFields(
          { name: 'Tracks', value: `${result.tracks.length}`, inline: true },
          { name: 'Voice channel', value: voiceChannel.name, inline: true },
        );

        return interaction.editReply({
          embeds: [addControlPermissionWarning(embed, canSendControls)],
        });
      }

      const track = result.tracks[0];
      const wasIdle = !player.queue.current && !player.playing;
      player.queue.add(track);
      if (!player.playing && !player.paused) player.play();

      const embed = createMusicEmbed(client, {
        title: wasIdle ? 'Now playing' : 'Added to queue',
        description: `**[${track.title}](${track.uri})**`,
        thumbnail: track.thumbnail,
        footer: `Requested by ${interaction.user.username}`,
      }).addFields(
        { name: 'Artist', value: track.author || 'Unknown', inline: true },
        { name: 'Duration', value: formatDuration(track.length), inline: true },
        { name: 'Position', value: wasIdle ? 'Now' : `#${player.queue.length}`, inline: true },
      );

      return interaction.editReply({
        embeds: [addControlPermissionWarning(embed, canSendControls)],
      });
    } catch (error) {
      console.error('Play command error:', error);
      if (String(error.message || error).toLowerCase().includes('no nodes are online')) {
        return interaction.editReply({
          embeds: [createMusicServiceOfflineEmbed(client)],
        }).catch(() => null);
      }

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
