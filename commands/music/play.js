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
    try {
      if (!interaction.deferred && !interaction.replied) await interaction.deferReply();
    } catch (e) {
      console.error('Failed to defer reply (likely token expired):', e);
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
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription(error.message || 'Something went wrong while connecting to music source 🦋.');
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
