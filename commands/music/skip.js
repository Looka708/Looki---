const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction, client) {
    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    const skipped = player.queue.current;
    player.skip();

    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Skipped',
        description: `Skipped **[${skipped.title}](${skipped.uri})**.`,
        footer: player.queue.length ? `${player.queue.length} track(s) left in queue` : 'Queue is now empty',
      })],
    });
  },
};
