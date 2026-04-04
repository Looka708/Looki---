/**
 * Shared Discord Bot API helpers for server-side API routes.
 * Uses the bot token – NEVER import this from client components.
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error('DISCORD_BOT_TOKEN is not configured');
  return token;
}

/**
 * Generic fetch wrapper for Discord Bot API calls.
 * Automatically adds Bot authorization and handles errors.
 */
export async function discordBotFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith('http') ? path : `${DISCORD_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bot ${getBotToken()}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // Revalidate every 30 seconds max
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API ${res.status}: ${text}`);
  }

  return res.json();
}

// ── Guild helpers ──────────────────────────────────────────────

export interface DiscordGuildPreview {
  id: string;
  name: string;
  icon: string | null;
  member_count?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  channels?: any[];
}

/**
 * Fetch guild info with member counts.
 */
export async function getGuildInfo(guildId: string): Promise<DiscordGuildPreview> {
  return discordBotFetch<DiscordGuildPreview>(
    `/guilds/${guildId}?with_counts=true`
  );
}

// ── Audit Log helpers ──────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action_type: number;
  user_id: string;
  target_id: string | null;
  reason: string | null;
  user?: { id: string; username: string; discriminator: string; avatar: string | null };
  changes?: any[];
}

export interface AuditLogResponse {
  audit_log_entries: AuditLogEntry[];
  users: { id: string; username: string; discriminator: string; avatar: string | null }[];
}

// Discord audit log action type constants for moderation
export const MOD_ACTION_TYPES = {
  MEMBER_BAN_ADD: 22,
  MEMBER_BAN_REMOVE: 23,
  MEMBER_KICK: 20,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 25,
} as const;

/**
 * Fetch audit log entries for a guild.
 */
export async function getAuditLog(
  guildId: string,
  options?: { limit?: number; actionType?: number }
): Promise<AuditLogResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(options?.limit ?? 20));
  if (options?.actionType !== undefined) {
    params.set('action_type', String(options.actionType));
  }

  return discordBotFetch<AuditLogResponse>(
    `/guilds/${guildId}/audit-logs?${params.toString()}`
  );
}

// ── Channel helpers ────────────────────────────────────────────

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id: string | null;
}

/**
 * Fetch all channels in a guild.
 */
export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  return discordBotFetch<DiscordChannel[]>(`/guilds/${guildId}/channels`);
}

// ── User helpers ───────────────────────────────────────────────

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

/**
 * Fetch a Discord user by ID.
 */
export async function getUser(userId: string): Promise<DiscordUser> {
  return discordBotFetch<DiscordUser>(`/users/${userId}`);
}
