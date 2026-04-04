const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue, deleteQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹️ Stops music and clears the queue ✨'),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to stop music! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const queue = getQueue(interaction.guildId);

    if (!queue || (!queue.currentSong && queue.songs.length === 0 && !queue.isPlaying)) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no music currently playing.');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    if (queue.audioPlayer) queue.audioPlayer.stop(true);
    if (queue.connection) queue.connection.destroy();
    deleteQueue(interaction.guildId);

    const embed = createEmbed('success', client)
      .setTitle('⏹️ Music Stopped')
      .setDescription('Queue cleared and left the voice channel. done bestie ✦');

    await interaction.reply({ embeds: [embed] });
  },
};
