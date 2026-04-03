'use client';

import { useState, useEffect } from 'react';
import { GlassCard, CardHeader, CardBody, StatCard } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const memberGrowthData = [
  { date: 'Mon', members: 1200, online: 450 },
  { date: 'Tue', members: 1215, online: 480 },
  { date: 'Wed', members: 1230, online: 510 },
  { date: 'Thu', members: 1245, online: 490 },
  { date: 'Fri', members: 1280, online: 520 },
  { date: 'Sat', members: 1310, online: 550 },
  { date: 'Sun', members: 1340, online: 580 },
];

const commandUsageData = [
  { command: '/help', uses: 245 },
  { command: '/rank', uses: 189 },
  { command: '/leaderboard', uses: 156 },
  { command: '/play', uses: 134 },
  { command: '/giveaway', uses: 98 },
  { command: '/warn', uses: 45 },
  { command: '/ban', uses: 12 },
];

const messageDistributionData = [
  { name: 'General', value: 4500, color: '#FFB6C1' },
  { name: 'Gaming', value: 3200, color: '#C8A2C8' },
  { name: 'Music', value: 2100, color: '#FFCBA4' },
  { name: 'Art', value: 1800, color: '#B5EAD7' },
  { name: 'Off-topic', value: 1200, color: '#AEC6CF' },
];

const dailyActivityData = [
  { hour: '00', messages: 45, commands: 12 },
  { hour: '02', messages: 28, commands: 8 },
  { hour: '04', messages: 32, commands: 10 },
  { hour: '06', messages: 65, commands: 18 },
  { hour: '08', messages: 120, commands: 35 },
  { hour: '10', messages: 180, commands: 52 },
  { hour: '12', messages: 280, commands: 78 },
  { hour: '14', messages: 320, commands: 92 },
  { hour: '16', messages: 350, commands: 105 },
  { hour: '18', messages: 310, commands: 88 },
  { hour: '20', messages: 290, commands: 82 },
  { hour: '22', messages: 150, commands: 42 },
];

const COLORS = ['#FFB6C1', '#C8A2C8', '#FFCBA4', '#B5EAD7', '#AEC6CF'];

export default function AnalyticsPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

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
        <Breadcrumb items={[{ label: 'Analytics' }]} />
      </div>

      <div className="px-8 py-6">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-1">
          analytics <span className="text-pink">📊</span>
        </h1>
        <p className="text-sm text-text-secondary font-script">insights into your server activity</p>
      </div>

      <div className="px-8 pb-8 flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '7d'
              ? 'bg-pink text-bg-base'
              : 'bg-bg-overlay text-text-secondary hover:text-text-primary'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '30d'
              ? 'bg-pink text-bg-base'
              : 'bg-bg-overlay text-text-secondary hover:text-text-primary'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange('90d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === '90d'
              ? 'bg-pink text-bg-base'
              : 'bg-bg-overlay text-text-secondary hover:text-text-primary'
          }`}
        >
          90 Days
        </button>
      </div>

      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="👥" label="Total Members" value="1,340" trend={12} variant="default" />
        <StatCard icon="💬" label="Messages Today" value="892" trend={8} variant="success" />
        <StatCard icon="⚡" label="Commands Run" value="456" trend={-3} variant="info" />
        <StatCard icon="📈" label="Avg. Online" value="520" trend={5} variant="default" />
      </div>

      <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard>
          <CardHeader title="member growth" />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,182,193,0.1)" />
                <XAxis dataKey="date" stroke="#9B8FAE" />
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
                  dataKey="members"
                  stroke="#FFB6C1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#FFB6C1' }}
                  activeDot={{ r: 6 }}
                  name="Total Members"
                />
                <Line
                  type="monotone"
                  dataKey="online"
                  stroke="#C8A2C8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#C8A2C8' }}
                  activeDot={{ r: 6 }}
                  name="Online"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard>
          <CardHeader title="top commands" />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commandUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,182,193,0.1)" />
                <XAxis dataKey="command" stroke="#9B8FAE" />
                <YAxis stroke="#9B8FAE" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#13111A',
                    border: '1px solid rgba(255,182,193,0.14)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="uses" fill="#FFB6C1" name="Uses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>

        <GlassCard>
          <CardHeader title="message distribution" />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={messageDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
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
          <CardHeader title="daily activity" />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActivityData}>
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
                  dot={false}
                  name="Messages"
                />
                <Line
                  type="monotone"
                  dataKey="commands"
                  stroke="#C8A2C8"
                  strokeWidth={2}
                  dot={false}
                  name="Commands"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
