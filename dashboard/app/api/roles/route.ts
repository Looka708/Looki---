import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

interface ServerConfig {
  reaction_roles?: any[];
  button_roles?: any[];
  auto_roles?: any[];
  [key: string]: any;
}

// GET roles for a guild
export async function GET(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    const { data } = await getSupabaseClient()
      .from('server_config')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    const config = (data || {}) as ServerConfig;

    return NextResponse.json({
      success: true,
      data: {
        reactionRoles: config.reaction_roles || [],
        buttonRoles: config.button_roles || [],
        autoRoles: config.auto_roles || [],
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// CREATE or UPDATE roles
export async function POST(request: NextRequest) {
  try {
    const guildId = request.nextUrl.searchParams.get('guildId');
    const type = request.nextUrl.searchParams.get('type'); // reaction, button, auto
    const body = await request.json();

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    const updateField = `${type}_roles`;

    const { data, error } = await getSupabaseClient()
      .from('server_config')
      .select(updateField)
      .eq('guild_id', guildId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const config = (data || {}) as ServerConfig;
    const existingRolesRaw = config[updateField as keyof ServerConfig];
    const existingRoles = Array.isArray(existingRolesRaw) ? existingRolesRaw : [];
    const updatedRoles = [...existingRoles, body];

    const { data: updated, error: updateError } = await getSupabaseClient()
      .from('server_config')
      .upsert({
        guild_id: guildId,
        [updateField]: updatedRoles,
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: updated,
      message: `${type} role created successfully`,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
