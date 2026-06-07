const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { canControlMusic, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

const LOOP_MODES = ['none', 'track', 'queue'];
const DISPLAY_MODES = ['Off', 'Track', 'Queue'];

module.exports = {
  name: 'loop',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Change loop mode')
    .addIntegerOption(option => option
      .setName('mode')
      .setDescription('Loop mode')
      .setRequired(true)
      .addChoices(
        { name: 'Off', value: 0 },
        { name: 'Track', value: 1 },
        { name: 'Queue', value: 2 },
      )),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client, { requireTrack: false });
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (!await canControlMusic(interaction, player)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Music control restricted',
          description: 'Only the requester, configured DJ role, or a moderator can change loop mode.',
        })],
      });
    }

    const mode = interaction.options.getInteger('mode', true);
    player.setLoop(LOOP_MODES[mode]);

    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Loop mode updated',
        description: `Loop mode is now **${DISPLAY_MODES[mode]}**.`,
      })],
    });
  },
};
