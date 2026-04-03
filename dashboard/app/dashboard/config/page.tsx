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

export default function ConfigPage() {
  const [config, setConfig] = useState({
    prefix: 'p!',
    modlog: 'mod-logs',
    modlogEnabled: true,
    welcomeChannel: 'welcome',
    welcomeMessage: true,
    welcomeMsg: 'Welcome to our server! 🎉',
    automodEnabled: false,
    spamThreshold: 5,
    logLevel: 'info',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string | number | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const handleToggle = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
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
        <h1 className="text-4xl font-display font-bold mb-2">⚙️ Server Configuration</h1>
        <p className="text-text-secondary">Customize bot settings for your server</p>
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
          <p>Configuration saved successfully!</p>
        </motion.div>
      )}

      {/* Basic Settings */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">🎛️ Basic Settings</h2>

        <GlassCard>
          <label className="block">
            <p className="text-text-secondary text-sm mb-2">Command Prefix</p>
            <input
              type="text"
              maxLength={3}
              value={config.prefix}
              onChange={(e) => handleChange('prefix', e.target.value)}
              className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
            />
            <p className="text-xs text-text-secondary mt-2">Used for text-based commands (1-3 characters)</p>
          </label>
        </GlassCard>

        <GlassCard>
          <label className="block">
            <p className="text-text-secondary text-sm mb-2">Default Log Level</p>
            <select
              value={config.logLevel}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
            >
              <option value="debug">🔍 Debug</option>
              <option value="info">ℹ️ Info</option>
              <option value="warn">⚠️ Warning</option>
              <option value="error">❌ Error</option>
            </select>
          </label>
        </GlassCard>
      </motion.div>

      {/* Moderation */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">🛡️ Moderation</h2>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Moderation Logging</p>
              <p className="text-text-secondary text-sm">Log all mod actions to a channel</p>
            </div>
            <ToggleSwitch
              checked={config.modlogEnabled}
              onChange={() => handleToggle('modlogEnabled')}
            />
          </div>

          {config.modlogEnabled && (
            <div className="mt-4 pt-4 border-t border-glass">
              <label className="block">
                <p className="text-text-secondary text-sm mb-2">Modlog Channel</p>
                <select
                  value={config.modlog}
                  onChange={(e) => handleChange('modlog', e.target.value)}
                  className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
                >
                  <option value="mod-logs">mod-logs</option>
                  <option value="admin-logs">admin-logs</option>
                  <option value="general">general</option>
                </select>
              </label>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">AutoMod System</p>
              <p className="text-text-secondary text-sm">Enable automatic moderation</p>
            </div>
            <ToggleSwitch
              checked={config.automodEnabled}
              onChange={() => handleToggle('automodEnabled')}
            />
          </div>

          {config.automodEnabled && (
            <div className="mt-4 pt-4 border-t border-glass space-y-4">
              <div>
                <p className="text-text-secondary text-sm mb-2">Spam Threshold</p>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={config.spamThreshold}
                  onChange={(e) => handleChange('spamThreshold', parseInt(e.target.value))}
                  className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
                />
                <p className="text-xs text-text-secondary mt-1">Messages per minute before triggering (3-20)</p>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Welcome Settings */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">👋 Welcome Settings</h2>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Send Welcome Messages</p>
              <p className="text-text-secondary text-sm">Greet new members</p>
            </div>
            <ToggleSwitch
              checked={config.welcomeMessage}
              onChange={() => handleToggle('welcomeMessage')}
            />
          </div>

          {config.welcomeMessage && (
            <div className="mt-4 pt-4 border-t border-glass space-y-4">
              <div>
                <label className="block">
                  <p className="text-text-secondary text-sm mb-2">Welcome Channel</p>
                  <select
                    value={config.welcomeChannel}
                    onChange={(e) => handleChange('welcomeChannel', e.target.value)}
                    className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors"
                  >
                    <option value="welcome">welcome</option>
                    <option value="general">general</option>
                    <option value="announcements">announcements</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <p className="text-text-secondary text-sm mb-2">Welcome Message Template</p>
                  <textarea
                    value={config.welcomeMsg}
                    onChange={(e) => handleChange('welcomeMsg', e.target.value)}
                    rows={3}
                    className="w-full bg-surface-darker text-text-primary px-4 py-2 rounded-lg border border-glass focus:border-accent-pink focus:outline-none transition-colors resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Variables: {'{user}'}, {'{guild}'}, {'{count}'}
                  </p>
                </label>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Dangerous Actions */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-semibold">⚠️ Dangerous Actions</h2>

        <GlassCard>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 glass-card rounded-lg hover:shadow-glow transition-all text-warning">
              🔄 Reset All Settings
            </button>
            <button className="w-full py-2 px-4 glass-card rounded-lg hover:shadow-glow transition-all text-danger">
              🗑️ Clear Server Data
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-accent-pink text-surface-base rounded-lg font-semibold hover:shadow-glow transition-all"
        >
          💾 Save Configuration
        </button>
        <button className="px-6 py-3 glass-card rounded-lg font-semibold hover:shadow-glow transition-all">
          ↺ Discard Changes
        </button>
      </motion.div>
    </motion.div>
  );
}