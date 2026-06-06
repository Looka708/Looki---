const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

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
    const { player, error } = requirePlayer(interaction, client, { requireTrack: false });
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    const mode = interaction.options.getInteger('mode', true);
    player.setLoop(LOOP_MODES[mode]);

    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Loop mode updated',
        description: `Loop mode is now **${DISPLAY_MODES[mode]}**.`,
      })],
    });
  },
};
