const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const {
  canControlMusic,
  requestSkipVote,
  requirePlayer,
  requireSameVoice,
} = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song or start a vote skip'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (!await canControlMusic(interaction, player)) {
      const vote = await requestSkipVote(interaction, client, player);
      return interaction.editReply({ embeds: [vote.embed] });
    }

    const skipped = player.queue.current;
    player.data.set('skipVotes', new Set());
    player.skip();

    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Skipped',
        description: `Skipped **[${skipped.title}](${skipped.uri})**.`,
        footer: player.queue.length ? `${player.queue.length} track(s) left in queue` : 'Queue is now empty',
      })],
    });
  },
};
