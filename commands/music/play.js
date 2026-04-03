const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const { getQueue, addSongToQueue, setConnection, getNextSong, setCurrentSong } = require('../../utils/musicManager');

// Note: In production, use @discordjs/voice with an audio backend like ffmpeg
// For now, this is a framework that sends alerts about what songs are queued

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or YouTube/Spotify URL')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to use music commands! 🎵');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const query = interaction.options.getString('query');
    const queue = getQueue(interaction.guildId);

    try {
      // Defer the response since search might take time
      await interaction.deferReply();

      // Create song object
      const song = {
        title: query.includes('youtube.com') || query.includes('youtu.be') 
          ? 'YouTube Song' 
          : query.includes('spotify.com')
          ? 'Spotify Song'
          : query,
        url: query.includes('http') ? query : `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        requester: interaction.user.tag,
        requesterId: interaction.user.id,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', // Placeholder
      };

      // Add song to queue
      addSongToQueue(interaction.guildId, song);

      // Connect to voice channel if not already connected
      if (!queue.connection) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        setConnection(interaction.guildId, connection);
        queue.connection = connection;

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          queue.isPlaying = false;
          queue.currentSong = null;
        });
      }

      // Create embed
      const embed = createEmbed('music', client)
        .setTitle('🎵 Song Added to Queue')
        .setDescription(song.title)
        .addFields(
          { name: '👤 Requester', value: song.requester, inline: true },
          { name: '📍 Position', value: `#${getQueue(interaction.guildId).songs.length}`, inline: true },
          { name: '👥 Queue Length', value: `${getQueue(interaction.guildId).songs.length} song(s)`, inline: true }
        )
        .setThumbnail(song.thumbnail);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Play command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error Playing Song')
        .setDescription('Something went wrong. Please try again.');

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
