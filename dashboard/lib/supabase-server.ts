/**
 * Server-side Supabase client using the SERVICE ROLE KEY.
 * This bypasses Row Level Security — only use in API routes, never in client code.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient;

  // Support both standard and NEXT_PUBLIC prefixed variables for deployment flexibility
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase configuration: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
    );
  }

  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return serverClient;
}

// ── Warning / Mod Action queries ───────────────────────────────

export interface WarningRow {
  id: number;
  guild_id: string;
  user_id: string;
  reason: string | null;
  moderator_id: string | null;
  case_id: number | null;
  type: 'warn' | 'mute' | 'kick' | 'ban';
  duration_ms: number | null;
  expired: boolean;
  timestamp: string;
  created_at: string;
}

/**
 * Get recent warnings for a guild.
 */
export async function getRecentWarnings(
  guildId: string,
  limit = 10
): Promise<WarningRow[]> {
  const { data, error } = await getSupabaseServer()
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching warnings:', error);
    return [];
  }
  return (data as WarningRow[]) ?? [];
}

/**
 * Get warning counts grouped by type for a guild.
 */
export async function getWarningCounts(
  guildId: string
): Promise<{ total: number; byType: Record<string, number> }> {
  const { data, error } = await getSupabaseServer()
    .from('warnings')
    .select('type')
    .eq('guild_id', guildId);

  if (error) {
    console.error('Error fetching warning counts:', error);
    return { total: 0, byType: {} };
  }

  const rows = data ?? [];
  const byType: Record<string, number> = {};
  for (const row of rows) {
    const t = (row as any).type || 'warn';
    byType[t] = (byType[t] || 0) + 1;
  }

  return { total: rows.length, byType };
}

/**
 * Get warnings grouped by hour for the last 24 hours.
 */
export async function getWarningsTimeline(
  guildId: string
): Promise<{ time: string; warnings: number }[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabaseServer()
    .from('warnings')
    .select('created_at')
    .eq('guild_id', guildId)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching warnings timeline:', error);
    return [];
  }

  // Group by 4-hour buckets
  const buckets: Record<string, number> = {};
  for (let h = 0; h < 24; h += 4) {
    const label = `${String(h).padStart(2, '0')}:00`;
    buckets[label] = 0;
  }

  for (const row of data ?? []) {
    const hour = new Date((row as any).created_at).getHours();
    const bucketHour = Math.floor(hour / 4) * 4;
    const label = `${String(bucketHour).padStart(2, '0')}:00`;
    buckets[label] = (buckets[label] || 0) + 1;
  }

  return Object.entries(buckets).map(([time, warnings]) => ({ time, warnings }));
}

// ── XP / Leaderboard queries ───────────────────────────────────

export interface XPRow {
  id: number;
  guild_id: string;
  user_id: string;
  xp: number;
  level: number;
  last_xp_gain: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get top users by XP for a guild.
 */
export async function getTopXPUsers(
  guildId: string,
  limit = 5
): Promise<XPRow[]> {
  const { data, error } = await getSupabaseServer()
    .from('xp')
    .select('*')
    .eq('guild_id', guildId)
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching XP leaderboard:', error);
    return [];
  }
  return (data as XPRow[]) ?? [];
}

/**
 * Get total XP users count for a guild (for stats).
 */
export async function getXPUserCount(guildId: string): Promise<number> {
  const { count, error } = await getSupabaseServer()
    .from('xp')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId);

  if (error) {
    console.error('Error fetching XP user count:', error);
    return 0;
  }
  return count ?? 0;
}
