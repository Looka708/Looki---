const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');
const { parseSeekTime, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'seek',
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a specific time in the current song')
    .addStringOption(option => option
      .setName('time')
      .setDescription('Time position, like 1m30s, 2:45, or 45')
      .setRequired(true)),

  async execute(interaction, client) {
    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    const seconds = parseSeekTime(interaction.options.getString('time', true));
    if (seconds === null || seconds < 0) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Invalid time',
          description: 'Use a format like `1m30s`, `2:45`, or `45`.',
        })],
        flags: 64,
      });
    }

    const durationSeconds = Math.floor((player.queue.current.length || 0) / 1000);
    if (durationSeconds > 0 && seconds > durationSeconds) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Time is past the end',
          description: `This track is only **${formatDuration(player.queue.current.length)}** long.`,
        })],
        flags: 64,
      });
    }

    player.seek(seconds * 1000);
    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Seeked',
        description: `Jumped to **${formatDuration(seconds * 1000)}** in **[${player.queue.current.title}](${player.queue.current.uri})**.`,
      })],
    });
  },
};
