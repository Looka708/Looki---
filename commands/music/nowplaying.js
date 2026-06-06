const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, createTrackEmbed } = require('../../utils/musicEmbed');

module.exports = {
  name: 'nowplaying',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the current song and playback progress'),

  async execute(interaction, client) {
    const player = client.kazagumo.players.get(interaction.guildId);
    if (!player?.queue?.current) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Nothing is playing',
          description: 'Start a listening session with `/play`.',
        })],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [createTrackEmbed(client, player.queue.current, player)],
    });
  },
};
