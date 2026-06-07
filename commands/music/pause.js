const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (player.paused) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Already paused',
          description: 'Use `/resume` when you are ready to continue.',
        })],
      });
    }

    player.pause(true);
    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Paused',
        description: `Paused **[${player.queue.current.title}](${player.queue.current.uri})**.`,
      })],
    });
  },
};
