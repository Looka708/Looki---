const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the upcoming songs 📜'),
  execute: async (interaction, client) => {
    const player = client.riffy.players.get(interaction.guildId);

    if (!player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('No music is currently playing! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const q = [...player.queue]
        .slice(0, 10)
        .map((track, i) => `**${i + 1}.** [${track.info.title}](${track.info.uri}) - \`${new Date(track.info.length).toISOString().substr(14, 5)}\``)
        .join('\n');

      const embed = createEmbed('music', client)
        .setTitle('📜 Current Queue')
        .setDescription(`**Now Playing:** [${player.current?.info?.title || 'Unknown'}](${player.current?.info?.uri || '#'})\n\n${q || 'No more songs in queue!'}`)
        .setFooter({ text: `Tracks: ${player.queue.length + (player.current ? 1 : 0)}` });

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Queue error:', error);
      await interaction.reply({ content: '❌ Error fetching queue.', ephemeral: true });
    }
  },
};
