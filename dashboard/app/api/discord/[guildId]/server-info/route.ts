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
    const data: any = await fetchDiscord(`https://discord.com/api/v10/guilds/${guildId}`);
    const name = data?.name ?? 'Unknown';
    const memberCount = data?.approximate_member_count ?? data?.member_count ?? 0;
    return NextResponse.json({ name, memberCount });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch server info' }, { status: 500 });
  }
}
