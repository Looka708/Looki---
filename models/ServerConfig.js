const { supabase } = require('../utils/supabase');

// Get or create server config
async function getOrCreateConfig(guildId) {
  let { data, error } = await supabase
    .from('server_config')
    .select('*')
    .eq('guild_id', guildId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Config doesn't exist, create default
    const { data: newData, error: createError } = await supabase
      .from('server_config')
      .insert([
        {
          guild_id: guildId,
          modlog_channel: null,
          mute_role: null,
          autoroles: [],
          xp_blacklist_roles: [],
          xp_blacklist_channels: [],
          levelup_channel: null,
          levelup_message: '🎉 {user} just reached level {level}!',
          automod_enabled: false,
          automod_antilinks: false,
          automod_antiswear: false,
          automod_antispam: false,
          automod_antiraid: false,
          welcome_channel: null,
          welcome_message: null,
          welcome_card: false,
          goodbye_channel: null,
          goodbye_message: null,
          dm_welcome: false,
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

// Update server config
async function updateConfig(guildId, updates) {
  const { data, error } = await supabase
    .from('server_config')
    .update(updates)
    .eq('guild_id', guildId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Set specific config value
async function setConfigValue(guildId, key, value) {
  return updateConfig(guildId, { [key]: value });
}

module.exports = {
  getOrCreateConfig,
  updateConfig,
  setConfigValue,
};