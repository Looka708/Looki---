const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song via Lavalink ✨'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);
    const player = client.shoukaku.players.get(interaction.guildId);

    if (!queue || queue.songs.length === 0 || !player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song to resume! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!player.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('✨ Already Playing')
        .setDescription('The player is not paused! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      player.resume();

      const resumeEmbed = createEmbed('music', client)
        .setTitle('✨ Song Resumed')
        .setDescription(`Resumed **[${queue.songs[0].title}](${queue.songs[0].uri})**! 🎀`);
      
      await interaction.editReply({ embeds: [resumeEmbed] });
      
    } catch (error) {
       console.error('Resume error:', error);
       await interaction.editReply({ content: '🥺 Failed to resume the player.' });
    }
  },
};
