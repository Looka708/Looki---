import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

// GET server config
export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabaseClient()
      .from('server_config')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({
      success: true,
      data: data || {
        guild_id: guildId,
        prefix: 'p!',
        modlog_enabled: false,
        automod_enabled: false,
      },
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server config' },
      { status: 500 }
    );
  }
}

// UPDATE server config
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

    const { data, error } = await getSupabaseClient()
      .from('server_config')
      .upsert({
        guild_id: guildId,
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Server configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update server config' },
      { status: 500 }
    );
  }
}
