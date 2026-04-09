const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the upcoming songs in the Lavalink queue 📜'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const q = queue.songs
        .slice(0, 10)
        .map((song, i) => `${i === 0 ? '▶️' : `**${i}.**`} [${song.title}](${song.uri}) - \`${client.music.formatDuration(song.length)}\``)
        .join('\n');

      const embed = createEmbed('music', client)
        .setTitle('📜 Current Queue')
        .setDescription(q || 'No more songs in queue!')
        .setFooter({ text: `Tracks: ${queue.songs.length}` });

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Queue error:', error);
      await interaction.reply({ content: '❌ Error fetching queue.', ephemeral: true });
    }
  },
};
