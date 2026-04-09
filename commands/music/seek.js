const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('⏱️ Seek to a specific time in the current song')
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

      const queue = client.distube.getQueue(interaction.guildId);

      if (!queue || !queue.songs[0]) {
        return await interaction.reply({
          content: '❌ No music is currently playing!',
          ephemeral: true
        });
      }

      if (voiceChannel.id !== queue.voiceChannel?.id) {
        return await interaction.reply({
          content: '🥺 You must be in the same voice channel as Looki!',
          ephemeral: true
        });
      }

      // Parse time string
      let seconds = 0;
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length === 2) seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (timeString.includes('m') || timeString.includes('s')) {
        const minuteMatch = timeString.match(/(\d+)m/);
        const secondMatch = timeString.match(/(\d+)s/);
        if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) seconds += parseInt(secondMatch[1]);
      } else if (!isNaN(timeString)) {
        seconds = parseInt(timeString);
      }

      if (isNaN(seconds) || seconds < 0) {
        return await interaction.reply({ content: '❌ Invalid time format!', ephemeral: true });
      }

      const currentSong = queue.songs[0];
      const duration = currentSong.duration || 0;

      if (seconds > duration) {
        return await interaction.reply({ content: '❌ Time exceeds song duration!', ephemeral: true });
      }

      queue.seek(seconds);
      await interaction.reply({
        embeds: [createEmbed('music', client)
          .setTitle('⏱️ Seeked')
          .setDescription(`⏭️ Jumped to **${seconds}s**`)]
      });
    } catch (error) {
      console.error('Seek error:', error);
      await interaction.reply({ content: '❌ Failed to seek', ephemeral: true });
    }
  },
};
