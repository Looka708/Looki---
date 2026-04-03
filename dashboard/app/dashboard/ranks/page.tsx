'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Badge, UserChip } from '../../../components/UIComponents';

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

// Mock leaderboard data
const leaderboard = [
  { rank: 1, user: 'User#1234', id: '123456789', level: 45, xp: 15234, totalXp: 450000 },
  { rank: 2, user: 'User#5678', id: '987654321', level: 42, xp: 12450, totalXp: 410000 },
  { rank: 3, user: 'User#9012', id: '456789123', level: 38, xp: 8900, totalXp: 370000 },
  { rank: 4, user: 'User#3456', id: '654321789', level: 35, xp: 5600, totalXp: 340000 },
  { rank: 5, user: 'User#7890', id: '321654987', level: 32, xp: 3200, totalXp: 310000 },
  { rank: 6, user: 'User#2345', id: '111222333', level: 29, xp: 1800, totalXp: 280000 },
  { rank: 7, user: 'User#6789', id: '444555666', level: 26, xp: 900, totalXp: 250000 },
  { rank: 8, user: 'User#0123', id: '777888999', level: 23, xp: 450, totalXp: 220000 },
];

const getMedalEmoji = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `#${rank}`;
  }
};

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('all');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-text-secondary">Top members by total XP and level</p>
      </motion.div>

      {/* Timeframe Filter */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {[
          { value: 'week', label: '📅 This Week' },
          { value: 'month', label: '📆 This Month' },
          { value: 'all', label: '🌍 All Time' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setTimeframe(btn.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              timeframe === btn.value
                ? 'bg-accent-pink text-surface-base font-semibold'
                : 'glass-card text-text-primary hover:shadow-glow'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </motion.div>

      {/* Top 3 Showcase */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-6 rounded-xl text-center relative overflow-hidden ${
              idx === 0 ? 'md:col-span-2' : ''
            }`}
          >
            <div className="absolute top-2 right-2 text-4xl">{getMedalEmoji(entry.rank)}</div>
            <p className="text-5xl mb-2">{getMedalEmoji(entry.rank)}</p>
            <p className="text-2xl font-bold mb-1">{entry.user}</p>
            <div className="flex justify-center gap-4 my-3">
              <Badge type="primary">Level {entry.level}</Badge>
              <Badge type="success">{entry.totalXp.toLocaleString()} XP</Badge>
            </div>
            <div className="w-full bg-surface-darker rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-accent-pink to-accent-lavender h-2 rounded-full"
                style={{ width: `${(entry.xp / 20000) * 100}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">{entry.xp.toLocaleString()} / 20,000 XP</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-6">Extended Rankings</h2>
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 rounded-lg hover:shadow-glow transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl font-bold w-8 text-center">{getMedalEmoji(entry.rank)}</div>
                <UserChip name={entry.user} id={entry.id} />
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-sm text-text-secondary">Level</p>
                  <p className="text-lg font-bold">{entry.level}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">This Period</p>
                  <p className="text-lg font-bold">{entry.xp.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total</p>
                  <p className="text-lg font-bold">{(entry.totalXp / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Rank */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-accent-pink">
        <h3 className="text-lg font-semibold mb-4">📍 Your Rank</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">#47</div>
            <div>
              <p className="text-lg font-semibold">Your Account</p>
              <p className="text-text-secondary text-sm">Level 12 • 8,450 XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary mb-1">Next Level</p>
            <div className="w-48 bg-surface-darker rounded-full h-3">
              <div
                className="bg-gradient-to-r from-accent-pink to-accent-lavender h-3 rounded-full"
                style={{ width: '42%' }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">11,550 XP needed</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}