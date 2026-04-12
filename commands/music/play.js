const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube, Spotify or SoundCloud via DisTube 🎀')
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
      
      await interaction.editReply({
        embeds: [createEmbed('music', client).setDescription(`🌸 Searching for your request... ✨`)]
      });

      await client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction
      });

    } catch (error) {
      console.error('Play command error:', error);
      
      let errorMessage = error.message || 'Something went wrong while connecting to music source 🦋.';
      
      // Friendly messages for common errors
      if (error.message?.includes('DRM')) {
        errorMessage = 'This video is **DRM-protected** and cannot be played. Try a different source! 🔒';
      } else if (error.message?.includes('Sign in') || error.message?.includes('bot')) {
        errorMessage = 'YouTube is blocking this request. The bot cookies may have expired — please notify the bot owner to refresh them! 🍪';
      } else if (error.message?.includes('unavailable') || error.message?.includes('private')) {
        errorMessage = 'This video is **private or unavailable**. Try a different link! 🔐';
      }
      
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription(errorMessage);
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
