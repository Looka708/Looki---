const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Pause the current playing song'),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to pause music! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const queue = getQueue(interaction.guildId);

    if (!queue.audioPlayer || !queue.currentSong) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no music playing right now.');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    if (queue.audioPlayer.state.status === 'paused') {
      const pausedEmbed = createEmbed('error', client)
        .setDescription('Music is already paused! Use `/resume` to unpause.');
      return interaction.reply({ embeds: [pausedEmbed], ephemeral: true });
    }

    queue.audioPlayer.pause();
    
    const embed = createEmbed('music', client)
      .setTitle('⏸️ Track Paused')
      .setDescription('Music has been paused. Use `/resume` to continue playing. done bestie ✦');

    await interaction.reply({ embeds: [embed] });
  },
};
