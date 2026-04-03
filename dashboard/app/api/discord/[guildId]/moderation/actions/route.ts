import { NextResponse } from 'next/server';

async function fetchDiscord(url: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error('Discord bot token not configured');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error: ${res.status} ${text}`);
  }
  return res.json();
}

export async function GET({ params }: { params: { guildId: string } }) {
  const { guildId } = params;
  try {
    // Fetch audit logs for moderation actions
    const data: any = await fetchDiscord(`https://discord.com/api/v10/guilds/${guildId}/audit-logs?limit=50`);
    const entries = data?.audit_log_entries ?? data?.audit_logs?.entries ?? [];

    const actions = (entries || []).map((entry: any) => {
      const typeRaw = (entry.action_type ?? entry?.action?.type ?? 'BAN');
      const type = String(typeRaw).toUpperCase();
      const user = (entry.user?.username) ?? (entry.user?.id ?? 'Unknown');
      const userId = entry.user?.id ?? '';
      const mod = entry.user?.username ?? 'System';
      const modId = '';
      const reason = entry.reason ?? '';
      const timestamp = entry.created_at ?? new Date().toISOString();
      const id = String(entry.id ?? entry.time ?? Math.random()).slice(0, 20);
      return { id, type, user, userId, mod, modId, reason, duration: undefined, timestamp };
    });

    return NextResponse.json({ actions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch moderation actions' }, { status: 500 });
  }
}
