const { SlashCommandBuilder } = require('discord.js');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the current and upcoming songs'),

  async execute(interaction, client) {
    const player = client.kazagumo.players.get(interaction.guildId);
    if (!player?.queue?.current) {
      return interaction.reply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'The queue is empty',
          description: 'Add a song with `/play` and it will appear here.',
        })],
        ephemeral: true,
      });
    }

    const current = player.queue.current;
    const upcoming = player.queue.slice(0, 10)
      .map((track, index) =>
        `\`${String(index + 1).padStart(2, '0')}\` [${track.title}](${track.uri}) • ${track.author || 'Unknown'} • \`${formatDuration(track.length)}\``)
      .join('\n');

    const embed = createMusicEmbed(client, {
      title: '🎶 Music Queue',
      description: `**NOW PLAYING**\n[${current.title}](${current.uri}) • \`${formatDuration(current.length)}\`\n\n**UP NEXT**\n${upcoming || '*The queue ends after this track.*'}`,
      thumbnail: current.thumbnail,
      footer: `${player.queue.length + 1} total track(s) • Showing up to 10`,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
