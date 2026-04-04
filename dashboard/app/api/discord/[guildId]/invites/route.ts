import { NextResponse } from 'next/server';

async function fetchDiscord(url: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error('Discord bot token not configured');
  const res = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error: ${res.status} ${text}`);
  }
  return res.json();
}

export async function GET(_request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  try {
    const data: any = await fetchDiscord(`https://discord.com/api/v10/guilds/${guildId}/invites`);
    return NextResponse.json({ invites: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch invites' }, { status: 500 });
  }
}
