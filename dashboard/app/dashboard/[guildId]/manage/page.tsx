'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CuteHeader,
  CuteSection,
  CuteStat,
  CuteDivider,
  CuteButton,
  CuteInfoBox,
  CuteSettingsItem,
  CuteEmptyState,
} from '@/components/CuteComponents';
import { ClipboardIcon } from '@/components/icons';
import { FiUsers, FiActivity, FiAlertCircle, FiTag, FiGrid, FiLink2, FiZap, FiShield, FiGitBranch, FiSettings, FiTrendingUp, FiMusic, FiBox, FiMail, FiRobot, FiGift, FiTarget } from 'react-icons/fi';
import { useParams } from 'next/navigation';

interface ServerStats {
  members: number;
  activeUsers: number;
  warnings: number;
  roles: number;
  channels: number;
  invites: number;
}

interface RecentAction {
  id: string;
  type: 'ban' | 'kick' | 'warn' | 'levelup' | 'join' | 'leave';
  user: string;
  target?: string;
  timestamp: Date;
  icon: string;
}

export default function ServerManagementPage() {
  const { guildId } = useParams();
  const [stats, setStats] = useState<ServerStats>({
    members: 0,
    activeUsers: 0,
    warnings: 0,
    roles: 0,
    channels: 0,
    invites: 0,
  });
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ online: boolean; uptimeSeconds: number } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchServerData();
    // fetch health data for UI
    if (guildId) {
      setLoadingHealth(true);
      fetch(`/api/discord/${guildId}/health`)
        .then((r) => r.json())
        .then((d) => {
          setHealth({ online: d?.online ?? true, uptimeSeconds: d?.uptimeSeconds ?? 0 });
        })
        .catch(() => {})
        .finally(() => setLoadingHealth(false));
    }
  }, [guildId]);

  const fetchServerData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, actionsRes] = await Promise.all([
        fetch(`/api/analytics?guildId=${guildId}&type=overview`),
        fetch(`/api/moderation/actions?guildId=${guildId}&limit=4`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || stats);
      }

      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setRecentActions(
          (data.actions || []).map((action: any) => ({
            ...action,
            icon: action.type === 'join' ? 'join' : action.type === 'leave' ? 'leave' : action.type === 'levelup' ? 'levelup' : 'warn',
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch server data');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (type: RecentAction['type']) => {
    const colors = {
      ban: 'text-danger',
      kick: 'text-warning',
      warn: 'text-accent-peach',
      levelup: 'text-success',
      join: 'text-accent-pink',
      leave: 'text-text-secondary',
    };
    return colors[type];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <CuteHeader
        title="Server Management"
        subtitle="Overview and control center for your Discord server"
        icon={null}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CuteStat icon={<FiUsers />} label="Members" value={stats.members} change={3} />
        <CuteStat icon={<FiActivity />} label="Active Users" value={stats.activeUsers} change={-2} />
        <CuteStat icon={<FiTag />} label="Total Roles" value={stats.roles} change={1} />
        <CuteStat icon={<FiGrid />} label="Channels" value={stats.channels} />
        <CuteStat icon={<FiAlertCircle />} label="Warnings" value={stats.warnings} change={5} />
        <CuteStat icon={<FiLink2 />} label="Invites" value={stats.invites} />
      </div>

      <CuteDivider />

      {/* Quick Actions */}
      <CuteSection icon={<FiZap />} title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CuteButton variant="primary" className="w-full" icon={<FiUsers />}>
              Manage Members
            </CuteButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CuteButton variant="secondary" className="w-full" icon={<FiTag />}>
              Roles
            </CuteButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CuteButton variant="secondary" className="w-full" icon={<FiShield />}>
              Moderation
            </CuteButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CuteButton variant="secondary" className="w-full" icon={<FiSettings />}>
              Settings
            </CuteButton>
          </motion.div>
        </div>
      </CuteSection>

      <CuteDivider />

      {/* Recent Activity */}
      <CuteSection icon={<FiTrendingUp />} title="Recent Activity">
        {recentActions.length === 0 ? (
          <CuteEmptyState icon={<FiMail />} title="No Recent Activity" message="Your server has been quiet!" />
        ) : (
          <div className="space-y-3">
            {recentActions.map((action, idx) => {
              const getActionIcon = () => {
                switch(action.type) {
                  case 'join': return <FiActivity />;
                  case 'leave': return <FiGrid />;
                  case 'levelup': return <FiTrendingUp />;
                  case 'warn': return <FiAlertCircle />;
                  case 'kick': return <FiUsers />;
                  case 'ban': return <FiShield />;
                  default: return <FiAlertCircle />;
                }
              };
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-card/50 border border-accent-pink/10 hover:border-accent-pink/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl text-accent-pink">{getActionIcon()}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary truncate">
                        {action.user} {action.type === 'join' && 'joined the server'}
                        {action.type === 'leave' && 'left the server'}
                        {action.type === 'warn' && `received ${action.target}`}
                        {action.type === 'levelup' && `reached ${action.target}`}
                        {action.type === 'ban' && `was banned`}
                        {action.type === 'kick' && `was kicked`}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">{formatTime(action.timestamp)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getActionColor(action.type)}`}>
                    {action.type.toUpperCase()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </CuteSection>

      <CuteDivider />

      {/* Server Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CuteSection icon={<FiBox />} title="Enabled Features">
          <div className="space-y-2">
            <CuteSettingsItem
              icon={<FiRobot />}
              title="Auto-Moderation"
              description="Spam and word filtering active"
              action={<span className="text-success text-sm font-semibold">✓ Active</span>}
            />
            <CuteSettingsItem
              icon={<FiTrendingUp />}
              title="Leveling System"
              description="Members earning XP"
              action={<span className="text-success text-sm font-semibold">✓ Active</span>}
            />
            <CuteSettingsItem
              icon={<FiMusic />}
              title="Music Player"
              description="Queue and playback enabled"
              action={<span className="text-success text-sm font-semibold">✓ Active</span>}
            />
            <CuteSettingsItem
              icon={<FiGift />}
              title="Giveaways"
              description="Create and manage giveaways"
              action={<span className="text-success text-sm font-semibold">✓ Active</span>}
            />
          </div>
        </CuteSection>

        <CuteSection icon={<ClipboardIcon />} title="System Status">
          <div className="space-y-4">
        <CuteInfoBox
          type={health?.online ? 'success' : 'danger'}
          title="Bot Status"
          message={health?.online ? 'Looki is online and operating normally ✨' : 'Bot offline'}
        />
        <CuteInfoBox
          type={health?.online ? 'success' : 'danger'}
          title="Uptime"
          message={health
            ? new Date(health.uptimeSeconds * 1000).toISOString().substr(11, 8) // format HH:MM:SS approx from seconds
            : '0:00:00'}
        />
        <CuteInfoBox
          type="info"
          title="Last Update"
          message="3 hours ago - V2.1.5 stable"
        />
          </div>
        </CuteSection>
      </div>

      <CuteDivider />

      {/* Server Config Summary */}
      <CuteSection icon={<FiTarget />} title="Configuration Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">Command Prefix</span>
              <span className="font-mono text-accent-pink font-semibold">!</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">Default Language</span>
              <span className="font-mono text-accent-pink font-semibold">🇬🇧 English</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">Warning Threshold</span>
              <span className="font-mono text-accent-pink font-semibold">3</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">Mod Log Channel</span>
              <span className="font-mono text-accent-pink font-semibold">#mod-logs</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">Welcome Channel</span>
              <span className="font-mono text-accent-pink font-semibold">#welcome</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-card/50 border border-accent-pink/10">
              <span className="text-text-primary font-medium">XP per Message</span>
              <span className="font-mono text-accent-pink font-semibold">5 XP</span>
            </div>
          </div>
        </div>
      </CuteSection>

      <CuteDivider />

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-accent-pink/10 to-accent-lavender/10 border border-accent-pink/20 text-center"
      >
        <h3 className="text-lg font-bold text-accent-pink mb-2">Need Help?</h3>
        <p className="text-text-secondary mb-4">Check out our documentation or join the support server</p>
        <div className="flex gap-3 justify-center">
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
