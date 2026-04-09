const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify via Lavalink 🎀')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name, YouTube URL, or Spotify URL')
        .setRequired(true)
    ),

  execute: async (interaction, client) => {
    if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

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
      const node = client.shoukaku.getIdealNode();
      if (!node) {
        return interaction.editReply({
          embeds: [createEmbed('error', client)
            .setTitle('🥺 Lavalink Not Ready')
            .setDescription('No music nodes are currently available. Please wait a moment or check the console for connection errors. 🎀')]
        });
      }
      
      await interaction.editReply({
        embeds: [createEmbed('music', client).setDescription(`🌸 Searching for your request... ✨`)]
      });

      // Resolve the search query
      const result = await node.rest.resolve(query.startsWith('http') ? query : `ytsearch:${query}`);
      if (!result || !result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription('🥺 No results found for your query.')]
        });
      }

      let song;
      if (result.loadType === 'playlist') {
        song = result.data.tracks[0]; // For now just play first song of playlist if it's a playlist load
        // Advanced: handle better playlist loading
      } else if (result.loadType === 'search' || result.loadType === 'track') {
        song = Array.isArray(result.data) ? result.data[0] : result.data;
      } else {
        return interaction.editReply({
          embeds: [createEmbed('error', client).setDescription('🥺 Could not load the track.')]
        });
      }

      // Join and get/create player
      let player = client.shoukaku.players.get(interaction.guildId);
      if (!player) {
         player = await client.shoukaku.joinVoiceChannel({
            guildId: interaction.guildId,
            channelId: voiceChannel.id,
            shardId: 0 // Assume shard 0 for now
        });
        
        // Setup listeners for the new player
        player.on('start', () => console.log(`Started playing in ${interaction.guildId}`));
        player.on('end', () => {
            console.log(`Track ended in ${interaction.guildId}`);
            client.music.handleTrackEnd(interaction.guildId);
        });
        player.on('error', (err) => console.error('Lavalink Player Error:', err));
      }

      // Add to MusicManager queue
      const queue = await client.music.getOrCreateQueue(interaction.guildId, interaction.channel, player);
      
      const trackData = {
          encoded: song.encoded,
          title: song.info.title,
          uri: song.info.uri,
          author: song.info.author,
          length: song.info.length,
          thumbnail: `https://img.youtube.com/vi/${song.info.identifier}/hqdefault.jpg`
      };

      await client.music.play(interaction.guildId, trackData, interaction);

    } catch (error) {
      console.error('Play command error:', error);
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription(error.message || 'Something went wrong while connecting to Lavalink 🦋.');
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
