const { SlashCommandBuilder } = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { canControlMusic, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'volume',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust music volume')
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Volume percentage (0-100)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(100)),

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
          description: 'Only the requester, configured DJ role, or a moderator can change volume.',
        })],
      });
    }

    const amount = interaction.options.getInteger('amount', true);
    player.setVolume(amount);
    await ServerMusicSettings.setDefaultVolume(interaction.guildId, amount).catch(() => null);

    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Volume updated',
        description: `Volume is now **${amount}%**.`,
      })],
    });
  },
};
