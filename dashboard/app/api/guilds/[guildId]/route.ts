import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const BOT_ID = process.env.NEXT_PUBLIC_BOT_ID || '1489310341115547788';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function checkBotInGuild(guildId: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${BOT_ID}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error(`Error checking bot in guild ${guildId}:`, error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const guildId = params.guildId;

    // Fetch user's guilds to verify access
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch guilds' },
        { status: response.status }
      );
    }

    const guilds = await response.json();
    const guild = guilds.find((g: any) => g.id === guildId);

    // Check if user is owner or has MANAGE_GUILD permission (0x20)
    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found', message: 'You do not have access to this server' },
        { status: 404 }
      );
    }

    const hasPermission = guild.owner || (parseInt(guild.permissions || guild.permissions_new || '0') & 0x20) === 0x20;

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to manage this server' },
        { status: 403 }
      );
    }

    // Check if bot is in the guild
    const botInGuild = await checkBotInGuild(guildId);

    if (!botInGuild) {
      return NextResponse.json(
        { error: 'Bot not in guild', message: 'Looki is not in this server' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon 
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` 
          : null,
        owner: guild.owner,
        permissions: parseInt(guild.permissions || guild.permissions_new || '0'),
        botPresent: true,
      },
    });
  } catch (error) {
    console.error('Guild validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
