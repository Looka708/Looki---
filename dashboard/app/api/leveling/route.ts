import { NextRequest, NextResponse } from 'next/server';
import { getXPSettings, updateXPSettings, getLeaderboard, getUserXP } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

// GET XP settings or leaderboard
export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');
    const type = request.nextUrl.searchParams.get('type') || 'settings'; // settings or leaderboard
    const userId = request.nextUrl.searchParams.get('userId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    if (type === 'leaderboard') {
      const leaderboard = await getLeaderboard(guildId);
      return NextResponse.json({
        success: true,
        data: leaderboard,
        count: leaderboard?.length || 0,
      });
    } else if (type === 'user' && userId) {
      const userData = await getUserXP(guildId, userId);
      return NextResponse.json({
        success: true,
        data: userData,
      });
    } else {
      const settings = await getXPSettings(guildId);
      return NextResponse.json({
        success: true,
        data: settings,
      });
    }
  } catch (error) {
    console.error('Error fetching leveling data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leveling data' },
      { status: 500 }
    );
  }
}

// UPDATE XP settings
export async function PUT(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');
    const body = await request.json();

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateXPSettings(guildId, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'XP settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating XP settings:', error);
    return NextResponse.json(
      { error: 'Failed to update XP settings' },
      { status: 500 }
    );
  }
}
