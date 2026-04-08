const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song ✨'),
  execute: async (interaction, client) => {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to skip! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      
      const currentSong = queue.songs[0];
      
      // If last song and not looping, stop. Otherwise skip.
      if (queue.songs.length <= 1 && queue.repeatMode === 0) {
          await queue.stop();
      } else {
          await queue.skip();
      }

      const skipEmbed = createEmbed('music', client)
        .setTitle('✨ Skipped Song')
        .setDescription(`Skipped **[${currentSong.name}](${currentSong.url})**`);
      
      await interaction.editReply({ embeds: [skipEmbed] });
      
    } catch (error) {
      console.error('Skip command error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Error Skipping')
        .setDescription('Something went wrong while trying to skip.');
      if (interaction.deferred) await interaction.editReply({ embeds: [errorEmbed] });
      else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
