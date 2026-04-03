const { supabase } = require('../utils/supabase');

// Get or create user XP record
async function getOrCreateXP(guildId, userId) {
  let { data, error } = await supabase
    .from('xp')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Record doesn't exist, create it
    const { data: newData, error: createError } = await supabase
      .from('xp')
      .insert([
        {
          guild_id: guildId,
          user_id: userId,
          xp: 0,
          level: 0,
          last_xp_gain: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    return newData;
  }

  if (error) throw error;
  return data;
}

// Add XP to user
async function addXP(guildId, userId, amount) {
  const user = await getOrCreateXP(guildId, userId);
  const newXP = (user?.xp || 0) + amount;
  const newLevel = Math.floor(newXP / 100);

  const { data, error } = await supabase
    .from('xp')
    .update({
      xp: newXP,
      level: newLevel,
      last_xp_gain: new Date().toISOString(),
    })
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Set XP for user
async function setXP(guildId, userId, amount) {
  const newLevel = Math.floor(amount / 100);

  const { data, error } = await supabase
    .from('xp')
    .upsert({
      guild_id: guildId,
      user_id: userId,
      xp: amount,
      level: newLevel,
      last_xp_gain: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get leaderboard
async function getLeaderboard(guildId, limit = 10) {
  const { data, error } = await supabase
    .from('xp')
    .select('*')
    .eq('guild_id', guildId)
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

module.exports = {
  getOrCreateXP,
  addXP,
  setXP,
  getLeaderboard,
};