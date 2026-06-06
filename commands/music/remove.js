const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');
const { canManageMusic, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'remove',
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the upcoming queue')
    .addIntegerOption(option => option
      .setName('position')
      .setDescription('Upcoming queue position from /queue')
      .setRequired(true)
      .setMinValue(1)),

  async execute(interaction, client) {
    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.reply({ embeds: [error], flags: 64 });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.reply({ embeds: [voiceCheck.error], flags: 64 });

    const position = interaction.options.getInteger('position', true);
    const index = position - 1;
    const track = player.queue[index];

    if (!track) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Invalid queue position',
          description: `There are only **${player.queue.length}** upcoming track(s).`,
        })],
        flags: 64,
      });
    }

    if (!canManageMusic(interaction, track)) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Cannot remove that track',
          description: 'Only moderators or the song requester can remove it.',
        })],
        flags: 64,
      });
    }

    const removed = player.queue.remove(index);
    return interaction.reply({
      embeds: [createMusicEmbed(client, {
        title: 'Removed from queue',
        description: `Removed **[${removed.title}](${removed.uri})** from position **#${position}**.`,
      }).addFields(
        { name: 'Artist', value: removed.author || 'Unknown', inline: true },
        { name: 'Duration', value: formatDuration(removed.length), inline: true },
      )],
    });
  },
};
