const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const {
  canControlMusic,
  requirePlayer,
  requireSameVoice,
} = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'clearqueue',
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Remove every upcoming track without stopping the current song'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (!player.queue.length) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Queue already empty',
          description: 'There are no upcoming tracks to remove.',
        })],
      });
    }

    if (!await canControlMusic(interaction, player)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Music control restricted',
          description: 'Only the requester, configured DJ role, or a moderator can clear the queue.',
        })],
      });
    }

    const removed = player.queue.length;
    player.queue.clear();
    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Upcoming queue cleared',
        description: `Removed **${removed}** upcoming track(s). The current song will keep playing.`,
      })],
    });
  },
};
