const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('▶️ Resume the paused song'),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to resume music! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const queue = getQueue(interaction.guildId);

    if (!queue.audioPlayer || !queue.currentSong) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no music in the queue right now.');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    if (queue.audioPlayer.state.status !== 'paused') {
      const playingEmbed = createEmbed('error', client)
        .setDescription('Music is not paused!');
      return interaction.reply({ embeds: [playingEmbed], ephemeral: true });
    }

    queue.audioPlayer.unpause();
    
    const embed = createEmbed('music', client)
      .setTitle('▶️ Track Resumed')
      .setDescription('Music is playing again. yep yep, all good 💕');

    await interaction.reply({ embeds: [embed] });
  },
};
