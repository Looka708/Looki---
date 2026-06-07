const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const ServerPlaylist = require('../../models/ServerPlaylist');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const {
  createMusicServiceOfflineEmbed,
  hasOnlineMusicNode,
  safeJoin,
  waitForOnlineMusicNode,
} = require('../../utils/audioPlayer');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

async function loadSavedTracks(client, songs, requester) {
  const tracks = new Array(songs.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < songs.length) {
      const index = nextIndex;
      nextIndex += 1;
      const song = songs[index];
      const result = await client.kazagumo
        .search(song.uri || song.title, { requester })
        .catch(() => null);
      tracks[index] = result?.tracks?.[0] || null;
    }
  }

  const workerCount = Math.min(5, songs.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return tracks.filter(Boolean);
}

module.exports = {
  name: 'playlist',
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your server playlists')
    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a new playlist')
      .addStringOption(option => option
        .setName('name')
        .setDescription('Playlist name')
        .setMaxLength(50)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('Add the current song to a playlist')
      .addStringOption(option => option
        .setName('playlist')
        .setDescription('Playlist name')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('play')
      .setDescription('Add a saved playlist to the music queue')
      .addStringOption(option => option
        .setName('playlist')
        .setDescription('Playlist name')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('List playlists or songs in one playlist')
      .addStringOption(option => option
        .setName('playlist')
        .setDescription('Playlist name to show songs from')))
    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('Remove a song from a playlist')
      .addStringOption(option => option
        .setName('playlist')
        .setDescription('Playlist name')
        .setRequired(true))
      .addIntegerOption(option => option
        .setName('position')
        .setDescription('Song position shown by /playlist list')
        .setMinValue(1)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('clear')
      .setDescription('Remove every song from a playlist')
      .addStringOption(option => option
        .setName('playlist')
        .setDescription('Playlist name')
        .setRequired(true))),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'create') {
        const name = interaction.options.getString('name', true).trim();
        if (!name) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Invalid playlist name',
              description: 'The playlist name cannot be empty.',
            })],
          });
        }

        const existing = await ServerPlaylist.getByName(interaction.guildId, interaction.user.id, name);
        if (existing) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist already exists',
              description: `You already have a playlist named **${existing.name}** in this server.`,
            })],
          });
        }

        const playlist = await ServerPlaylist.create(interaction.guildId, interaction.user.id, name);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Playlist created',
            description: `Created **${playlist.name}**. Use \`/playlist add\` while a song is playing.`,
          })],
        });
      }

      if (subcommand === 'add') {
        const { player, error } = requirePlayer(interaction, client);
        if (error) return interaction.editReply({ embeds: [error] });

        const voiceCheck = requireSameVoice(interaction, client, player);
        if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

        const playlistName = interaction.options.getString('playlist', true).trim();
        const track = player.queue.current;
        const playlist = await ServerPlaylist.getByName(
          interaction.guildId,
          interaction.user.id,
          playlistName,
        );

        if (!playlist) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist not found',
              description: `Create **${playlistName}** first with \`/playlist create\`.`,
            })],
          });
        }

        const savedSongs = Array.isArray(playlist.songs) ? playlist.songs : [];
        if (savedSongs.some(song => song.uri === track.uri)) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Song already saved',
              description: `**${track.title}** is already in **${playlist.name}**.`,
            })],
          });
        }

        if (savedSongs.length >= 100) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist is full',
              description: 'A saved playlist can contain up to **100 songs**.',
            })],
          });
        }

        const updated = await ServerPlaylist.addSong(interaction.guildId, interaction.user.id, playlistName, {
          title: track.title,
          uri: track.uri,
          author: track.author || 'Unknown',
          length: track.length || 0,
          thumbnail: track.thumbnail || null,
          added_by: interaction.user.id,
          added_at: new Date().toISOString(),
        });

        if (!updated) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist not found',
              description: `Create **${playlistName}** first with \`/playlist create\`.`,
            })],
          });
        }

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Added to playlist',
            description: `Added **[${track.title}](${track.uri})** to **${updated.name}**.`,
            thumbnail: track.thumbnail,
          }).addFields(
            { name: 'Duration', value: formatDuration(track.length), inline: true },
            { name: 'Songs', value: `${updated.songs?.length || 0}`, inline: true },
          )],
        });
      }

      if (subcommand === 'play') {
        const playlistName = interaction.options.getString('playlist', true).trim();
        const playlist = await ServerPlaylist.getByName(
          interaction.guildId,
          interaction.user.id,
          playlistName,
        );
        if (!playlist) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist not found',
              description: `You do not have a playlist named **${playlistName}** in this server.`,
            })],
          });
        }

        const songs = Array.isArray(playlist.songs) ? playlist.songs.slice(0, 50) : [];
        if (!songs.length) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist is empty',
              description: `Add songs to **${playlist.name}** before playing it.`,
            })],
          });
        }

        if (!hasOnlineMusicNode(client) && !await waitForOnlineMusicNode(client)) {
          return interaction.editReply({
            embeds: [createMusicServiceOfflineEmbed(client)],
          });
        }

        const voiceChannel = interaction.member?.voice?.channel;
        if (!voiceChannel) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Join a voice channel',
              description: 'Connect to a voice channel before playing a saved playlist.',
            })],
          });
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions?.has(PermissionFlagsBits.Connect)
          || !permissions?.has(PermissionFlagsBits.Speak)) {
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
              description: 'Join the same voice channel as Looki before loading a playlist.',
            })],
          });
        }

        const tracks = await loadSavedTracks(client, songs, interaction.user);

        if (!tracks.length) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist unavailable',
              description: 'None of the saved songs could be loaded from the audio service.',
            })],
          });
        }

        const createdPlayer = !player;
        if (!player) {
          player = await safeJoin(
            client.kazagumo,
            interaction.guildId,
            voiceChannel.id,
            interaction.guild.shardId,
          );
        }

        const settings = await ServerMusicSettings.getSettings(interaction.guildId);
        player.textId = settings?.music_text_channel_id || interaction.channelId;
        player.data.set('stay247', Boolean(settings?.stay_247));
        if (createdPlayer) {
          if (settings?.default_volume !== undefined) player.setVolume(settings.default_volume);
          player.setLoop(['none', 'track', 'queue'][settings?.loop_default_mode] || 'none');
        }

        for (const track of tracks) player.queue.add(track);
        if (!player.playing && !player.paused) player.play();

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Saved playlist queued',
            description: `Added **${tracks.length}** song(s) from **${playlist.name}**.`,
            thumbnail: tracks[0]?.thumbnail,
            footer: tracks.length < songs.length
              ? `${songs.length - tracks.length} unavailable song(s) were skipped`
              : `Playing in ${voiceChannel.name}`,
          })],
        });
      }

      if (subcommand === 'remove') {
        const playlistName = interaction.options.getString('playlist', true).trim();
        const position = interaction.options.getInteger('position', true);
        const result = await ServerPlaylist.removeSong(
          interaction.guildId,
          interaction.user.id,
          playlistName,
          position,
        );

        if (!result.playlist) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist not found',
              description: `You do not have a playlist named **${playlistName}** in this server.`,
            })],
          });
        }

        if (!result.removed) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Invalid song position',
              description: `That playlist contains **${result.playlist.songs?.length || 0}** song(s).`,
            })],
          });
        }

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Song removed',
            description: `Removed **${result.removed.title}** from **${result.playlist.name}**.`,
          })],
        });
      }

      if (subcommand === 'clear') {
        const playlistName = interaction.options.getString('playlist', true).trim();
        const playlist = await ServerPlaylist.clear(interaction.guildId, interaction.user.id, playlistName);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            type: playlist ? undefined : 'error',
            title: playlist ? 'Playlist cleared' : 'Playlist not found',
            description: playlist
              ? `Removed every song from **${playlist.name}**.`
              : `You do not have a playlist named **${playlistName}** in this server.`,
          })],
        });
      }

      const playlistName = interaction.options.getString('playlist')?.trim();
      if (playlistName) {
        const playlist = await ServerPlaylist.getByName(interaction.guildId, interaction.user.id, playlistName);
        if (!playlist) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              type: 'error',
              title: 'Playlist not found',
              description: `You do not have a playlist named **${playlistName}** in this server.`,
            })],
          });
        }

        const songs = Array.isArray(playlist.songs) ? playlist.songs : [];
        const description = songs.length
          ? songs.slice(0, 15)
            .map((song, index) => `\`${index + 1}.\` [${song.title}](${song.uri}) | ${formatDuration(song.length)}`)
            .join('\n')
          : 'This playlist is empty.';

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: playlist.name,
            description,
            footer: `Showing ${Math.min(songs.length, 15)} of ${songs.length} song(s)`,
          })],
        });
      }

      const playlists = await ServerPlaylist.list(interaction.guildId, interaction.user.id);
      if (!playlists.length) {
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'No playlists yet',
            description: 'Create your first playlist with `/playlist create`.',
          })],
        });
      }

      const description = playlists
        .slice(0, 10)
        .map(playlist => `**${playlist.name}** | ${(playlist.songs || []).length} song(s)`)
        .join('\n');

      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: 'Your playlists',
          description,
          footer: `Showing ${Math.min(playlists.length, 10)} of ${playlists.length}`,
        })],
      });
    } catch (error) {
      console.error('Playlist command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Playlist failed',
          description: 'I could not update that playlist. Please try again.',
        })],
      });
    }
  },
};
