'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard, Badge, UserChip } from '../../../components/UIComponents';

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

// Mock data
const modActions = [
  {
    id: 1,
    type: 'ban',
    user: { name: 'User#1234', id: '123456789', avatar: 'https://cdn.discordapp.com/avatars/1/avatar.png' },
    moderator: 'Moderator#5678',
    reason: 'Spam and harassment',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    duration: null,
  },
  {
    id: 2,
    type: 'kick',
    user: { name: 'User#9012', id: '987654321', avatar: null },
    moderator: 'Moderator#3456',
    reason: 'Violating rules',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    duration: null,
  },
  {
    id: 3,
    type: 'mute',
    user: { name: 'User#7890', id: '456789123', avatar: null },
    moderator: 'Moderator#1234',
    reason: 'Spam in chat',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    duration: '1h',
  },
  {
    id: 4,
    type: 'warn',
    user: { name: 'User#5432', id: '321654987', avatar: null },
    moderator: 'Moderator#8765',
    reason: 'Inappropriate language',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    duration: null,
  },
] as const;

type ModAction = typeof modActions[number];

export default function ModActionsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState<ModAction | null>(null);

  const typeIcons = {
    ban: '🚫',
    kick: '👢',
    mute: '🔇',
    warn: '⚠️',
  };

  const filteredActions = filter === 'all' ? modActions : modActions.filter(a => a.type === filter);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold mb-2">🛡️ Moderation Actions</h1>
        <p className="text-text-secondary">View and manage recent moderation actions on your server</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-danger">12</p>
          <p className="text-text-secondary text-sm">Bans this week</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-warning">8</p>
          <p className="text-text-secondary text-sm">Kicks this week</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-accent-lavender">24</p>
          <p className="text-text-secondary text-sm">Warnings this week</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-accent-peach">5</p>
          <p className="text-text-secondary text-sm">Mutes active</p>
        </GlassCard>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Actions', icon: '📋' },
          { value: 'ban', label: 'Bans', icon: '🚫' },
          { value: 'kick', label: 'Kicks', icon: '👢' },
          { value: 'mute', label: 'Mutes', icon: '🔇' },
          { value: 'warn', label: 'Warnings', icon: '⚠️' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === btn.value
                ? 'bg-accent-pink text-surface-base font-semibold'
                : 'glass-card text-text-primary hover:shadow-glow'
            }`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </motion.div>

      {/* Actions Table */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-6">Recent Actions</h2>
        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No actions found</p>
            </div>
          ) : (
            filteredActions.map((action) => (
              <motion.div
                key={action.id}
                variants={itemVariants}
                className="glass-card p-4 rounded-lg cursor-pointer hover:shadow-glow transition-all"
                onClick={() => setSelectedAction(action)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl">{typeIcons[action.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserChip
                          name={action.user.name}
                          id={action.user.id}
                        />
                        <Badge type={action.type}>{action.type.toUpperCase()}</Badge>
                      </div>
                      <p className="text-text-secondary text-sm">{action.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">{action.moderator}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {action.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Detail Drawer */}
      {selectedAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-start justify-end"
          onClick={() => setSelectedAction(null)}
        >
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 h-screen glass-card rounded-0 p-6 overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-2xl font-display font-bold mb-2">Case Details</h2>
              <p className="text-text-secondary text-sm">Case #{selectedAction.id}</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-text-secondary text-sm mb-1">User</p>
                <UserChip
                  name={selectedAction.user.name}
                  id={selectedAction.user.id}
                />
              </div>

              <div>
                <p className="text-text-secondary text-sm mb-1">Action Type</p>
                <Badge type={selectedAction.type}>
                  {selectedAction.type.toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-text-secondary text-sm mb-1">Reason</p>
                <p className="text-text-primary">{selectedAction.reason}</p>
              </div>

              <div>
                <p className="text-text-secondary text-sm mb-1">Moderator</p>
                <p className="text-text-primary">{selectedAction.moderator}</p>
              </div>

              {selectedAction.duration && (
                <div>
                  <p className="text-text-secondary text-sm mb-1">Duration</p>
                  <p className="text-text-primary">{selectedAction.duration}</p>
                </div>
              )}

              <div>
                <p className="text-text-secondary text-sm mb-1">Timestamp</p>
                <p className="text-text-primary text-xs font-mono">
                  {selectedAction.timestamp.toISOString()}
                </p>
              </div>
            </div>

            <div className="border-t border-glass pt-4 space-y-2">
              <button className="w-full py-2 px-4 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all">
                Edit Reason
              </button>
              <button className="w-full py-2 px-4 glass-card rounded-lg hover:shadow-glow transition-all text-danger">
                Delete Case
              </button>
            </div>

            <button
              onClick={() => setSelectedAction(null)}
              className="w-full py-2 text-text-secondary hover:text-accent-pink transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}