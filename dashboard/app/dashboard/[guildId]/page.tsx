'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardHeader, CardBody, StatCard, Badge, Button } from '@/components/ui';
import { CuteTable } from '@/components/CuteComponents';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiShield, FiVolume2, FiX } from 'react-icons/fi';

const activityChartData = [
  { hour: '00', messages: 45, commands: 12 },
  { hour: '04', messages: 32, commands: 8 },
  { hour: '08', messages: 120, commands: 35 },
  { hour: '12', messages: 280, commands: 78 },
  { hour: '16', messages: 350, commands: 105 },
  { hour: '20', messages: 290, commands: 82 },
];

const leaderboardData = [
  { rank: 1, name: 'Alice#0001', level: 42, xp: 8420, progress: 84 },
  { rank: 2, name: 'Bob#0002', level: 38, xp: 7190, progress: 72 },
  { rank: 3, name: 'Charlie#0003', level: 35, xp: 6540, progress: 65 },
  { rank: 4, name: 'Diana#0004', level: 32, xp: 5890, progress: 59 },
  { rank: 5, name: 'Eve#0005', level: 28, xp: 4820, progress: 48 },
];

const recentActions = [
  { id: '042', type: 'BAN', user: 'BadUser#0001', mod: 'Mod#0001', reason: 'spamming', time: '2h ago' },
  { id: '041', type: 'WARN', user: 'NewUser#0002', mod: 'Mod#0002', reason: 'bad vibes', time: '3h ago' },
  { id: '040', type: 'MUTE', user: 'Rowdy#0003', mod: 'Mod#0001', reason: '1h cooldown', time: '5h ago' },
  { id: '039', type: 'KICK', user: 'Temp#0004', mod: 'Mod#0003', reason: 'trial over', time: '1d ago' },
];

const messageDistributionData = [
  { name: 'General', value: 4500, color: '#FFB6C1' },
  { name: 'Gaming', value: 3200, color: '#C8A2C8' },
  { name: 'Music', value: 2100, color: '#FFCBA4' },
  { name: 'Art', value: 1800, color: '#B5EAD7' },
  { name: 'Off-topic', value: 1200, color: '#AEC6CF' },
];

const COLORS = ['#FFB6C1', '#C8A2C8', '#FFCBA4', '#B5EAD7', '#AEC6CF'];

export default function DashboardOverview({ params }: { params: { guildId: string } }) {
  const { data: session } = useSession();
  const [guild, setGuild] = useState<{ name: string; icon: string | null; approximate_member_count?: number; approximate_presence_count?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [guildId, setGuildId] = useState<string>('');

  // Resolve params to get guildId
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      setGuildId(resolved?.guildId || '');
    };
    resolveParams();
  }, [params]);

  // Fetch guild info
  useEffect(() => {
    async function fetchGuildInfo() {
      try {
        // Await params if it's a promise
        const resolvedParams = await Promise.resolve(params);
        const resolvedGuildId = resolvedParams?.guildId;
        
        if (!resolvedGuildId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/guilds/${resolvedGuildId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.guild) {
            setGuild(data.guild);
          }
        }
      } catch (error) {
        console.error('Failed to fetch guild details', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuildInfo();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-border-subtle border-t-pink rounded-full animate-spin" />
      </div>
    );
  }

  const iconUrl = guild?.icon;
  
  return (
    <div className="min-h-screen bg-bg-base relative z-5 animate-fade-in">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Overview' }]} />
      </div>

      <div className="px-8 py-6">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-1">
          overview <span className="text-pink">✦</span>
        </h1>
        <p className="text-sm text-text-secondary font-script">welcome back, manager</p>
      </div>

      <div className="px-8 pb-8 animate-slide-in-up">
        <div
          className="h-44 rounded-2xl bg-gradient-to-r from-pink/20 to-lavender/20 border border-border-default p-8 flex items-end relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(13,12,17,0.9) 0%, transparent 60%)`,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              {iconUrl ? (
                <img src={iconUrl} alt={guild?.name} className="w-20 h-20 rounded-full ring-4 ring-pink/20 shadow-glow flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink to-lavender ring-4 ring-pink/20 flex items-center justify-center text-3xl shadow-glow">
                  🌸
                </div>
              )}
              <div>
                <h2 className="text-3xl font-display font-bold">{guild?.name || 'Unknown Server'}</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Ready to manage via Looki
                </p>
              </div>
            </div>
          </div>
          <a href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot&guild_id=${guildId}`} target="_blank" rel="noreferrer">
            <button className="absolute top-6 right-6 btn-ghost text-sm border-pink/50 hover:bg-pink hover:text-bg-void transition-colors">
              Manage Server Invite
            </button>
          </a>
        </div>
      </div>

      <div className="px-8 pb-8 stagger-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div className="animate-slide-in-up">
            <StatCard icon="👥" label="Members" value={guild?.approximate_member_count?.toString() || "1,340"} trend={12} variant="default" />
          </motion.div>
          <motion.div className="animate-slide-in-up" style={{ animationDelay: '50ms' }}>
            <StatCard icon="⚡" label="Active" value={guild?.approximate_presence_count?.toString() || "520"} trend={5} variant="success" />
          </motion.div>
          <motion.div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <StatCard icon="⚠️" label="Warnings" value="28" trend={-3} variant="info" />
          </motion.div>
          <motion.div className="animate-slide-in-up" style={{ animationDelay: '150ms' }}>
            <StatCard icon="💬" label="Commands Run" value="891" trend={23} variant="default" />
          </motion.div>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <Link href={`/dashboard/${params.guildId}/giveaways`}>
          <Button variant="primary">+ Create Giveaway</Button>
        </Link>
        <Link href={`/dashboard/${params.guildId}/moderation`}>
          <Button variant="ghost">🛡️ Moderation</Button>
        </Link>
        <Link href={`/dashboard/${params.guildId}/settings`}>
          <Button variant="ghost">⚙️ Settings</Button>
        </Link>
      </div>

      <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <CardHeader
              title="recent actions ✦"
              action={<Link href={`/dashboard/${guildId}/moderation`} className="text-sm text-pink hover:text-pink-dim">View All →</Link>}
            />
            <CardBody>
              <CuteTable
                columns={[
                  { key: 'id', label: '#', width: '60px' },
                  { 
                    key: 'type', 
                    label: 'Type',
                    icon: <FiShield />,
                    render: (value) => (
                      <Badge type={value.toLowerCase() === 'ban' ? 'ban' : value.toLowerCase() === 'kick' ? 'kick' : value.toLowerCase() === 'mute' ? 'mute' : 'warn'}>
                        {value}
                      </Badge>
                    )
                  },
                  { key: 'user', label: 'User' },
                  { key: 'mod', label: 'Moderator' },
                  { key: 'reason', label: 'Reason' },
                  { 
                    key: 'time', 
                    label: 'Time',
                    icon: <FiAlertCircle />
                  },
                ]}
                data={recentActions}
                emptyMessage="No recent actions"
                striped
              />
            </CardBody>
          </GlassCard>

          <GlassCard>
            <CardHeader title="server activity ✦" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,182,193,0.1)" />
                  <XAxis dataKey="hour" stroke="#9B8FAE" />
                  <YAxis stroke="#9B8FAE" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#13111A',
                      border: '1px solid rgba(255,182,193,0.14)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#FFB6C1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#FFB6C1' }}
                    activeDot={{ r: 6 }}
                    name="Messages"
                  />
                  <Line
                    type="monotone"
                    dataKey="commands"
                    stroke="#C8A2C8"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#C8A2C8' }}
                    activeDot={{ r: 6 }}
                    name="Commands"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard>
            <CardHeader
              title="top members ✦"
              action={<Link href={`/dashboard/${params.guildId}/leveling`} className="text-sm text-pink hover:text-pink-dim">Full Leaderboard →</Link>}
            />
            <CardBody>
              <div className="space-y-3">
                {leaderboardData.map((member) => (
                  <div key={member.rank} className="flex items-center gap-3 pb-3 border-b border-border-subtle last:border-b-0">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-pink to-lavender text-bg-base">
                      {member.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                      <div className="text-xs text-text-tertiary">Lv.{member.level}</div>
                    </div>
                    <p className="text-xs text-text-secondary font-mono">{member.xp.toLocaleString()} XP</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </GlassCard>

          <GlassCard>
            <CardHeader title="message distribution" />
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={messageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {messageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#13111A',
                      border: '1px solid rgba(255,182,193,0.14)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </GlassCard>

          <GlassCard>
            <CardHeader title="bot health ✦" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-text-secondary">Uptime</span>
                    <span className="text-sm font-medium text-text-primary">99.8%</span>
                  </div>
                  <div className="w-full h-2 bg-bg-overlay rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-mint to-mint/50 rounded-full" style={{ width: '99.8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-text-secondary">Latency</span>
                    <span className="text-sm font-medium text-text-primary">42ms 🟢</span>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-text-secondary mb-1">Commands today</p>
                  <p className="text-2xl font-display font-bold text-text-primary">891</p>
                </div>
              </div>
            </CardBody>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
