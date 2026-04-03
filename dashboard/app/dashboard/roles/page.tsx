'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Badge } from '../../../components/UIComponents';

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

// Mock reaction roles data
const reactionRoles = [
  {
    id: 1,
    name: 'Gaming Roles',
    description: 'React to get your game role',
    channel: 'role-selection',
    reactions: [
      { emoji: '🎮', role: 'Gamer' },
      { emoji: '🎯', role: 'Speedrunner' },
      { emoji: '🎸', role: 'Streamer' },
    ],
  },
  {
    id: 2,
    name: 'Notification Roles',
    description: 'Get notified about specific topics',
    channel: 'notifications',
    reactions: [
      { emoji: '📢', role: 'Events' },
      { emoji: '📰', role: 'News' },
    ],
  },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState('reaction');
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold mb-2">👥 Roles Management</h1>
        <p className="text-text-secondary">Create and manage role assignment systems</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {[
          { value: 'reaction', label: '⚛️ Reaction Roles' },
          { value: 'button', label: '🔘 Button Roles' },
          { value: 'autorole', label: '🤖 Auto Roles' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.value
                ? 'bg-accent-pink text-surface-base font-semibold'
                : 'glass-card text-text-primary hover:shadow-glow'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Reaction Roles Tab */}
      {activeTab === 'reaction' && (
        <motion.div variants={containerVariants} className="space-y-4">
          <motion.button
            variants={itemVariants}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all"
          >
            ➕ Create New Reaction Role
          </motion.button>

          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl space-y-4"
            >
              <h3 className="text-xl font-semibold">New Reaction Role</h3>
              <input
                placeholder="Role Group Name"
                className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
              />
              <textarea
                placeholder="Description"
                rows={2}
                className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors resize-none"
              />
              <select className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors">
                <option>Select Channel</option>
                <option>general</option>
                <option>role-selection</option>
              </select>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all">
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 glass-card rounded-lg hover:shadow-glow transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {reactionRoles.map((roleGroup, idx) => (
            <motion.div
              key={roleGroup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{roleGroup.name}</h3>
                  <p className="text-text-secondary text-sm">{roleGroup.description}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    Channel: <span className="text-accent-pink">#{roleGroup.channel}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 glass-card rounded-lg text-sm hover:shadow-glow transition-all">
                    ✏️ Edit
                  </button>
                  <button className="px-3 py-1.5 glass-card rounded-lg text-sm text-danger hover:shadow-glow transition-all">
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-text-secondary mb-3">Emoji Assignments:</p>
                {roleGroup.reactions.map((reaction) => (
                  <div
                    key={reaction.emoji}
                    className="flex items-center justify-between p-3 bg-surface-darker rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reaction.emoji}</span>
                      <span className="text-text-primary font-mono">→</span>
                      <Badge type="primary">{reaction.role}</Badge>
                    </div>
                    <button className="text-danger hover:text-danger/70 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-2 px-4 glass-card rounded-lg text-sm hover:shadow-glow transition-all">
                ➕ Add Emoji Assignment
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Button Roles Tab */}
      {activeTab === 'button' && (
        <motion.div variants={containerVariants} className="space-y-4">
          <motion.button
            variants={itemVariants}
            className="px-6 py-3 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all"
          >
            ➕ Create Button Role
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Create New Button Role Message</h3>
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-sm mb-2 block">Message Title</label>
                <input
                  placeholder="Role Selection"
                  className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-2 block">Message Description</label>
                <textarea
                  placeholder="Click a button to get a role..."
                  rows={3}
                  className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-2 block">Select Channel</label>
                <select className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors">
                  <option>Select a channel</option>
                  <option>general</option>
                  <option>role-selection</option>
                </select>
              </div>

              <div>
                <p className="text-text-secondary text-sm mb-3">Button Colors</p>
                <div className="flex gap-2 flex-wrap">
                  {['primary', 'secondary', 'success', 'danger', 'warning'].map((color) => (
                    <button
                      key={color}
                      className={`px-3 py-1.5 rounded-lg font-semibold capitalize text-sm cursor-pointer hover:shadow-glow transition-all ${
                        color === 'primary' ? 'bg-accent-pink text-surface-base' : 'glass-card'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-6 py-2 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all">
                  Continue
                </button>
                <button className="px-6 py-2 glass-card rounded-lg hover:shadow-glow transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Auto Roles Tab */}
      {activeTab === 'autorole' && (
        <motion.div variants={containerVariants} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Auto-assign Roles on Join</h3>
            <p className="text-text-secondary text-sm mb-4">
              Automatically assign roles to new members when they join your server.
            </p>

            <div className="space-y-3">
              {['member', 'verified', 'new-member'].map((role) => (
                <div key={role} className="flex items-center justify-between p-3 glass-card rounded-lg">
                  <Badge type="primary">{role}</Badge>
                  <button className="text-danger hover:text-danger/70 transition-colors">✕</button>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full py-2 px-4 glass-card rounded-lg hover:shadow-glow transition-all">
              ➕ Add Auto Role
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}