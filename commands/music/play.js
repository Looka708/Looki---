const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { safeJoin } = require('../../utils/audioPlayer');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube, Spotify or SoundCloud 🎀')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name, YouTube URL, or Spotify URL')
        .setRequired(true)
    ),

  execute: async (interaction, client) => {
    // 🌸 Defer reply immediately within the 3s window
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }
    } catch (e) {
      console.error('🥺 [Play] Failed to defer:', e.message);
      return;
    }

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('🥺 Join a Voice Channel')
          .setDescription('You must be in a voice channel to use music commands! 🎀')]
      });
    }

    try {
      const query = interaction.options.getString('query');
      
      if (!query || query.trim() === "") {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription(`🥺 Please provide a song name or URL to play! 🎀`)]
        });
      }

      await interaction.editReply({
        embeds: [createEmbed('music', client).setDescription(`🌸 Searching for your request... ✨`)]
      });

      const isUrl = (url) => {
        try { new URL(url); return true; } catch (e) { return false; }
      };

      const searchOptions = { requester: interaction.user };
      
      // If it's a Spotify link, the plugin we just added will handle it.
      // If it's a YouTube link, Kazagumo should handle it.
      // If it's not a URL, it uses defaultSearchEngine (youtube).
      
      const resolve = await client.kazagumo.search(query, searchOptions);
      
      if (!resolve || !resolve.tracks.length) {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription(`🥺 I couldn't find any results for **${query}**! ✨\n\n> *Tip: If it's a link, make sure it's public and accessible.*`)]
        });
      }

      // Use safeJoin to avoid "guild already has connection" bug
      let player = client.kazagumo.players.get(interaction.guildId);
      if (!player) {
         player = await safeJoin(client.kazagumo, interaction.guildId, voiceChannel.id, interaction.guild.shardId);
         player.textId = interaction.channelId;
      }

      if (resolve.type === 'PLAYLIST') {
        for (const track of resolve.tracks) {
          player.queue.add(track);
        }
        const playlistName = resolve.playlistName || 'Playlist';
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`🎀 Added playlist **${playlistName}** (${resolve.tracks.length} tracks) to the queue! ✨`)]
        });
        if (!player.playing && !player.paused) player.play();
      } else {
        const track = resolve.tracks[0];
        player.queue.add(track);
        
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`💖 Added **[${track.title}](${track.uri})** to the queue! ✨`)]
        });
        if (!player.playing && !player.paused) player.play();
      }

    } catch (error) {
      console.error('Play command error:', error);
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription(`Something went wrong while connecting to the audio node 🦋:\n\`${error.message}\``);
      
      await interaction.editReply({ embeds: [embed] }).catch(() => {});
    }
  },
};
