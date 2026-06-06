const { supabase } = require('../utils/supabase');

class ServerMusicSettings {
  static async getSettings(guildId) {
    try {
      let { data, error } = await supabase
        .from('server_music_settings')
        .select('*')
        .eq('guild_id', guildId)
        .limit(1);

      if (error && error.code !== 'PGRST116') throw error;

      if (!data || data.length === 0) {
        // Create default settings
        const defaults = {
          guild_id: guildId,
          default_volume: 50,
          announce_songs: true,
          autoplay_enabled: false,
          stay_247: false,
          bitrate_quality: 'high',
          loop_default_mode: 0,
        };

        const { data: created, error: createError } = await supabase
          .from('server_music_settings')
          .insert([defaults])
          .select();

        if (createError) throw createError;
        return created?.[0] || defaults;
      }

      return data[0];
    } catch (error) {
      console.error('❌ [ServerMusicSettings] Error fetching settings:', error);
      return null;
    }
  }

  static async updateSetting(guildId, setting, value) {
    try {
      const { data, error } = await supabase
        .from('server_music_settings')
        .update({ [setting]: value, updated_at: new Date().toISOString() })
        .eq('guild_id', guildId)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error(`❌ [ServerMusicSettings] Error updating ${setting}:`, error);
      throw error;
    }
  }

  static async setDJRole(guildId, roleId) {
    return this.updateSetting(guildId, 'dj_role_id', roleId);
  }

  static async toggleAnnouncements(guildId) {
    const settings = await this.getSettings(guildId);
    return this.updateSetting(guildId, 'announce_songs', !settings.announce_songs);
  }

  static async setDefaultVolume(guildId, volume) {
    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }
    return this.updateSetting(guildId, 'default_volume', volume);
  }

  static async set247Mode(guildId, enabled, voiceChannelId = null, textChannelId = null) {
    const { data, error } = await supabase
      .from('server_music_settings')
      .upsert({
        guild_id: guildId,
        stay_247: enabled,
        music_channel_id: enabled ? voiceChannelId : null,
        music_text_channel_id: enabled ? textChannelId : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'guild_id' })
      .select();

    if (error) throw error;
    return data?.[0];
  }

  static async get247Guilds() {
    const { data, error } = await supabase
      .from('server_music_settings')
      .select('*')
      .eq('stay_247', true);

    if (error) throw error;
    return data || [];
  }
}

module.exports = ServerMusicSettings;
