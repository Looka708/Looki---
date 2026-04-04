'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, StatCard, Badge, Button } from '@/components/ui';
import { CuteTable } from '@/components/CuteComponents';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiShield, FiTrendingUp, FiActivity, FiUsers, FiMessageCircle, FiCommand, FiArrowUpRight, FiZap, FiRefreshCw } from 'react-icons/fi';
import { useParams } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface DashboardData {
  guild: {
    name: string;
    icon: string | null;
    memberCount: number;
    presenceCount: number;
  };
  stats: {
    members: number;
    active: number;
    commands: number;
    warnings: number;
  };
  timeline: { time: string; warnings: number }[];
  leaderboard: { rank: number; id: string; name: string; level: number; xp: number; progress: number }[];
  recentActions: { id: string; type: string; user: string; userId: string; mod: string; reason: string; time: string }[];
  distribution: { name: string; value: number; color: string }[];
}

export default function DashboardOverview() {
  const params = useParams();
  const guildId = params.guildId as string;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await fetch(`/api/discord/${guildId}/overview`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error(json.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [guildId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-border-subtle border-t-pink rounded-full animate-spin shadow-glow-pink" />
        <p className="text-sm font-medium text-text-secondary animate-pulse">Initializing Looki Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-2xl font-display font-bold text-text-primary">Something went wrong</h2>
        <p className="text-text-secondary max-w-md">{error || 'Could not load data for this server. Please try again later.'}</p>
        <Button 
          variant="primary" 
          onClick={() => fetchData()} 
          className="mt-4 flex items-center gap-2"
        >
          <FiRefreshCw /> Try Again
        </Button>
      </div>
    );
  }

  const { guild, stats, timeline, leaderboard, recentActions, distribution } = data;

  return (
    <div className="min-h-screen bg-bg-base relative z-5 overflow-hidden font-body">
      {/* Background Ambience */}
      <div className="bg-aww pointer-events-none fixed inset-0 opacity-40 mix-blend-multiply">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
      </div>

      <div className="relative z-10 px-6 sm:px-10 pt-10 flex justify-between items-center">
        <Breadcrumb items={[{ label: 'Overview' }]} />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="text-xs flex items-center gap-2 bg-white/30 backdrop-blur-sm border-white/60"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 px-6 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-text-primary mb-2 flex items-center gap-3">
            hello, looksy <span className="text-pink animate-pulse-glow inline-block">✿</span>
          </h1>
          <p className="text-base text-text-secondary font-script text-xl opacity-80">your guild is blooming today</p>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        className="relative z-10 px-6 sm:px-10 pb-8 flex flex-col gap-8"
      >
        {/* Dynamic Hero Panel */}
        <motion.div variants={itemVariants} className="group cursor-default">
          <div className="relative h-56 rounded-3xl overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl hover:border-pink/30 transition-all duration-500 flex items-center p-8 sm:p-12">
            
            <div className="absolute inset-0 bg-gradient-to-r from-pink/10 via-lavender/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 w-full">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }} 
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative"
              >
                {guild.icon ? (
                  <img src={guild.icon} alt={guild.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-xl flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pink to-lavender ring-4 ring-white flex items-center justify-center text-5xl shadow-xl text-white">
                    {guild.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-mint text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
                  <FiZap className="w-3 h-3" /> Online
                </div>
              </motion.div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-display font-semibold text-text-primary tracking-tight">{guild.name}</h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                   <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-white/60 text-text-secondary border border-black/5">
                      <FiUsers className="text-pink" /> 
                      <span>{guild.memberCount.toLocaleString()} Members</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-white/60 text-text-secondary border border-black/5">
                      <FiActivity className="text-mint" /> 
                      <span>{guild.presenceCount.toLocaleString()} Active</span>
                   </div>
                </div>
              </div>

              <div className="hidden lg:block relative group-hover:translate-x-1 transition-transform duration-300">
                <a href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_BOT_ID}&permissions=8&scope=bot&guild_id=${guildId}`} target="_blank" rel="noreferrer">
                  <Button variant="primary" className="shadow-glow-pink">
                    Invite Bot <FiArrowUpRight className="inline ml-1" />
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<FiUsers className="text-xl" />} 
              label="Total Members" 
              value={stats.members.toLocaleString()} 
              variant="default" 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<FiActivity className="text-xl" />} 
              label="Active Now" 
              value={stats.active.toLocaleString()} 
              variant="success" 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<FiCommand className="text-xl" />} 
              label="Commands Today" 
              value={stats.commands.toLocaleString()} 
              variant="default" 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<FiAlertCircle className="text-xl" />} 
              label="Warnings Issued" 
              value={stats.warnings.toLocaleString()} 
              variant="info" 
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
          <Link href={`/dashboard/${guildId}/giveaways`} className="transition-transform hover:-translate-y-0.5">
            <Button variant="primary" className="rounded-2xl px-6 font-medium shadow-glow-pink h-11">
              ✨ Create Giveaway
            </Button>
          </Link>
          <Link href={`/dashboard/${guildId}/moderation`} className="transition-transform hover:-translate-y-0.5">
            <Button variant="ghost" className="rounded-2xl px-6 h-11 bg-white/50 backdrop-blur-md border-white/60 hover:bg-white/80 text-text-primary border">
              <FiShield className="mr-2 inline" /> Moderation
            </Button>
          </Link>
          <Link href={`/dashboard/${guildId}/settings`} className="transition-transform hover:-translate-y-0.5">
            <Button variant="ghost" className="rounded-2xl px-6 h-11 bg-white/50 backdrop-blur-md border-white/60 hover:bg-white/80 text-text-primary border">
               Settings
            </Button>
          </Link>
        </motion.div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 mt-6">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-md overflow-hidden">
              <div className="p-6 sm:px-8 border-b border-border-subtle/50 bg-white/30 flex items-center justify-between">
                 <h3 className="font-display text-xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
                   <FiActivity className="text-pink" /> 24h Warning Activity
                 </h3>
                 <span className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Realtime</span>
              </div>
              <CardBody className="p-6 sm:p-8">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E85D75" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#E85D75" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="time" stroke="#949494" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#949494" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(232, 93, 117, 0.2)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                          color: '#2D2D2D',
                        }}
                        itemStyle={{ color: '#2D2D2D', fontWeight: 500 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="warnings"
                        stroke="#E85D75"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorWarnings)"
                        name="Warnings Issued"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#E85D75', className: "shadow-glow-pink" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </GlassCard>

            <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-md overflow-hidden">
              <div className="p-6 sm:px-8 border-b border-border-subtle/50 bg-white/30 flex items-center justify-between">
                 <h3 className="font-display text-xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
                   <FiShield className="text-lavender" /> Recent Actions
                 </h3>
                 <Link href={`/dashboard/${guildId}/moderation`} className="text-sm font-medium text-pink hover:text-pink-dim transition-colors group">
                    View All <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                 </Link>
              </div>
              <CardBody className="p-0">
                <CuteTable
                  columns={[
                    { 
                      key: 'type', 
                      label: 'Action',
                      render: (value) => (
                        <Badge type={value.toLowerCase() === 'ban' ? 'ban' : value.toLowerCase() === 'kick' ? 'kick' : value.toLowerCase() === 'mute' ? 'mute' : 'warn'}>
                          {value}
                        </Badge>
                      )
                    },
                    { key: 'user', label: 'User Focus' },
                    { key: 'mod', label: 'Moderator' },
                    { key: 'reason', label: 'Reason' },
                    { 
                      key: 'time', 
                      label: 'Time',
                      icon: <FiTrendingUp />
                    },
                  ]}
                  data={recentActions}
                  emptyMessage="No recent actions recorded."
                  striped
                />
              </CardBody>
            </GlassCard>
          </motion.div>

          {/* Right column */}
          <motion.div variants={itemVariants} className="space-y-8">
            <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-border-subtle/50 bg-white/30 flex items-center justify-between">
                 <h3 className="font-display text-xl font-semibold text-text-primary tracking-tight">XP Leaderboard</h3>
              </div>
              <CardBody className="p-6">
                <div className="space-y-4">
                  {leaderboard.length > 0 ? leaderboard.map((member, idx) => (
                    <motion.div 
                      key={member.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                      className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-white/60 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200 text-yellow-900' :
                        idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 text-gray-800' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-200 text-orange-900' :
                        'bg-white text-text-secondary border-border-subtle'
                      }`}>
                        #{member.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-pink to-lavender rounded-full" style={{ width: `${member.progress}%` }} />
                           </div>
                           <div className="text-[10px] font-bold text-text-tertiary">LVL {member.level}</div>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-text-tertiary">
                      No active users found.
                    </div>
                  )}
                </div>
              </CardBody>
            </GlassCard>

            <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-border-subtle/50 bg-white/30">
                 <h3 className="font-display text-xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
                    <FiMessageCircle className="text-peach" /> Server Channels
                 </h3>
              </div>
              <CardBody className="p-6 flex flex-col items-center">
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          fontSize: '13px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner pt-1">
                     <span className="text-xl font-display font-medium text-text-primary">{distribution.reduce((a, b) => a + b.value, 0)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {distribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                  ))}
                </div>
              </CardBody>
            </GlassCard>
            
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
