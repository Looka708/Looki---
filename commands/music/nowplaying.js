const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show details of the current song 🎀'),
  execute: async (interaction, client) => {
    const player = client.kazagumo.players.get(interaction.guildId);

    if (!player || !player.queue.current) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('Nothing is playing right now! 🦋');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const track = player.queue.current;
      const progress = new Date(player.position).toISOString().substr(14, 5);
      const total = new Date(track.length).toISOString().substr(14, 5);
      
      const embed = createEmbed('music', client)
        .setTitle(`${track.title}`)
        .setURL(track.uri)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: '🦋 Artist', value: `> **${track.author}**`, inline: true },
          { name: '💖 Progress', value: `> **${progress} / ${total}**`, inline: true },
          { name: '🧸 Requested by', value: `> **${track.requester?.tag || 'Unknown User'}**`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Nowplaying error:', error);
      await interaction.reply({ content: '❌ Error fetching playback details.', ephemeral: true });
    }
  },
};
