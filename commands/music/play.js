const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

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
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          embeds: [createEmbed('error', client)
            .setTitle('🥺 Join a Voice Channel')
            .setDescription('You must be in a voice channel to use music commands! 🎀')]
        });
      }
      return;
    }

    try {
      const query = interaction.options.getString('query');
      
      if (!query || query.trim() === "") {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription(`🥺 Please provide a song name or URL to play! 🎀`)]
        });
      }
      
      const player = client.riffy.createConnection({
        guildId: interaction.guildId,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channelId,
        deaf: true
      });

      await interaction.editReply({
        embeds: [createEmbed('music', client).setDescription(`🌸 Searching for your request... ✨`)]
      });

      const resolve = await client.riffy.resolve(query);
      
      if (!resolve || resolve.loadType === 'empty' || resolve.loadType === 'error') {
        const errorMsg = resolve?.loadType === 'error' 
          ? `🥺 Lavalink encountered an error while searching for **${query}**.` 
          : `🥺 I couldn't find any results for **${query}**! Try a different name.`;
          
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription(errorMsg)]
        });
      }

      if (resolve.loadType === 'playlist') {
        for (const track of resolve.tracks) {
          track.info.requester = interaction.user;
          player.queue.add(track);
        }
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`🎀 Added playlist **${resolve.playlistInfo.name}** with ${resolve.tracks.length} tracks! ✨`)]
        });
        if (!player.playing && !player.paused) player.play();
      } else {
        const track = resolve.tracks.shift();
        track.info.requester = interaction.user;
        player.queue.add(track);
        
        await interaction.editReply({
          embeds: [createEmbed('music', client).setDescription(`💖 Added **[${track.info.title}](${track.info.uri})** to the queue!✨`)]
        });
        if (!player.playing && !player.paused) player.play();
      }

    } catch (error) {
      console.error('Play command error:', error);
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription('Something went wrong while connecting to the Lavalink node 🦋.');
      
      await interaction.editReply({ embeds: [embed] }).catch(() => {});
    }
  },
};
