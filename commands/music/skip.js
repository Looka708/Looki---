const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue, getNextSong, setCurrentSong } = require('../../utils/musicManager');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip the current song'),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to skip! 🎵');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const queue = getQueue(interaction.guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song to skip. Use `/play` to add songs!');

      await interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
      return;
    }

    const skippedSong = queue.currentSong;
    const nextSong = getNextSong(interaction.guildId);

    if (nextSong) {
      setCurrentSong(interaction.guildId, nextSong);
    } else {
      queue.currentSong = null;
      queue.isPlaying = false;
    }

    const embed = createEmbed('music', client)
      .setTitle('⏭️ Song Skipped')
      .setDescription(`Skipped: ${skippedSong?.title || 'Unknown Song'}`)
      .addFields(
        { name: '🎵 Now Playing', value: nextSong?.title || 'Queue finished', inline: true },
        { name: '👤 Requester', value: nextSong?.requester || 'N/A', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
