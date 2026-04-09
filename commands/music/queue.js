const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the upcoming songs 📜'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const q = queue.songs
        .slice(0, 10)
        .map((song, i) => `${i === 0 ? '▶️' : `**${i}.**`} [${song.name}](${song.url}) - \`${song.formattedDuration}\``)
        .join('\n');

      const embed = createEmbed('music', client)
        .setTitle('📜 Current Queue')
        .setDescription(q || 'No more songs in queue!')
        .setFooter({ text: `Tracks: ${queue.songs.length} | Duration: ${queue.formattedDuration}` });

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Queue error:', error);
      await interaction.reply({ content: '❌ Error fetching queue.', ephemeral: true });
    }
  },
};
