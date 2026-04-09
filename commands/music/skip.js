const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song via Lavalink ✨'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to skip! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      const currentSong = queue.songs[0];
      client.music.skip(interaction.guildId);

      const skipEmbed = createEmbed('music', client)
        .setTitle('✨ Skipped Song')
        .setDescription(`Skipped **[${currentSong.title}](${currentSong.uri})**`);
      
      await interaction.editReply({ embeds: [skipEmbed] });
      
    } catch (error) {
      console.error('Skip command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Error Skipping')
        .setDescription('Something went wrong while trying to skip.');
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
