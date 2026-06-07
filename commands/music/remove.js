const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');
const { canControlMusic, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

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
    await interaction.deferReply({ flags: 64 });

    const { player, error } = requirePlayer(interaction, client);
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    const position = interaction.options.getInteger('position', true);
    const index = position - 1;
    const track = player.queue[index];

    if (!track) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Invalid queue position',
          description: `There are only **${player.queue.length}** upcoming track(s).`,
        })],
      });
    }

    if (!await canControlMusic(interaction, player, track)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Cannot remove that track',
          description: 'Only moderators or the song requester can remove it.',
        })],
      });
    }

    const removed = player.queue.remove(index);
    return interaction.editReply({
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
