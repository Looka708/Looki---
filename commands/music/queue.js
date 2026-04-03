const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📋 View the current music queue')
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number')
        .setMinValue(1)
    ),
  execute: async (interaction, client) => {
    const page = interaction.options.getInteger('page') || 1;
    const queue = getQueue(interaction.guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
      const emptyEmbed = createEmbed('music', client)
        .setTitle('🎵 Queue is Empty')
        .setDescription('No songs are currently playing. Add a song with `/play`!');

      await interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
      return;
    }

    // Build queue list
    let queueList = '';

    if (queue.currentSong) {
      queueList += `**🎵 Now Playing:**\n\`\`\`\n${queue.currentSong.title}\n\`\`\`\n\n`;
      queueList += `**📋 Next Up:**\n`;
    }

    if (queue.songs.length === 0) {
      queueList += 'No more songs in queue.';
    } else {
      queue.songs.slice(0, 10).forEach((song, index) => {
        queueList += `\`${index + 1}.\` ${song.title} - *${song.requester}*\n`;
      });

      if (queue.songs.length > 10) {
        queueList += `\n*... and ${queue.songs.length - 10} more songs*`;
      }
    }

    const embed = createEmbed('music', client)
      .setTitle('📋 Music Queue')
      .setDescription(queueList)
      .addFields(
        { name: '📊 Total Songs', value: `${queue.songs.length + (queue.currentSong ? 1 : 0)}`, inline: true },
        { name: '🔊 Volume', value: `${Math.round(queue.volume * 100)}%`, inline: true },
        { name: '🔁 Repeat', value: queue.repeat.charAt(0).toUpperCase() + queue.repeat.slice(1) || 'Off', inline: true }
      )
      .setThumbnail(queue.currentSong?.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
      .setFooter({ text: `Page ${page}` });

    await interaction.reply({ embeds: [embed] });
  },
};
