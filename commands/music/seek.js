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
      
      // Handle MM:SS format
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length === 2) {
          seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      } 
      // Handle 1m30s or XmYs format
      else if (timeString.includes('m') || timeString.includes('s')) {
        const minuteMatch = timeString.match(/(\d+)m/);
        const secondMatch = timeString.match(/(\d+)s/);
        
        if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) seconds += parseInt(secondMatch[1]);
      }
      // Handle plain seconds
      else if (!isNaN(timeString)) {
        seconds = parseInt(timeString);
      }

      if (isNaN(seconds) || seconds < 0) {
        return await interaction.reply({
          content: '❌ Invalid time format! Use: `2:45` or `1m30s` or `150`',
          ephemeral: true
        });
      }

      const currentSong = queue.songs[0];
      const duration = currentSong.duration || 0;

      if (seconds > duration) {
        return await interaction.reply({
          content: `❌ Time exceeds song duration! (${Math.floor(duration / 60)}m ${duration % 60}s)`,
          ephemeral: true
        });
      }

      try {
        // DisTube seek - note: may not work with all sources
        if (queue.seek && typeof queue.seek === 'function') {
          queue.seek(seconds);
          
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          
          await interaction.reply({
            embeds: [createEmbed('music', client)
              .setTitle('⏱️ Seeked')
              .setDescription(`⏭️ Jumped to **${mins}m${secs}s**`)]
          });
        } else {
          await interaction.reply({
            content: '⚠️ Seeking not supported for this stream source',
            ephemeral: true
          });
        }
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
