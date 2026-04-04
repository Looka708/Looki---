const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip the current song ✨'),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to skip! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const queue = getQueue(interaction.guildId);

    if (!queue.currentSong) {
      const emptyEmbed = createEmbed('error', client)
        .setTitle('❌ Nothing Playing')
        .setDescription('There is no song to skip. Use `/play` to add songs!');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    const skippedSong = queue.currentSong;
    
    // Check if player exists and stop it, this triggers AudioPlayerStatus.Idle 
    // in our audioPlayer.js event listener which then automatically plays the next song.
    if (queue.audioPlayer) {
       // Stop the player. The Idle event will trigger `playNext`.
       // We disable repeat for this skip action so it doesn't just replay the same song if repeat='one'
       if (queue.repeat === 'one') {
          queue.repeat = 'off';
          queue.audioPlayer.stop();
          queue.repeat = 'one';
       } else {
          queue.audioPlayer.stop();
       }
    } else {
        // Fallback if no player exists somehow
        queue.currentSong = null;
        queue.isPlaying = false;
    }

    const embed = createEmbed('music', client)
      .setTitle('⏭️ Song Skipped')
      .setDescription(`Skipped: **${skippedSong?.title}**\n\ndone bestie ✦`);

    await interaction.reply({ embeds: [embed] });
  },
};

