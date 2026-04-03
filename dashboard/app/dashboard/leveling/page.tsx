'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard, ToggleSwitch } from '../../../components/UIComponents';

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

export default function LevelingPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    xpPerMessage: 5,
    xpCooldown: 30,
    levelUpNotification: true,
    levelUpChannel: 'general',
    ignoreChannels: ['rules', 'announcements'],
    allowedRoles: ['members'],
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
    setSaved(false);
  };

  const handleChange = (key: string, value: string | number | boolean | string[]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold mb-2">📊 Leveling System</h1>
        <p className="text-text-secondary">Configure XP and leveling settings for your server</p>
      </motion.div>

      {/* Save Feedback */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass-card p-4 rounded-lg border border-accent-green text-accent-green flex items-center gap-3"
        >
          <span className="text-2xl">✓</span>
          <p>Settings saved successfully!</p>
        </motion.div>
      )}

      {/* Enable/Disable Section */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">System Status</h2>
            <p className="text-text-secondary text-sm">Enable or disable the leveling system</p>
          </div>
          <ToggleSwitch
            checked={settings.enabled}
            onChange={() => handleToggle('enabled')}
          />
        </div>
      </motion.div>

      {/* XP Configuration */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">⚙️ XP Settings</h2>

        <GlassCard>
          <label className="block mb-3">
            <p className="text-text-secondary text-sm mb-2">XP Per Message</p>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.xpPerMessage}
              onChange={(e) => handleChange('xpPerMessage', parseInt(e.target.value))}
              className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
            />
            <p className="text-xs text-text-secondary mt-2">Amount of XP gained per message (1-100)</p>
          </label>
        </GlassCard>

        <GlassCard>
          <label className="block mb-3">
            <p className="text-text-secondary text-sm mb-2">XP Cooldown (seconds)</p>
            <input
              type="number"
              min={5}
              max={300}
              value={settings.xpCooldown}
              onChange={(e) => handleChange('xpCooldown', parseInt(e.target.value))}
              className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
            />
            <p className="text-xs text-text-secondary mt-2">Cooldown between XP gains (5-300 seconds)</p>
          </label>
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">🔔 Notifications</h2>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Level Up Notifications</p>
              <p className="text-text-secondary text-sm">Send a message when users level up</p>
            </div>
            <ToggleSwitch
              checked={settings.levelUpNotification}
              onChange={() => handleToggle('levelUpNotification')}
            />
          </div>

          {settings.levelUpNotification && (
            <div className="mt-4 pt-4 border-t border-glass">
              <label className="block">
                <p className="text-text-secondary text-sm mb-2">Notification Channel</p>
                <select
                  value={settings.levelUpChannel}
                  onChange={(e) => handleChange('levelUpChannel', e.target.value)}
                  className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
                >
                  <option value="general">general</option>
                  <option value="bot-commands">bot-commands</option>
                  <option value="announcements">announcements</option>
                </select>
              </label>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Channel Configuration */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">📍 Channel Settings</h2>

        <GlassCard>
          <label className="block">
            <p className="text-text-secondary text-sm mb-2">Ignore Channels</p>
            <p className="text-xs text-text-secondary mb-2">XP won't be earned in these channels</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.ignoreChannels.map((channel) => (
                <button
                  key={channel}
                  onClick={() =>
                    handleChange(
                      'ignoreChannels',
                      settings.ignoreChannels.filter((c) => c !== channel)
                    )
                  }
                  className="px-3 py-1 bg-danger/20 text-danger rounded-lg text-sm hover:bg-danger/30 transition-colors"
                >
                  × {channel}
                </button>
              ))}
            </div>
            <select className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors">
              <option value="">+ Add channel to ignore</option>
              <option value="support">support</option>
              <option value="off-topic">off-topic</option>
            </select>
          </label>
        </GlassCard>

        <GlassCard>
          <label className="block">
            <p className="text-text-secondary text-sm mb-2">Allowed Roles</p>
            <p className="text-xs text-text-secondary mb-2">Only these roles will gain XP</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.allowedRoles.map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    handleChange(
                      'allowedRoles',
                      settings.allowedRoles.filter((r) => r !== role)
                    )
                  }
                  className="px-3 py-1 bg-accent-lavender/20 text-accent-lavender rounded-lg text-sm hover:bg-accent-lavender/30 transition-colors"
                >
                  × {role}
                </button>
              ))}
            </div>
            <select className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors">
              <option value="">+ Add role</option>
              <option value="vip">VIP</option>
              <option value="contributors">Contributors</option>
            </select>
          </label>
        </GlassCard>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all"
        >
          💾 Save Settings
        </button>
        <button className="px-6 py-3 glass-card rounded-lg font-semibold hover:shadow-glow transition-all">
          ↺ Reset to Default
        </button>
      </motion.div>
    </motion.div>
  );
}