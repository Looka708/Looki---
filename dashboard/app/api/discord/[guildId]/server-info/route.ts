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

export async function GET(_request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  try {
    const data: any = await fetchDiscord(`https://discord.com/api/v10/guilds/${guildId}`);
    const name = data?.name ?? 'Unknown';
    const memberCount = data?.approximate_member_count ?? data?.member_count ?? 0;
    return NextResponse.json({ name, memberCount });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch server info' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const { name } = body;
    if (!name) {
      return NextResponse.json({ updated: false, message: 'No name provided' });
    }
    // Try to update the server name via Discord API
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error('Discord bot token not configured');
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Discord API error: ${res.status} ${text}`);
    }
    const updated = await res.json?.();
    return NextResponse.json({ updated: true, name: updated?.name ?? name });
  } catch (err: any) {
    return NextResponse.json({ updated: false, error: err?.message ?? 'Failed to update server info' }, { status: 500 });
  }
}
