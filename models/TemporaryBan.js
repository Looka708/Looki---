const { supabase } = require('../utils/supabase');

class TemporaryBan {
  static async createTempBan(guildId, userId, endTime, reason, bannedBy, caseId) {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .insert({
          guild_id: guildId,
          user_id: userId,
          reason,
          moderator_id: bannedBy,
          case_id: caseId,
          type: 'ban',
          duration_ms: endTime.getTime() - Date.now(),
          expired: false,
          timestamp: endTime,
        })
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('[TemporaryBan] Error creating temp ban:', error);
      throw error;
    }
  }

  static async getPendingBans(guildId) {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('guild_id', guildId)
        .eq('type', 'ban')
        .not('duration_ms', 'is', null)
        .eq('expired', false)
        .gt('timestamp', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[TemporaryBan] Error fetching pending bans:', error);
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
      console.error('[TemporaryBan] Error marking ban as expired:', error);
      throw error;
    }
  }

  static async getAllExpiredBans() {
    try {
      const { data, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('type', 'ban')
        .not('duration_ms', 'is', null)
        .eq('expired', false)
        .lt('timestamp', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[TemporaryBan] Error fetching expired bans:', error);
      return [];
    }
  }
}

module.exports = TemporaryBan;
