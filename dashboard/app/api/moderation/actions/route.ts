import { NextRequest, NextResponse } from 'next/server';
import { getModActions } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');
    const limit = request.nextUrl.searchParams.get('limit');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    const actions = await getModActions(guildId, limit ? parseInt(limit) : 50);

    return NextResponse.json({
      success: true,
      data: actions,
      count: actions?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching mod actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation actions' },
      { status: 500 }
    );
  }
}
