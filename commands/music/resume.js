const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (!player.paused) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Already playing',
          description: 'The player is not paused right now.',
        })],
      });
    }

    player.pause(false);
    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Resumed',
        description: `Resumed **[${player.queue.current.title}](${player.queue.current.uri})**.`,
      })],
    });
  },
};
