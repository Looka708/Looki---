const { SlashCommandBuilder } = require('discord.js');
const UserFavorites = require('../../models/UserFavorites');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'favorites',
  data: new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('View or manage your favorite songs')
    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('Add the current song to your favorites'))
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('Show your favorite songs'))
    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('Remove a favorite by URL')
      .addStringOption(option => option
        .setName('url')
        .setDescription('Song URL to remove')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('clear')
      .setDescription('Clear all your favorite songs')),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'add') {
        const { player, error } = requirePlayer(interaction, client);
        if (error) return interaction.editReply({ embeds: [error] });

        const voiceCheck = requireSameVoice(interaction, client, player);
        if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

        const track = player.queue.current;
        const favorite = await UserFavorites.addFavorite(interaction.user.id, {
          name: track.title,
          url: track.uri,
          artist: track.author || 'Unknown',
          source: track.sourceName,
        });

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: 'Favorite saved',
            description: `Added **[${favorite.song_name}](${favorite.song_url})** to your favorites.`,
            thumbnail: track.thumbnail,
          })],
        });
      }

      if (subcommand === 'list') {
        const { favorites, total } = await UserFavorites.getFavorites(interaction.user.id, 10, 0);
        if (!favorites.length) {
          return interaction.editReply({
            embeds: [createMusicEmbed(client, {
              title: 'No favorites yet',
              description: 'Use `/favorites add` or the Favorite music button while a song is playing.',
            })],
          });
        }

        const list = favorites
          .map((favorite, index) => `\`${index + 1}.\` [${favorite.song_name}](${favorite.song_url}) | ${favorite.artist_name || 'Unknown'}`)
          .join('\n');

        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: `Your favorite songs (${total})`,
            description: list,
            footer: `Showing ${favorites.length} of ${total}`,
          })],
        });
      }

      if (subcommand === 'remove') {
        const url = interaction.options.getString('url', true).trim();
        const removed = await UserFavorites.removeFavorite(interaction.user.id, url);
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            type: removed ? undefined : 'error',
            title: removed ? 'Favorite removed' : 'Favorite not found',
            description: removed
              ? `Removed **${removed.song_name}** from your favorites.`
              : 'I could not find a favorite with that URL.',
          })],
        });
      }

      const removed = await UserFavorites.clearFavorites(interaction.user.id);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: 'Favorites cleared',
          description: removed.length
            ? `Removed **${removed.length}** favorite song(s).`
            : 'You did not have any favorites to clear.',
        })],
      });
    } catch (error) {
      console.error('Favorites command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Favorites failed',
          description: 'I could not update your favorites. Please try again.',
        })],
      });
    }
  },
};
