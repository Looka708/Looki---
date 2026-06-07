const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');

const PAGE_SIZE = 10;

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the current and upcoming songs')
    .addIntegerOption(option => option
      .setName('page')
      .setDescription('Queue page to view')
      .setMinValue(1)),

  async execute(interaction, client) {
    const player = client.kazagumo.players.get(interaction.guildId);
    if (!player?.queue?.current) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'The queue is empty',
          description: 'Add a song with `/play` and it will appear here.',
        })],
        flags: 64,
      });
    }

    const requestedPage = interaction.options.getInteger('page') || 1;
    const totalPages = Math.max(1, Math.ceil(player.queue.length / PAGE_SIZE));
    if (requestedPage > totalPages) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Queue page not found',
          description: `The queue currently has **${totalPages}** page(s).`,
        })],
        flags: 64,
      });
    }

    const start = (requestedPage - 1) * PAGE_SIZE;
    const upcoming = player.queue.slice(start, start + PAGE_SIZE)
      .map((track, index) => {
        const position = start + index + 1;
        return `\`${String(position).padStart(2, '0')}\` [${track.title}](${track.uri}) | ${track.author || 'Unknown'} | \`${formatDuration(track.length)}\``;
      })
      .join('\n');

    const current = player.queue.current;
    const embed = createMusicEmbed(client, {
      title: 'Music Queue',
      description: `**NOW PLAYING**\n[${current.title}](${current.uri}) | \`${formatDuration(current.length)}\`\n\n**UP NEXT**\n${upcoming || '*The queue ends after this track.*'}`,
      thumbnail: current.thumbnail,
      footer: `Page ${requestedPage}/${totalPages} | ${player.queue.length + 1} total track(s)`,
    });

    return interaction.reply({ embeds: [embed] });
  },
};
