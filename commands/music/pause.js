const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction, client) {
    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    if (player.paused) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Already paused',
          description: 'Use `/resume` when you are ready to continue.',
        })],
        flags: 64,
      });
    }

    player.pause(true);
    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Paused',
        description: `Paused **[${player.queue.current.title}](${player.queue.current.uri})**.`,
      })],
    });
  },
};
