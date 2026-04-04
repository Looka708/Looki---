import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getGuildInfo, getAuditLog, discordBotFetch } from '@/lib/discord-helpers';
import { 
  getWarningCounts, 
  getWarningsTimeline, 
  getTopXPUsers, 
  getXPUserCount,
  getRecentWarnings
} from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;

    // 1. Fetch Discord Guild Info (with member counts)
    const guildInfo = await getGuildInfo(guildId).catch(err => {
      console.error('Error fetching guild info:', err);
      return null;
    });

    // 2. Fetch Supabase Stats (Warnings, XP)
    const warningStats = await getWarningCounts(guildId);
    await getXPUserCount(guildId); // Just fetch for cache/validation if needed, or remove if truly not needed
    const timeline = await getWarningsTimeline(guildId);
    const leaderboardRaw = await getTopXPUsers(guildId, 5);
    const recentSupabaseWarnings = await getRecentWarnings(guildId, 10);

    // 3. Fetch Discord Audit Logs (Recent Actions)
    const auditLogData = await getAuditLog(guildId, { limit: 10 }).catch(err => {
      console.error('Error fetching audit logs:', err);
      return { audit_log_entries: [], users: [] };
    });

    // 4. Resolve Leaderboard Usernames (Optional: ideally cached or stored in DB)
    // For now, we'll just use the user_ids and maybe fetch them or use what we have in Supabase if stored
    const leaderboard = leaderboardRaw.map((u, idx) => ({
      rank: idx + 1,
      id: u.user_id,
      name: `User ${u.user_id.slice(-4)}`, // Placeholder until we get usernames
      level: u.level,
      xp: u.xp,
      progress: Math.min(100, Math.floor((u.xp % 1000) / 10)) // Simple progress calc
    }));

    // 5. Format Audit Log + Supabase Warnings for the UI
    const recentActions = [
      ...recentSupabaseWarnings.map(w => ({
        id: `w-${w.id}`,
        type: w.type.toUpperCase(),
        user: `User ${w.user_id.slice(-4)}`,
        userId: w.user_id,
        mod: `Mod ${w.moderator_id?.slice(-4) || 'System'}`,
        reason: w.reason || 'No reason provided',
        time: formatRelativeTime(new Date(w.created_at))
      })),
      ...auditLogData.audit_log_entries
        .filter(entry => [20, 22].includes(entry.action_type)) // Kick, Ban
        .map(entry => {
          const user = auditLogData.users.find(u => u.id === entry.target_id);
          const mod = auditLogData.users.find(u => u.id === entry.user_id);
          return {
            id: `a-${entry.id}`,
            type: entry.action_type === 20 ? 'KICK' : 'BAN',
            user: user ? `${user.username}` : `User ${entry.target_id?.slice(-4)}`,
            userId: entry.target_id,
            mod: mod ? `${mod.username}` : 'Discord System',
            reason: entry.reason || 'Discord audit log entry',
            time: 'Recently' // Discord doesn't give precise timestamps in the simple entry without more parsing
          };
        })
    ].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10);

    // 6. Fetch Channel Distribution (Simple counts by type for the pie chart)
    const channels = await discordBotFetch(`/guilds/${guildId}/channels`).catch(() => []);
    const channelTypes = {
      0: 'Text',
      2: 'Voice',
      4: 'Category',
      5: 'News',
      15: 'Forum'
    };
    const distribution = Object.entries(
      channels.reduce((acc: any, c: any) => {
        const typeName = (channelTypes as any)[c.type] || 'Other';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value], idx) => ({
      name,
      value,
      color: ['#E85D75', '#9B6BA8', '#E8A85C', '#4ECB71', '#5BA3C7'][idx % 5]
    }));

    return NextResponse.json({
      success: true,
      data: {
        guild: {
          name: guildInfo?.name || 'Unknown',
          icon: guildInfo?.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guildInfo.icon}.webp` : null,
          memberCount: guildInfo?.approximate_member_count || 0,
          presenceCount: guildInfo?.approximate_presence_count || 0,
        },
        stats: {
          members: guildInfo?.approximate_member_count || 0,
          active: guildInfo?.approximate_presence_count || 0,
          commands: 0, // Not tracked yet
          warnings: warningStats.total,
        },
        timeline: timeline.length > 0 ? timeline : [
          { time: '00:00', warnings: 0 },
          { time: '04:00', warnings: 0 },
          { time: '08:00', warnings: 0 },
          { time: '12:00', warnings: 0 },
          { time: '16:00', warnings: 0 },
          { time: '20:00', warnings: 0 },
        ],
        leaderboard: leaderboard.length > 0 ? leaderboard : [],
        recentActions,
        distribution: distribution.length > 0 ? distribution : [
          { name: 'Channels', value: channels.length || 1, color: '#E85D75' }
        ]
      }
    });

  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
