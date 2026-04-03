'use client';

import { useState, useEffect } from 'react';
import { GlassCard, CardHeader, CardBody, Button, Input, Toggle, Select, Badge } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface LevelingConfig {
  xpPerMessage: number;
  xpCooldown: number;
  levelUpNotifications: boolean;
  levelUpChannel: string;
  levelUpMessage: string;
  rankCardEnabled: boolean;
}

interface LevelEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  progress: number;
}

const mockLeaderboard: LevelEntry[] = [
  { rank: 1, name: 'Alice#0001', level: 42, xp: 8420, progress: 84 },
  { rank: 2, name: 'Bob#0002', level: 38, xp: 7190, progress: 72 },
  { rank: 3, name: 'Charlie#0003', level: 35, xp: 6540, progress: 65 },
  { rank: 4, name: 'Diana#0004', level: 32, xp: 5890, progress: 59 },
  { rank: 5, name: 'Eve#0005', level: 28, xp: 4820, progress: 48 },
  { rank: 6, name: 'Frank#0006', level: 25, xp: 4200, progress: 42 },
  { rank: 7, name: 'Grace#0007', level: 22, xp: 3650, progress: 37 },
  { rank: 8, name: 'Hank#0008', level: 19, xp: 3100, progress: 31 },
  { rank: 9, name: 'Ivy#0009', level: 16, xp: 2580, progress: 26 },
  { rank: 10, name: 'Jack#0010', level: 13, xp: 2050, progress: 21 },
];

const activityData = [
  { hour: '00', messages: 45, xp: 450 },
  { hour: '04', messages: 32, xp: 320 },
  { hour: '08', messages: 120, xp: 1200 },
  { hour: '12', messages: 280, xp: 2800 },
  { hour: '16', messages: 350, xp: 3500 },
  { hour: '20', messages: 290, xp: 2900 },
];

export default function LevelingPage({ params }: { params: { guildId: string } }) {
  const [config, setConfig] = useState<LevelingConfig>({
    xpPerMessage: 10,
    xpCooldown: 60,
    levelUpNotifications: true,
    levelUpChannel: '',
    levelUpMessage: '🎉 {user} has reached level {level}!',
    rankCardEnabled: true,
  });
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'settings' | 'activity'>('leaderboard');

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, channelsRes] = await Promise.all([
          fetch(`/api/leveling?guildId=${params.guildId}`),
          fetch(`/api/channels?guildId=${params.guildId}`),
        ]);

        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) setConfig(data.config);
        }

        if (channelsRes.ok) {
          const data = await channelsRes.json();
          setChannels(data.channels || []);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.guildId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/leveling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: params.guildId, config }),
      });
      if (!res.ok) throw new Error('Failed to save config');
    } catch (error) {
      console.error('Failed to save config', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof LevelingConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-border-subtle border-t-pink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base relative z-5 animate-fade-in">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Leveling' }]} />
      </div>

      <div className="px-8 py-6">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-1">
          leveling <span className="text-pink">📈</span>
        </h1>
        <p className="text-sm text-text-secondary font-script">reward active members with levels</p>
      </div>

      <div className="px-8 pb-8 flex gap-2">
        <Button
          variant={activeTab === 'leaderboard' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </Button>
      </div>

      <div className="px-8 pb-12">
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard>
                <CardHeader title="top members" />
                <CardBody>
                  <div className="space-y-3">
                    {mockLeaderboard.map((member) => (
                      <div
                        key={member.rank}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-pink-surface/50 transition-colors"
                      >
                        <div
                          className={`
                          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${member.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-bg-base' :
                            member.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-bg-base' :
                              member.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-bg-base' :
                                'bg-bg-overlay text-text-secondary'
                          }
                        `}
                        >
                          {member.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                          <div className="text-xs text-text-tertiary">Level {member.level}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-secondary font-mono">{member.xp.toLocaleString()} XP</p>
                          <div className="w-24 h-1.5 bg-bg-overlay rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-pink to-lavender rounded-full"
                              style={{ width: `${member.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </GlassCard>
            </div>

            <div>
              <GlassCard>
                <CardHeader title="level distribution" />
                <CardBody>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl font-display font-bold text-pink mb-1">42</div>
                      <div className="text-xs text-text-tertiary">Highest Level</div>
                    </div>
                    <div className="text-center py-4 border-t border-border-subtle">
                      <div className="text-4xl font-display font-bold text-lavender mb-1">156</div>
                      <div className="text-xs text-text-tertiary">Active Members</div>
                    </div>
                    <div className="text-center py-4 border-t border-border-subtle">
                      <div className="text-4xl font-display font-bold text-peach mb-1">2.4k</div>
                      <div className="text-xs text-text-tertiary">Total XP Earned</div>
                    </div>
                  </div>
                </CardBody>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <GlassCard>
            <CardHeader title="xp activity" />
            <CardBody>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activityData}>
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
                  <Bar dataKey="xp" fill="#FFB6C1" name="XP Earned" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </GlassCard>
        )}

        {activeTab === 'settings' && (
          <GlassCard>
            <CardHeader title="leveling configuration" />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="XP Per Message"
                  type="number"
                  min={1}
                  max={100}
                  value={config.xpPerMessage.toString()}
                  onChange={(e) => updateConfig('xpPerMessage', parseInt(e.target.value) || 10)}
                  helperText="Amount of XP awarded per message"
                />
                <Input
                  label="XP Cooldown (seconds)"
                  type="number"
                  min={10}
                  max={300}
                  value={config.xpCooldown.toString()}
                  onChange={(e) => updateConfig('xpCooldown', parseInt(e.target.value) || 60)}
                  helperText="Time between XP awards"
                />
                <Select
                  label="Level Up Channel"
                  value={config.levelUpChannel}
                  onChange={(e) => updateConfig('levelUpChannel', e.target.value)}
                  options={[
                    { value: '', label: 'Select a channel' },
                    ...channels.map((ch) => ({ value: ch.id, label: `#${ch.name}` })),
                  ]}
                  helperText="Channel for level up notifications"
                />
                <Input
                  label="Level Up Message"
                  value={config.levelUpMessage}
                  onChange={(e) => updateConfig('levelUpMessage', e.target.value)}
                  helperText="Use {user} and {level} as placeholders"
                />
                <Toggle
                  checked={config.levelUpNotifications}
                  onChange={(checked) => updateConfig('levelUpNotifications', checked)}
                  label="Enable Level Up Notifications"
                />
                <Toggle
                  checked={config.rankCardEnabled}
                  onChange={(checked) => updateConfig('rankCardEnabled', checked)}
                  label="Enable Rank Card Command"
                />
              </div>

              <div className="flex justify-end mt-8">
                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                  Save Settings
                </Button>
              </div>
            </CardBody>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
