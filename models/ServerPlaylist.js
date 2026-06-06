const { supabase } = require('../utils/supabase');

class ServerPlaylist {
  static async create(guildId, creatorId, name) {
    const { data, error } = await supabase
      .from('server_playlists')
      .insert({ guild_id: guildId, creator_id: creatorId, name, songs: [] })
      .select();

    if (error) throw error;
    return data?.[0];
  }

  static async getByName(guildId, creatorId, name) {
    const { data, error } = await supabase
      .from('server_playlists')
      .select('*')
      .eq('guild_id', guildId)
      .eq('creator_id', creatorId)
      .ilike('name', name)
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  }

  static async list(guildId, creatorId) {
    const { data, error } = await supabase
      .from('server_playlists')
      .select('*')
      .eq('guild_id', guildId)
      .eq('creator_id', creatorId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addSong(guildId, creatorId, name, song) {
    const playlist = await this.getByName(guildId, creatorId, name);
    if (!playlist) return null;

    const songs = Array.isArray(playlist.songs) ? playlist.songs : [];
    const { data, error } = await supabase
      .from('server_playlists')
      .update({
        songs: [...songs, song],
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlist.id)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  static async removeSong(guildId, creatorId, name, position) {
    const playlist = await this.getByName(guildId, creatorId, name);
    if (!playlist) return { playlist: null, removed: null };

    const songs = Array.isArray(playlist.songs) ? [...playlist.songs] : [];
    const removed = songs.splice(position - 1, 1)[0] || null;
    if (!removed) return { playlist, removed: null };

    const { data, error } = await supabase
      .from('server_playlists')
      .update({ songs, updated_at: new Date().toISOString() })
      .eq('id', playlist.id)
      .eq('creator_id', creatorId)
      .select();

    if (error) throw error;
    return { playlist: data?.[0], removed };
  }

  static async clear(guildId, creatorId, name) {
    const playlist = await this.getByName(guildId, creatorId, name);
    if (!playlist) return null;

    const { data, error } = await supabase
      .from('server_playlists')
      .update({ songs: [], updated_at: new Date().toISOString() })
      .eq('id', playlist.id)
      .eq('creator_id', creatorId)
      .select();

    if (error) throw error;
    return data?.[0];
  }
}

module.exports = ServerPlaylist;
