const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'play',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song locally from YouTube or Spotify 🎀')
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
      
      // Initial status message
      await interaction.editReply({
        embeds: [createEmbed('music', client).setDescription(`🌸 Searching for your request... ✨`)]
      });

      // DisTube handles everything: joining, searching, queueing, and playing
      await client.distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
        metadata: { interaction } // Useful for advanced interactions
      });

    } catch (error) {
      console.error('Play command error:', error);
      const embed = createEmbed('error', client)
        .setTitle('🥺 Error Playing Song')
        .setDescription(error.message || 'Something went wrong 🦋.');
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
