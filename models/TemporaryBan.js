const { supabase } = require('../utils/supabase');

class TemporaryBan {
  static async createTempBan(guildId, userId, endTime, reason, bannedBy) {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .insert({
          guild_id: guildId,
          user_id: userId,
          reason: reason,
          moderator_id: bannedBy,
          type: 'ban',
          duration_ms: endTime.getTime() - Date.now(),
          expired: false,
          timestamp: endTime, // This will store the unban time
        })
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('❌ [TemporaryBan] Error creating temp ban:', error);
      throw error;
    }
  }

  static async getPendingBans(guildId) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('guild_id', guildId)
        .eq('type', 'ban')
        .eq('expired', false)
        .gt('timestamp', now); // WHERE timestamp > now

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [TemporaryBan] Error fetching pending bans:', error);
      return [];
    }
  }

  static async markAsExpired(id) {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .update({ expired: true })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('❌ [TemporaryBan] Error marking ban as expired:', error);
      throw error;
    }
  }

  static async getAllExpiredBans() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('type', 'ban')
        .eq('expired', false)
        .lt('timestamp', now); // WHERE timestamp < now

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [TemporaryBan] Error fetching expired bans:', error);
      return [];
    }
  }
}

module.exports = TemporaryBan;
