import { NextRequest, NextResponse } from 'next/server';
import { getGuildAnalytics, getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

interface Warning {
  type: 'ban' | 'kick' | 'mute' | 'warn';
  [key: string]: any;
}

interface XPData {
  total_xp: number;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');
    const period = request.nextUrl.searchParams.get('period') || '7d'; // 7d, 30d, all

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate = new Date('2000-01-01');
    }

    const analytics = await getGuildAnalytics(guildId);

    // Fetch detailed analytics data
    const { data: warningsData } = await getSupabaseClient()
      .from('warnings')
      .select('*')
      .eq('guild_id', guildId)
      .gte('created_at', startDate.toISOString());

    const { data: xpData } = await getSupabaseClient()
      .from('xp')
      .select('*')
      .eq('guild_id', guildId)
      .gte('updated_at', startDate.toISOString());

    const warnings = (warningsData || []) as Warning[];
    const xp = (xpData || []) as XPData[];

    // Count warnings by type
    const warningsByType = {
      ban: warnings.filter(w => w.type === 'ban').length || 0,
      kick: warnings.filter(w => w.type === 'kick').length || 0,
      mute: warnings.filter(w => w.type === 'mute').length || 0,
      warn: warnings.filter(w => w.type === 'warn').length || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        period,
        warningsByType,
        recentWarnings: warnings.slice(0, 10) || [],
        topMembers: xp.slice(0, 10) || [],
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
