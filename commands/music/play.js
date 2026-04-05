const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue, addSongToQueue } = require('../../utils/musicManager');
const { playNext } = require('../../utils/audioPlayer');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify 🎵')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name, YouTube URL, or Spotify URL')
        .setRequired(true)
    ),

  execute: async (interaction, client) => {
    await interaction.deferReply();

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('❌ Join a Voice Channel')
          .setDescription('You must be in a voice channel to use music commands! 🎵')]
      });
    }

    try {
      const query = interaction.options.getString('query');

      // ── Get best available node ───────────
      const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
      if (!node) throw new Error('No Lavalink nodes available. Please try again in a moment.');

      // ── Build search query ───────────
      let searchQuery;
      if (query.includes('youtube.com') || query.includes('youtu.be') || query.includes('spotify.com')) {
        searchQuery = query;
      } else {
        searchQuery = `ytsearch:${query}`;
      }

      // ── Load tracks (Shoukaku v4 correct method) ───────────
      const result = await node.rest.resolve(searchQuery);
      console.log('🌸 [Lavalink] loadType:', result?.loadType, '| data type:', Array.isArray(result?.data) ? 'array' : typeof result?.data);

      if (!result || result.loadType === 'empty' || result.loadType === 'error') {
        throw new Error('No results found for your query.');
      }

      // ── Parse result ───────────
      let songsToAdd = [];
      let song = null;

      if (result.loadType === 'playlist') {
        songsToAdd = result.data.tracks.map(track => ({
          title: track.info.title,
          url: track.info.uri,
          encoded: track.encoded,
          duration: formatDuration(track.info.length),
          durationMs: track.info.length,
          thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
          requester: interaction.user.tag,
        }));
        song = songsToAdd[0];
      } else if (result.loadType === 'search') {
        const track = result.data[0]; 
        song = {
          title: track.info.title,
          url: track.info.uri,
          encoded: track.encoded,
          duration: formatDuration(track.info.length),
          durationMs: track.info.length,
          thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
          requester: interaction.user.tag,
        };
        songsToAdd.push(song);
      } else if (result.loadType === 'track') {
        const track = result.data; 
        song = {
          title: track.info.title,
          url: track.info.uri,
          encoded: track.encoded,
          duration: formatDuration(track.info.length),
          durationMs: track.info.length,
          thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
          requester: interaction.user.tag,
        };
        songsToAdd.push(song);
      }

      if (!song) throw new Error('Could not process that song.');

      // ── Create player if needed ───────────
      const queue = getQueue(interaction.guildId);

      if (!queue.player) {
        // 🌸 Check if Shoukaku actually has an internal player (Recovery)
        const existingPlayer = client.shoukaku.players.get(interaction.guildId);

        if (existingPlayer) {
          queue.player = existingPlayer;
          attachPlayerEvents(existingPlayer, interaction.guildId, client, interaction.channel, queue);
          console.log(`🌸 [Lavalink] Re-attached to existing player for guild ${interaction.guildId}`);
        } else {
          try {
            await new Promise(r => setTimeout(r, 300)); // wait for voice state
            const player = await client.shoukaku.joinVoiceChannel({
              guildId: interaction.guildId,
              channelId: voiceChannel.id,
              shardId: interaction.guild.shardId ?? 0,
            });

            queue.player = player;
            attachPlayerEvents(player, interaction.guildId, client, interaction.channel, queue);

          } catch (err) {
            console.error('Lavalink Connection Error:', err);
            throw new Error('Failed to connect to the voice channel. Please try again.');
          }
        }
      }

      // ── Add songs to queue ───────────
      songsToAdd.forEach(s => addSongToQueue(interaction.guildId, s));

      // ── Reply ───────────
      if (result.loadType === 'playlist') {
        await interaction.editReply({
          embeds: [createEmbed('music', client)
            .setTitle('🎶 Playlist Added')
            .setDescription(`Added **${songsToAdd.length}** tracks to the queue.`)
            .addFields({ name: '👤 Requester', value: interaction.user.tag })]
        });
      } else if (queue.isPlaying && queue.songs.length > 0) {
        const embed = createEmbed('music', client)
          .setTitle('🎵 Added to Queue')
          .setDescription(`**[${song.title}](${song.url})**`)
          .addFields(
            { name: '👤 Requester', value: song.requester, inline: true },
            { name: '📍 Position', value: `#${queue.songs.length}`, inline: true }
          );
        if (song.thumbnail) embed.setThumbnail(song.thumbnail);
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription('⏳ Loading track...')]
        });
      }

      // ── Start playback if idle ───────────
      if (!queue.isPlaying) {
        playNext(interaction.guildId, client, interaction.channel);
      }

    } catch (error) {
      console.error('Play command error:', error);
      const embed = createEmbed('error', client)
        .setTitle('❌ Error Playing Song')
        .setDescription(error.message || 'Something went wrong.');
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

// 🌸 Helper: Attach Player Events ───────────
function attachPlayerEvents(player, guildId, client, channel, queue) {
  // Clear any old listeners if this is a reused player
  player.removeAllListeners();

  player.on('start', () => { 
    queue.isPlaying = true; 
  });

  player.on('end', () => {
    queue.isPlaying = false;
    playNext(guildId, client, channel);
  });

  player.on('exception', (err) => {
    console.error('🌸 [Lavalink] Track exception:', err?.message || err);
    queue.isPlaying = false;
    playNext(guildId, client, channel);
  });

  player.on('closed', () => {
    queue.player = null;
    queue.isPlaying = false;
    console.log(`🌸 [Lavalink] Connection closed for guild ${guildId}`);
  });
}

function formatDuration(ms) {
  if (!ms) return 'Unknown';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}
