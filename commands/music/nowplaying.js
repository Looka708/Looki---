const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show details of the current song 🎀'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('Nothing is playing right now! 🦋');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const song = queue.songs[0];
      const embed = createEmbed('music', client)
        .setTitle(`${song.name}`)
        .setURL(song.url)
        .setThumbnail(song.thumbnail)
        .addFields(
          { name: '🦋 Artist', value: `> **${song.uploader.name}**`, inline: true },
          { name: '💖 Progress', value: `> **${queue.formattedCurrentTime} / ${song.formattedDuration}**`, inline: true },
          { name: '🧸 Requested by', value: `> **${song.user.tag}**`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Nowplaying error:', error);
      await interaction.reply({ content: '❌ Error fetching playback details.', ephemeral: true });
    }
  },
};
