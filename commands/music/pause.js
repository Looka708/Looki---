const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song via Lavalink 🧸'),
  execute: async (interaction, client) => {
    const queue = client.music.queues.get(interaction.guildId);
    const player = client.shoukaku.players.get(interaction.guildId);

    if (!queue || queue.songs.length === 0 || !player) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Nothing Playing')
        .setDescription('There is no song playing to pause! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (player.paused) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🧸 Already Paused')
        .setDescription('The player is already paused! 🎀');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await interaction.deferReply();
      player.pause();

      const pauseEmbed = createEmbed('music', client)
        .setTitle('🧸 Song Paused')
        .setDescription(`Paused **[${queue.songs[0].title}](${queue.songs[0].uri})**! Use /resume to continue! ✨`);
      
      await interaction.editReply({ embeds: [pauseEmbed] });
      
    } catch (error) {
       console.error('Pause error:', error);
       await interaction.editReply({ content: '🥺 Failed to pause the player.' });
    }
  },
};
