const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show details of the current song via Lavalink 🎀'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);
    const player = client.shoukaku.players.get(interaction.guildId);

    if (!queue || queue.songs.length === 0 || !player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('Nothing is playing right now! 🦋');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const song = queue.songs[0];
      const embed = createEmbed('music', client)
        .setTitle(`${song.title}`)
        .setURL(song.uri)
        .setThumbnail(song.thumbnail)
        .addFields(
          { name: '🦋 Artist', value: `> **${song.author}**`, inline: true },
          { name: '💖 Progress', value: `> **${client.music.formatDuration(player.position)} / ${client.music.formatDuration(song.length)}**`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Nowplaying error:', error);
      await interaction.reply({ content: '❌ Error fetching playback details.', ephemeral: true });
    }
  },
};
