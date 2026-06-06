const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction, client) {
    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    if (!player.paused) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Already playing',
          description: 'The player is not paused right now.',
        })],
        flags: 64,
      });
    }

    player.pause(false);
    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Resumed',
        description: `Resumed **[${player.queue.current.title}](${player.queue.current.uri})**.`,
      })],
    });
  },
};
