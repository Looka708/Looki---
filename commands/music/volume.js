const { SlashCommandBuilder } = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

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
    const { player, error } = requirePlayer(interaction, client, { requireTrack: false });
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    const amount = interaction.options.getInteger('amount', true);
    player.setVolume(amount);
    await ServerMusicSettings.setDefaultVolume(interaction.guildId, amount).catch(() => null);

    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Volume updated',
        description: `Volume is now **${amount}%**.`,
      })],
    });
  },
};
