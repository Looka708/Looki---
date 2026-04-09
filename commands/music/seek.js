const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'seek',
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('⏱️ Seek to a specific time in the current song (Lavalink)')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time position (e.g., 1m30s, 2:45, 45)')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    try {
      const timeString = interaction.options.getString('time');
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
        return await interaction.reply({
          content: '🥺 You must be in a voice channel!',
          ephemeral: true
        });
      }

      const queue = client.music.queues.get(interaction.guildId);
      const player = client.shoukaku.players.get(interaction.guildId);

      if (!queue || queue.songs.length === 0 || !player) {
        return await interaction.reply({
          content: '❌ No music is currently playing!',
          ephemeral: true
        });
      }

      // Parse time string
      let seconds = 0;
      
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length === 2) {
          seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      } 
      else if (timeString.includes('m') || timeString.includes('s')) {
        const minuteMatch = timeString.match(/(\d+)m/);
        const secondMatch = timeString.match(/(\d+)s/);
        if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) seconds += parseInt(secondMatch[1]);
      }
      else if (!isNaN(timeString)) {
        seconds = parseInt(timeString);
      }

      if (isNaN(seconds) || seconds < 0) {
        return await interaction.reply({
          content: '❌ Invalid time format! Use: `2:45` or `1m30s` or `150`',
          ephemeral: true
        });
      }

      const song = queue.songs[0];
      const durationMs = song.length;

      if (seconds * 1000 > durationMs) {
        return await interaction.reply({
          content: `❌ Time exceeds song duration! Max: **${client.music.formatDuration(durationMs)}**`,
          ephemeral: true
        });
      }

      try {
        await player.seekTo(seconds * 1000);
        
        await interaction.reply({
          embeds: [createEmbed('music', client)
            .setTitle('⏱️ Seeked')
            .setDescription(`⏭️ Jumped to **${client.music.formatDuration(seconds * 1000)}**`)]
        });
      } catch (error) {
        console.error('Seek error:', error);
        await interaction.reply({
          content: '❌ Failed to seek - stream may not support seeking',
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Error in seek command:', error);
      await interaction.reply({
        content: '❌ Failed to seek',
        ephemeral: true
      });
    }
  },
};
