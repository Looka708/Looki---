const { supabase } = require('../utils/supabase');

class UserFavorites {
  static async addFavorite(userId, songData) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          song_name: songData.name,
          song_url: songData.url,
          artist_name: songData.uploader?.name || 'Unknown',
          source: songData.source || 'youtube',
        })
        .select();

      if (error) throw error;

      // Update stats
      await this.incrementStats(userId, songData);
      return data?.[0];
    } catch (error) {
      console.error('❌ [UserFavorites] Error adding favorite:', error);
      throw error;
    }
  }

  static async removeFavorite(userId, songUrl) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('song_url', songUrl)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('❌ [UserFavorites] Error removing favorite:', error);
      throw error;
    }
  }

  static async getFavorites(userId, limit = 10, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { favorites: data || [], total: count || 0 };
    } catch (error) {
      console.error('❌ [UserFavorites] Error fetching favorites:', error);
      return { favorites: [], total: 0 };
    }
  }

  static async isFavorite(userId, songUrl) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('song_url', songUrl)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('❌ [UserFavorites] Error checking favorite:', error);
      return false;
    }
  }

  static async incrementStats(userId, songData, duration = 0) {
    try {
      const { data: existing } = await supabase
        .from('user_music_stats')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from('user_music_stats')
          .update({
            total_songs_played: (existing[0].total_songs_played || 0) + 1,
            total_duration_ms: (existing[0].total_duration_ms || 0) + duration,
            favorite_count: (existing[0].favorite_count || 0) + 1,
            last_played_song: songData.name,
            most_played_artist: songData.uploader?.name || 'Unknown',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_music_stats')
          .insert({
            user_id: userId,
            total_songs_played: 1,
            total_duration_ms: duration,
            favorite_count: 1,
            last_played_song: songData.name,
            most_played_artist: songData.uploader?.name || 'Unknown',
          });
      }
    } catch (error) {
      console.error('❌ [UserFavorites] Error updating stats:', error);
    }
  }
}

module.exports = UserFavorites;
