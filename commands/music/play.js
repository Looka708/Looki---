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
    try { 
        await interaction.deferReply(); 
    } catch(e) {
        console.error('Failed to defer:', e.message);
    }

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to use music commands! 🎵');
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    try {
      const query = interaction.options.getString('query');
      const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
      
      if (!node) throw new Error('No Lavalink nodes are currently available. Please try again in a few seconds.');

      // Search for the track
      // Lavalink supports ytsearch:, scsearch:, and direct URLs (YouTube/Spotify)
      let searchType = 'ytsearch';
      if (query.includes('youtube.com') || query.includes('youtu.be')) searchType = null;
      if (query.includes('spotify.com')) searchType = null; // Lavalink nodes usually have spotify support built-in

      const result = await node.rest.resolve(searchType ? `${searchType}:${query}` : query);
      
      if (!result || !result.data || (result.loadType === 'empty')) {
        throw new Error('No results found for your query.');
      }

      let song = null;
      let songsToAdd = [];

      if (result.loadType === 'playlist') {
          songsToAdd = result.data.tracks.map(track => ({
              title: track.info.title,
              url: track.info.uri,
              encoded: track.encoded,
              duration: new Date(track.info.length).toISOString().slice(11, 19).replace(/^00:/, ''),
              thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
              requester: interaction.user.tag
          }));
          song = songsToAdd[0];
      } else if (result.loadType === 'search' || result.loadType === 'track') {
          const track = result.data instanceof Array ? result.data[0] : result.data;
          song = {
              title: track.info.title,
              url: track.info.uri,
              encoded: track.encoded,
              duration: new Date(track.info.length).toISOString().slice(11, 19).replace(/^00:/, ''),
              thumbnail: `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
              requester: interaction.user.tag
          };
          songsToAdd.push(song);
      }

      if (!song) throw new Error('Could not process that song.');

      const queue = getQueue(interaction.guildId);

      // Create player if it doesn't exist
      if (!queue.player) {
         try {
            // Robust join with retry for 'missing connection endpoint' errors
            let player;
            try {
                player = await client.shoukaku.joinVoiceChannel({
                    guildId: interaction.guildId,
                    channelId: voiceChannel.id,
                    shardId: interaction.guild.shardId ?? 0
                });
            } catch (err) {
                if (err.message.includes('missing connection endpoint')) {
                    console.log('🌸 [Lavalink] Connection endpoint missing, retrying in 1.5s...');
                    await new Promise(r => setTimeout(r, 1500));
                    player = await client.shoukaku.joinVoiceChannel({
                        guildId: interaction.guildId,
                        channelId: voiceChannel.id,
                        shardId: interaction.guild.shardId ?? 0
                    });
                } else {
                    throw err;
                }
            }
            
            queue.player = player;
            
            queue.player.on('start', () => {
                queue.isPlaying = true;
            });

            queue.player.on('end', () => {
                queue.isPlaying = false;
                playNext(interaction.guildId, client, interaction.channel);
            });

            queue.player.on('exception', (err) => {
                console.error('Lavalink Exception:', err);
                queue.isPlaying = false;
                playNext(interaction.guildId, client, interaction.channel);
            });

            queue.player.on('closed', () => {
                queue.player = null;
                queue.isPlaying = false;
            });

         } catch (connErr) {
            console.error('Lavalink Connection Error:', connErr);
            throw new Error('Failed to connect to the voice channel via Lavalink.');
         }
      }

      // Add to queue
      songsToAdd.forEach(s => addSongToQueue(interaction.guildId, s));

      if (result.loadType === 'playlist') {
          const playlistEmbed = createEmbed('music', client)
            .setTitle('🎶 Playlist Added')
            .setDescription(`Added **${songsToAdd.length}** tracks from the playlist.`)
            .addFields({ name: '👤 Requester', value: interaction.user.tag });
          await interaction.editReply({ embeds: [playlistEmbed] });
      } else if (queue.isPlaying && queue.songs.length > 0) {
          const addEmbed = createEmbed('music', client)
            .setTitle('🎵 Added to Queue')
            .setDescription(`**[${song.title}](${song.url})**`)
            .addFields(
               { name: '👤 Requester', value: song.requester, inline: true },
               { name: '📍 Position', value: `#${queue.songs.length}`, inline: true }
            );
          if (song.thumbnail) addEmbed.setThumbnail(song.thumbnail);
          await interaction.editReply({ embeds: [addEmbed] });
      } else {
          await interaction.editReply({ 
              embeds: [createEmbed('music', client).setDescription('⏳ Loading track...')] 
          });
      }

      if (!queue.isPlaying) {
         playNext(interaction.guildId, client, interaction.channel);
      }

    } catch (error) {
       console.error('Play command error:', error);
       const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error Playing Song')
        .setDescription(error.message || 'Something went wrong with the Lavalink connection.');

       if (interaction.deferred || interaction.replied) {
         await interaction.editReply({ embeds: [errorEmbed] });
       } else {
         await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
       }
    }
  },
};
