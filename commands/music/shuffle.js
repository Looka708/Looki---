const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const {
  canControlMusic,
  requirePlayer,
  requireSameVoice,
} = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'shuffle',
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the upcoming music queue'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (player.queue.length < 2) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Not enough tracks',
          description: 'Add at least two upcoming tracks before shuffling.',
        })],
      });
    }

    if (!await canControlMusic(interaction, player)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Music control restricted',
          description: 'Only the requester, configured DJ role, or a moderator can shuffle.',
        })],
      });
    }

    player.queue.shuffle();
    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Queue shuffled',
        description: `Shuffled **${player.queue.length}** upcoming track(s).`,
      })],
    });
  },
};
