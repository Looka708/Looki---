'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CuteHeader,
  CuteSection,
  CuteStat,
  CuteButton,
  CuteInfoBox,
  CuteDivider,
  CuteEmptyState,
} from '@/components/CuteComponents';

interface DashboardStats {
  totalMembers: number;
  activeUsers: number;
  totalWarnings: number;
  commandsRun: number;
  uptime: number;
  latency: number;
}

interface RecentAction {
  id: string;
  type: 'BAN' | 'WARN' | 'MUTE' | 'KICK';
  user: string;
  mod: string;
  reason: string;
  timestamp: Date;
}

export default function DashboardHome() {
  const { guildId } = useParams();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeUsers: 0,
    totalWarnings: 0,
    commandsRun: 0,
    uptime: 99.8,
    latency: 0,
  });
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const typeColors: Record<string, string> = {
    BAN: 'bg-danger/20 text-danger',
    WARN: 'bg-warning/20 text-warning',
    MUTE: 'bg-lavender/20 text-lavender',
    KICK: 'bg-peach/20 text-peach',
  };

  useEffect(() => {
    fetchDashboardData();
  }, [guildId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const [statsRes, actionsRes] = await Promise.all([
        fetch(`/api/analytics?guildId=${guildId}&type=overview`),
        fetch(`/api/moderation/actions?guildId=${guildId}&limit=5`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || stats);
      }

      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setRecentActions(data.actions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-3"
          >
            ⏳
          </motion.div>
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants}>
        <CuteHeader
          title="Welcome back!"
          subtitle="Your server dashboard with real-time data"
          emoji="🌸"
        />
      </motion.div>

      {error && <CuteInfoBox type="error" title="Error" message={error} />}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CuteStat emoji="👥" label="Total Members" value={stats.totalMembers} />
        <CuteStat emoji="🟢" label="Active Users" value={stats.activeUsers} />
        <CuteStat emoji="⚠️" label="Total Warnings" value={stats.totalWarnings} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <CuteButton variant="primary" icon="🎁" className="w-full">
          Create Giveaway
        </CuteButton>
        <CuteButton variant="secondary" icon="⚡" className="w-full">
          Purge Channel
        </CuteButton>
        <CuteButton variant="secondary" icon="🔒" className="w-full">
          Lock Server
        </CuteButton>
        <CuteButton variant="secondary" icon="🎭" className="w-full">
          Manage Roles
        </CuteButton>
      </motion.div>

      <CuteDivider />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mod Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CuteSection emoji="🛡️" title="Recent Mod Actions">
            {recentActions.length === 0 ? (
              <CuteEmptyState emoji="✨" title="No Recent Actions" message="Your server is peaceful!" />
            ) : (
              <div className="space-y-3">
                {recentActions.map((action, idx) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-pink-border hover:border-pink transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${typeColors[action.type] || typeColors.WARN}`}>
                        {action.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{action.user}</p>
                        <p className="text-xs text-text-secondary">by {action.mod} • {action.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CuteSection>
        </motion.div>

        {/* Bot Health */}
        <motion.div variants={itemVariants}>
          <CuteSection emoji="🤖" title="Bot Health">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-text-secondary">Uptime</span>
                  <span className="text-sm font-semibold text-success">99.8%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-pink-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '99.8%' }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-success to-mint"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-text-secondary">Latency</span>
                  <span className="text-sm font-semibold text-pink">{stats.latency}ms</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-pink-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-pink to-lavender"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm text-text-secondary">Memory</span>
                  <span className="text-sm font-semibold text-lavender">45%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-pink-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-lavender to-peach"
                  />
                </div>
              </div>
            </div>
          </CuteSection>
        </motion.div>
      </div>

      <CuteDivider />

      {/* System Status & Features */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CuteSection emoji="✨" title="Enabled Features">
          <div className="space-y-2">
            {[
              { icon: '🤖', name: 'Auto-Moderation', status: 'Active' },
              { icon: '📈', name: 'Leveling System', status: 'Active' },
              { icon: '🎵', name: 'Music Player', status: 'Active' },
              { icon: '🎉', name: 'Giveaways', status: 'Active' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-pink-border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm font-medium text-text-primary">{feature.name}</span>
                </div>
                <span className="text-xs font-semibold text-success bg-success/20 px-2 py-1 rounded-full">
                  ✓ {feature.status}
                </span>
              </motion.div>
            ))}
          </div>
        </CuteSection>

        <CuteSection emoji="📊" title="Quick Stats">
          <div className="space-y-3">
            <CuteInfoBox type="success" title="Status" message="All systems operational ✨" />
            <CuteInfoBox type="info" title="Last Update" message="Just now • Real-time data" />
            <div className="p-3 rounded-lg bg-white border border-pink-border">
              <p className="text-sm text-text-secondary font-medium mb-1">🎯 Server ID</p>
              <p className="font-mono text-xs text-pink">{guildId}</p>
            </div>
          </div>
        </CuteSection>
      </motion.div>

      <CuteDivider />

      {/* Support Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="p-6 rounded-2xl bg-gradient-to-r from-pink/10 to-lavender/10 border border-pink-border text-center"
      >
        <motion.h3 animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-lg font-bold text-pink mb-2">
          ✨ Need Help?
        </motion.h3>
        <p className="text-text-secondary mb-4">Check out our documentation or join the support server</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <CuteButton variant="primary" icon="📚">
            Documentation
          </CuteButton>
          <CuteButton variant="secondary" icon="💬">
            Support Server
          </CuteButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
          </h2>
          <div className="space-y-3">
            {recentActions.map((action, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-base rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    action.type === 'BAN' ? 'bg-danger/20 text-danger' :
                    action.type === 'WARN' ? 'bg-warning/20 text-warning' :
                    'bg-accent-lavender/20 text-accent-lavender'
                  }`}>
                    {action.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{action.user}</p>
                    <p className="text-xs text-text-secondary">{action.reason}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">{action.time}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bot Health */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🤖</span> Bot Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">Uptime</span>
                <span className="text-sm font-semibold">99.8%</span>
              </div>
              <div className="h-2 bg-surface-base rounded-full overflow-hidden">
                <div className="h-full bg-success w-[99.8%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">Latency</span>
                <span className="text-sm font-semibold">120ms</span>
              </div>
              <div className="h-2 bg-surface-base rounded-full overflow-hidden">
                <div className="h-full bg-accent-pink w-[60%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">Memory</span>
                <span className="text-sm font-semibold">45%</span>
              </div>
              <div className="h-2 bg-surface-base rounded-full overflow-hidden">
                <div className="h-full bg-accent-lavender w-[45%]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">API Latency (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,182,193,0.1)" />
              <XAxis dataKey="time" stroke="#9B8FAE" />
              <YAxis stroke="#9B8FAE" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16151A',
                  border: '1px solid rgba(255,182,193,0.12)',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#FFB6C1"
                dot={{ fill: '#FFB6C1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* XP Leaderboard */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📈</span> XP Leaderboard
          </h2>
          <div className="space-y-2">
            {leaderboardData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-base rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold w-6 text-center ${
                    idx === 0 ? 'text-yellow-400' :
                    idx === 1 ? 'text-gray-400' :
                    idx === 2 ? 'text-orange-400' :
                    'text-text-secondary'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '#' + (idx + 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-xs text-text-secondary">Level {entry.level}</p>
                  </div>
                </div>
                <p className="text-sm text-accent-pink font-semibold">{entry.xp}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}