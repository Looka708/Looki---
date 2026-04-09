const { SlashCommandBuilder } = require('discord.js');
const UserFavorites = require('../../models/UserFavorites');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('🤍 View your liked songs or manage favorites')
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Show your favorite songs (first 10)')
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear all your favorite songs')
    ),

  async execute(interaction, client) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'list') {
        await interaction.deferReply();

        const { favorites, total } = await UserFavorites.getFavorites(interaction.user.id, 10, 0);

        if (favorites.length === 0) {
          return await interaction.editReply({
            embeds: [createEmbed('music', client)
              .setTitle('💔 No Favorites Yet')
              .setDescription('Like songs with the ❤️ button while they\'re playing!')]
          });
        }

        const favoritesList = favorites
          .map((fav, idx) => `**${idx + 1}.** [${fav.song_name}](${fav.song_url})\n🎵 ${fav.artist_name}`)
          .join('\n\n');

        const embed = createEmbed('music', client)
          .setTitle(`🤍 Your Favorite Songs (${total})`)
          .setDescription(favoritesList)
          .setFooter({ text: `Showing first 10 of ${total}` });

        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'clear') {
        await interaction.deferReply();

        const { total } = await UserFavorites.getFavorites(interaction.user.id, 1, 0);
        
        if (total === 0) {
          return await interaction.editReply({
            content: '💔 You have no favorite songs to clear!'
          });
        }

        // In a real implementation, we'd want a confirmation button
        // For now, we'll just show a message
        await interaction.editReply({
          content: `⚠️ This would clear all ${total} favorites. Command requires confirmation (feature coming soon!)`
        });
      }
    } catch (error) {
      console.error('Error in favorites command:', error);
      await interaction.reply({
        content: '❌ Failed to manage favorites',
        ephemeral: true
      });
    }
  },
};
