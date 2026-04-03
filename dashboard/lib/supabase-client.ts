import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

/**
 * Fetch mod actions from Supabase with optional filtering
 */
export async function getModActions(guildId: string, limit = 50) {
  const { data, error } = await getSupabaseClient()
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get XP settings for a guild
 */
export async function getXPSettings(guildId: string) {
  const { data, error } = await getSupabaseClient()
    .from('server_config')
    .select('*')
    .eq('guild_id', guildId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Update XP settings for a guild
 */
export async function updateXPSettings(guildId: string, settings: Record<string, any>) {
  const { data, error } = await getSupabaseClient()
    .from('server_config')
    .upsert({
      guild_id: guildId,
      ...settings,
      updated_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get leaderboard for a guild
 */
export async function getLeaderboard(guildId: string, limit = 50) {
  const { data, error } = await getSupabaseClient()
    .from('xp')
    .select('*')
    .eq('guild_id', guildId)
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get user's XP data
 */
export async function getUserXP(guildId: string, userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('xp')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get analytics for a guild
 */
export async function getGuildAnalytics(guildId: string) {
  const { data: warnings } = await getSupabaseClient()
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId);

  const { data: xp } = await getSupabaseClient()
    .from('xp')
    .select('*')
    .eq('guild_id', guildId);

  return {
    totalWarnings: warnings?.length || 0,
    totalMembers: xp?.length || 0,
    totalXPGiven: xp?.reduce((sum, u: any) => sum + (u.total_xp || 0), 0) || 0,
  };
}
