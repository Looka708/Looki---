const { supabase } = require('../utils/supabase');

// Create a new warning
async function createWarning(guildId, userId, reason, moderatorId, caseId, type = 'warn', durationMs = null) {
  const { data, error } = await supabase
    .from('warnings')
    .insert([
      {
        guild_id: guildId,
        user_id: userId,
        reason,
        moderator_id: moderatorId,
        case_id: caseId,
        type,
        duration_ms: durationMs,
        timestamp: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

// Get all warnings for a user
async function getUserWarnings(guildId, userId) {
  const { data, error } = await supabase
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get the next case ID
async function getNextCaseId(guildId) {
  const { data, error } = await supabase
    .from('warnings')
    .select('case_id')
    .eq('guild_id', guildId)
    .order('case_id', { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0]?.case_id || 0) + 1;
}

// Delete a specific warning
async function deleteWarning(caseId) {
  const { error } = await supabase
    .from('warnings')
    .delete()
    .eq('case_id', caseId);

  if (error) throw error;
  return true;
}

// Count warnings for a user
async function countUserWarnings(guildId, userId) {
  const { count, error } = await supabase
    .from('warnings')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId)
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

// Get warnings by type
async function getWarningsByType(guildId, type) {
  const { data, error } = await supabase
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId)
    .eq('type', type)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

module.exports = {
  createWarning,
  getUserWarnings,
  getNextCaseId,
  deleteWarning,
  countUserWarnings,
  getWarningsByType,
};