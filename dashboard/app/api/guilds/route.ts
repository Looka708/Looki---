import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const BOT_ID = process.env.NEXT_PUBLIC_BOT_ID || '1489310341115547788';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  permissions_new?: string;
}

async function checkBotInGuild(guildId: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn('DISCORD_BOT_TOKEN not configured, skipping bot presence check');
    return false;
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${BOT_ID}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    // 200 = bot is in guild, 404 = bot not in guild
    return response.status === 200;
  } catch (error) {
    console.error(`Error checking bot in guild ${guildId}:`, error);
    return false;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('No session found in /api/guilds');
      return NextResponse.json(
        { error: 'Unauthorized - Not authenticated' },
        { status: 401 }
      );
    }

    if (!session.accessToken) {
      console.error('No access token in session. Session:', JSON.stringify(session, null, 2));
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    console.log('Session found, fetching guilds for user:', session.user?.id);
    console.log('Access token (first 20 chars):', session.accessToken.substring(0, 20) + '...');

    // Fetch user's guilds from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', response.status, response.statusText);
      console.error('Discord error body:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch guilds from Discord' },
        { status: response.status }
      );
    }

    const guilds: DiscordGuild[] = await response.json();
    console.log('Fetched', guilds.length, 'guilds from Discord API');

    // Filter and format guilds
    const manageable = guilds
      .filter((g) => g.owner || (parseInt(g.permissions || g.permissions_new || '0') & 0x20) === 0x20)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log('User can manage', manageable.length, 'guilds');

    // Check bot presence in each manageable guild
    const guildPromises = manageable.map(async (guild) => {
      const hasBot = await checkBotInGuild(guild.id);
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon 
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` 
          : null,
        owner: guild.owner,
        permissions: parseInt(guild.permissions || guild.permissions_new || '0'),
        looki: hasBot, // Bot presence indicator
      };
    });

    const formattedGuilds = await Promise.all(guildPromises);
    console.log('Formatted guilds:', formattedGuilds.length);

    return NextResponse.json({
      success: true,
      guilds: formattedGuilds,
      total: formattedGuilds.length,
    });
  } catch (error) {
    console.error('Guilds endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
