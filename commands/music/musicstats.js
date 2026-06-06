const { SlashCommandBuilder } = require('discord.js');
const { supabase } = require('../../utils/supabase');
const { createMusicEmbed, formatDuration } = require('../../utils/musicEmbed');

module.exports = {
  name: 'musicstats',
  data: new SlashCommandBuilder()
    .setName('musicstats')
    .setDescription('View music listening statistics')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to check stats for')),

  async execute(interaction, client) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') || interaction.user;

    try {
      const { data: stats, error } = await supabase
        .from('user_music_stats')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      if (!stats?.length) {
        return interaction.editReply({
          embeds: [createMusicEmbed(client, {
            title: `${user.username}'s music stats`,
            description: 'No listening data yet. Play a few songs and check again.',
          }).setThumbnail(user.displayAvatarURL({ dynamic: true }))],
        });
      }

      const stat = stats[0];
      const embed = createMusicEmbed(client, {
        title: `${user.username}'s music statistics`,
        description: 'Here is the current listening snapshot.',
      })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Songs played', value: `${stat.total_songs_played || 0}`, inline: true },
          { name: 'Favorites', value: `${stat.favorite_count || 0}`, inline: true },
          { name: 'Listening time', value: formatDuration(stat.total_duration_ms || 0), inline: true },
          { name: 'Top artist', value: stat.most_played_artist || 'Unknown', inline: true },
          { name: 'Last played', value: stat.last_played_song || 'None', inline: true },
          { name: 'Tracking since', value: new Date(stat.created_at).toLocaleDateString(), inline: true },
        );

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Musicstats command error:', error);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Stats failed',
          description: `I could not fetch music stats:\n\`${error.message}\``,
        })],
      });
    }
  },
};
