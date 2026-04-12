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

      const resolve = await client.kazagumo.search(query, { requester: interaction.user });
      
      if (!resolve || !resolve.tracks.length) {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription(`🥺 I couldn't find any results for **${query}**! Try a different name.`)]
        });
      }

      // Use safeJoin to avoid "guild already has connection" bug
      let player = client.kazagumo.players.get(interaction.guildId);
      if (!player) {
         player = await safeJoin(client.kazagumo, interaction.guildId, voiceChannel.id, interaction.guild.shardId);
         player.setTextChannel(interaction.channelId);
      }

      if (resolve.type === 'PLAYLIST') {
        for (const track of resolve.tracks) {
          player.queue.add(track);
        }
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`🎀 Added playlist **${resolve.playlistName}** with ${resolve.tracks.length} tracks! ✨`)]
        });
        if (!player.playing && !player.paused) player.play();
      } else {
        const track = resolve.tracks[0];
        player.queue.add(track);
        
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`💖 Added **[${track.title}](${track.uri})** to the queue!✨`)]
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
