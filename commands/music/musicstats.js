const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { supabase } = require('../../utils/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('musicstats')
    .setDescription('📊 View your music listening statistics')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check stats for (default: yourself)')
    ),

  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const user = interaction.options.getUser('user') || interaction.user;

      const { data: stats, error } = await supabase
        .from('user_music_stats')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error && error.code !== 'PGRST116') throw error;

      if (!stats || stats.length === 0) {
        return await interaction.editReply({
          embeds: [createEmbed('music', client)
            .setTitle(`🎵 ${user.username}'s Music Stats`)
            .setDescription('No listening data yet! Start playing some songs.')]
        });
      }

      const stat = stats[0];
      const totalMins = Math.floor(stat.total_duration_ms / 60000);
      const totalHours = Math.floor(totalMins / 60);

      const embed = createEmbed('music', client)
        .setTitle(`🎵 ${user.username}'s Music Statistics`)
        .addFields(
          { name: '🎵 Total Songs Played', value: `**${stat.total_songs_played}**`, inline: true },
          { name: '❤️ Favorite Count', value: `**${stat.favorite_count}**`, inline: true },
          { name: '⏱️ Total Listening Time', value: `**${totalHours}h ${totalMins % 60}m**`, inline: true },
          { name: '🎤 Most Played Artist', value: `**${stat.most_played_artist || 'Unknown'}**`, inline: true },
          { name: '🎵 Last Played', value: `**${stat.last_played_song || 'None'}**`, inline: true },
          { name: '📅 Member Since', value: `**${new Date(stat.created_at).toLocaleDateString()}**`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in musicstats command:', error);
      await interaction.editReply({
        content: '❌ Failed to fetch music statistics'
      });
    }
  },
};
