const { supabase } = require('../utils/supabase');

class UserFavorites {
  static async addFavorite(userId, songData) {
    const supportedSources = new Set(['youtube', 'spotify', 'soundcloud']);
    const source = supportedSources.has(songData.source) ? songData.source : 'youtube';

    const { data, error } = await supabase
      .from('user_favorites')
      .upsert({
        user_id: userId,
        song_name: songData.name,
        song_url: songData.url,
        artist_name: songData.uploader?.name || songData.artist || 'Unknown',
        source,
      }, { onConflict: 'user_id,song_url' })
      .select();

    if (error) throw error;
    await this.refreshFavoriteCount(userId);
    return data?.[0];
  }

  static async removeFavorite(userId, songUrl) {
    const { data, error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_url', songUrl)
      .select();

    if (error) throw error;
    await this.refreshFavoriteCount(userId);
    return data?.[0];
  }

  static async clearFavorites(userId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    await this.refreshFavoriteCount(userId);
    return data || [];
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
      console.error('[UserFavorites] Error fetching favorites:', error);
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
      return Boolean(data?.length);
    } catch (error) {
      console.error('[UserFavorites] Error checking favorite:', error);
      return false;
    }
  }

  static async recordPlay(userId, songData, duration = 0) {
    try {
      const { data: existing } = await supabase
        .from('user_music_stats')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (existing?.length) {
        await supabase
          .from('user_music_stats')
          .update({
            total_songs_played: (existing[0].total_songs_played || 0) + 1,
            total_duration_ms: (existing[0].total_duration_ms || 0) + duration,
            last_played_song: songData.name,
            most_played_artist: songData.uploader?.name || songData.artist || 'Unknown',
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
            favorite_count: 0,
            last_played_song: songData.name,
            most_played_artist: songData.uploader?.name || songData.artist || 'Unknown',
          });
      }
    } catch (error) {
      console.error('[UserFavorites] Error recording music stats:', error);
    }
  }

  static async refreshFavoriteCount(userId) {
    try {
      const { count, error: countError } = await supabase
        .from('user_favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      const { data: existing } = await supabase
        .from('user_music_stats')
        .select('user_id')
        .eq('user_id', userId)
        .limit(1);

      if (existing?.length) {
        await supabase
          .from('user_music_stats')
          .update({ favorite_count: count || 0, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_music_stats')
          .insert({ user_id: userId, favorite_count: count || 0 });
      }
    } catch (error) {
      console.error('[UserFavorites] Error refreshing favorite count:', error);
    }
  }
}

module.exports = UserFavorites;
