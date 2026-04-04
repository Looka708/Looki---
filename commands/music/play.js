const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { getQueue, addSongToQueue, setConnection } = require('../../utils/musicManager');
const { playNext } = require('../../utils/audioPlayer');
const play = require('play-dl');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');

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
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to use music commands! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      const query = interaction.options.getString('query');
      let song = null;

      // Smart Parsing with play-dl (primary) and fallbacks
      if (query.includes('youtube.com') || query.includes('youtu.be')) {
         try {
           const videoInfo = await play.video_info(query);
           song = {
             title: videoInfo.video_details.title,
             url: videoInfo.video_details.url,
             thumbnail: videoInfo.video_details.thumbnails[0]?.url,
             durationRaw: videoInfo.video_details.durationRaw,
             requester: interaction.user.tag,
             requesterId: interaction.user.id
           };
         } catch (infoError) {
           console.log(`[Music] play-dl info failed for ${query}. Trying @distube/ytdl-core...`);
           try {
             // Fallback to @distube/ytdl-core for info
             const videoInfo = await ytdl.getBasicInfo(query, { playerClients: ['IOS'] });
             song = {
               title: videoInfo.videoDetails.title,
               url: videoInfo.videoDetails.video_url,
               thumbnail: videoInfo.videoDetails.thumbnails[0]?.url,
               durationRaw: new Date(videoInfo.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8).replace(/^00:/, ''),
               requester: interaction.user.tag,
               requesterId: interaction.user.id
             };
           } catch (ytdlError) {
             throw new Error('Could not retrieve YouTube video info. YouTube might be blocking the request.');
           }
         }
      } else if (query.includes('spotify.com/track/')) {
        if (play.is_expired()) await play.refreshToken();
        const sp_data = await play.spotify(query);
        song = {
            title: `${sp_data.name} - ${sp_data.artists[0]?.name || ''}`,
            url: query, // will be resolved in audioPlayer
            thumbnail: sp_data.thumbnail?.url,
            durationRaw: 'Spotify',
            requester: interaction.user.tag,
            requesterId: interaction.user.id
        };
      } else if (query.includes('spotify.com/playlist') || query.includes('spotify.com/album') || query.includes('youtube.com/playlist')) {
         const errorEmbed = createEmbed('error', client)
             .setTitle('❌ Playlists Unsupported')
             .setDescription('Playlist support is coming soon! For now, please play individual tracks.');
         return interaction.editReply({ embeds: [errorEmbed] });
      } else {
         // Search
         try {
           const searchResults = await play.search(query, { limit: 1 });
           if (!searchResults || !searchResults.length) throw new Error('No songs found.');
           song = {
             title: searchResults[0].title,
             url: searchResults[0].url,
             thumbnail: searchResults[0].thumbnails?.[0]?.url,
             durationRaw: searchResults[0].durationRaw,
             requester: interaction.user.tag,
             requesterId: interaction.user.id
           };
         } catch (searchError) {
           console.log(`[Music] play-dl search failed for "${query}". Trying yt-search...`);
           const r = await yts(query);
           const video = r.videos[0];
           if (!video) throw new Error('No songs found for that search.');
           song = {
             title: video.title,
             url: video.url,
             thumbnail: video.thumbnail,
             durationRaw: video.timestamp,
             requester: interaction.user.tag,
             requesterId: interaction.user.id
           };
         }
      }

      if (!song) throw new Error('Could not process that song.');

      const queue = getQueue(interaction.guildId);
      addSongToQueue(interaction.guildId, song);

      // Connect to VC
      if (!queue.connection) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        setConnection(interaction.guildId, connection);
      }

      if (queue.isPlaying) {
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
         playNext(interaction.guildId, client, interaction.channel);
      }
    } catch (error) {
       console.error('Play command error:', error);
       const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error Playing Song')
        .setDescription(error.message || 'Something went wrong. YouTube might be blocking the bot.');
       try { await interaction.editReply({ embeds: [errorEmbed] }); } catch (e) {}
    }
  },
};

