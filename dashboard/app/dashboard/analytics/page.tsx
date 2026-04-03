'use client';

import { motion } from 'framer-motion';
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
} from 'recharts';
import { GlassCard } from '../../../components/UIComponents';

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

// Chart data
const memberGrowth = [
  { date: 'Mon', members: 1200 },
  { date: 'Tue', members: 1450 },
  { date: 'Wed', members: 1680 },
  { date: 'Thu', members: 1920 },
  { date: 'Fri', members: 2100 },
  { date: 'Sat', members: 2350 },
  { date: 'Sun', members: 2520 },
];

const commandUsage = [
  { command: 'play', uses: 450 },
  { command: 'skip', uses: 380 },
  { command: 'rank', uses: 320 },
  { command: 'help', uses: 280 },
  { command: 'ban', uses: 45 },
  { command: 'warn', uses: 120 },
];

const activityHeatmap = [
  { day: 'Monday', messages: 1200 },
  { day: 'Tuesday', messages: 1800 },
  { day: 'Wednesday', messages: 1500 },
  { day: 'Thursday', messages: 2100 },
  { day: 'Friday', messages: 2480 },
  { day: 'Saturday', messages: 1890 },
  { day: 'Sunday', messages: 1200 },
];

const messageActivity = [
  { name: 'General', value: 35, color: '#EC4899' },
  { name: 'Off-topic', value: 25, color: '#A78BFA' },
  { name: 'Bot Commands', value: 20, color: '#F97316' },
  { name: 'Other', value: 20, color: '#06B6D4' },
];

export default function AnalyticsPage() {
  const chartConfig = {
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold mb-2">📊 Analytics</h1>
        <p className="text-text-secondary">Server activity and performance metrics</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-pink">2.5k</p>
            <p className="text-text-secondary text-sm mt-1">Total Members</p>
            <p className="text-xs text-accent-green mt-1">+120 this week</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-lavender">856</p>
            <p className="text-text-secondary text-sm mt-1">Messages Sent</p>
            <p className="text-xs text-accent-green mt-1">Today</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-peach">12.3k</p>
            <p className="text-text-secondary text-sm mt-1">Total XP Given</p>
            <p className="text-xs text-accent-green mt-1">This week</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-cyan">42</p>
            <p className="text-text-secondary text-sm mt-1">Mod Actions</p>
            <p className="text-xs text-accent-green mt-1">This month</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Member Growth Chart */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">📈 Member Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={memberGrowth} {...chartConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#FFF' }}
            />
            <Line
              type="monotone"
              dataKey="members"
              stroke="#EC4899"
              dot={{ fill: '#EC4899', r: 4 }}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Command Usage & Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command Usage */}
        <GlassCard className="p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">🎮 Top Commands</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={commandUsage}
              layout="vertical"
              {...chartConfig}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" stroke="#999" />
              <YAxis dataKey="command" type="category" stroke="#999" width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
              <Bar dataKey="uses" fill="#A78BFA" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Message Distribution */}
        <GlassCard className="p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">💬 Message Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={messageActivity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {messageActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Daily Activity */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">📅 Daily Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityHeatmap} {...chartConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="day" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#FFF' }}
            />
            <Bar
              dataKey="messages"
              fill="#F97316"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6 rounded-xl">
          <p className="text-text-secondary text-sm mb-2">Average Activity</p>
          <p className="text-3xl font-bold">1.2k</p>
          <p className="text-xs text-text-secondary mt-1">messages per day</p>
        </GlassCard>
        <GlassCard className="p-6 rounded-xl">
          <p className="text-text-secondary text-sm mb-2">Most Active Day</p>
          <p className="text-3xl font-bold">Friday</p>
          <p className="text-xs text-text-secondary mt-1">2,480 messages</p>
        </GlassCard>
        <GlassCard className="p-6 rounded-xl">
          <p className="text-text-secondary text-sm mb-2">Total Commands</p>
          <p className="text-3xl font-bold">1.8k</p>
          <p className="text-xs text-text-secondary mt-1">this week</p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}