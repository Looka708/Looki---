'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CuteHeader,
  CuteSection,
  CuteToggle,
  CuteInput,
  CuteButton,
  CuteSelect,
  CuteInfoBox,
  CuteDivider,
  CuteSettingsItem,
} from '@/components/CuteComponents';
import { useParams } from 'next/navigation';

interface ServerConfig {
  prefix: string;
  modlogChannel: string;
  welcomeChannel: string;
  welcomeMessage: string;
  automodEnabled: boolean;
  automodSettings: {
    spamFilter: boolean;
    badWordsFilter: boolean;
    linkFilter: boolean;
    capsFilter: boolean;
  };
  levelUpMessage: string;
  levelUpChannel: string;
  roleOnLevelUp: boolean;
}

const defaultConfig: ServerConfig = {
  prefix: '!',
  modlogChannel: '',
  welcomeChannel: '',
  welcomeMessage: 'Welcome {user} to {server}!',
  automodEnabled: false,
  automodSettings: {
    spamFilter: true,
    badWordsFilter: true,
    linkFilter: false,
    capsFilter: true,
  },
  levelUpMessage: '🎉 {user} has reached level {level}!',
  levelUpChannel: '',
  roleOnLevelUp: false,
};

export default function ServerSettingsPage() {
  const { guildId } = useParams();
  const [config, setConfig] = useState<ServerConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [guildId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/config?guildId=${guildId}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || defaultConfig);
      } else {
        setConfig(defaultConfig);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, ...config }),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess('Settings saved successfully! ✨');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof ServerConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateAutomodSetting = (key: keyof ServerConfig['automodSettings'], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      automodSettings: { ...prev.automodSettings, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⚙️</div>
          <p className="text-text-secondary">Loading server settings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <CuteHeader
        title="Server Settings"
        subtitle="Customize your server's behavior and features"
        emoji="⚙️"
      />

      {error && <CuteInfoBox type="error" title="Error" message={error} />}
      {success && <CuteInfoBox type="success" title="Success" message={success} />}

      {/* General Settings */}
      <CuteSection emoji="🎯" title="General Settings">
        <div className="space-y-4">
          <CuteInput
            label="Prefix"
            icon="💬"
            placeholder="Enter command prefix"
            value={config.prefix}
            onChange={(e) => updateConfig('prefix', e.target.value)}
          />
          <CuteInput
            label="Welcome Message"
            icon="👋"
            placeholder="Use {user} and {server} as placeholders"
            value={config.welcomeMessage}
            onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
          />
        </div>
      </CuteSection>

      <CuteDivider />

      {/* Moderation Settings */}
      <CuteSection emoji="🛡️" title="Moderation Settings">
        <div className="space-y-4">
          <CuteToggle
            label="Enable Auto-Moderation"
            icon="🤖"
            enabled={config.automodEnabled}
            onChange={(val) => updateConfig('automodEnabled', val)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <CuteToggle
              label="Spam Filter"
              icon="🚨"
              enabled={config.automodSettings.spamFilter}
              onChange={(val) => updateAutomodSetting('spamFilter', val)}
            />
            <CuteToggle
              label="Bad Words Filter"
              icon="🤐"
              enabled={config.automodSettings.badWordsFilter}
              onChange={(val) => updateAutomodSetting('badWordsFilter', val)}
            />
            <CuteToggle
              label="Link Filter"
              icon="🔗"
              enabled={config.automodSettings.linkFilter}
              onChange={(val) => updateAutomodSetting('linkFilter', val)}
            />
            <CuteToggle
              label="Caps Filter"
              icon="🔤"
              enabled={config.automodSettings.capsFilter}
              onChange={(val) => updateAutomodSetting('capsFilter', val)}
            />
          </div>
        </div>
      </CuteSection>

      <CuteDivider />

      {/* Leveling Settings */}
      <CuteSection emoji="📈" title="Leveling System">
        <div className="space-y-4">
          <CuteInput
            label="Level Up Message"
            icon="🎉"
            placeholder="Use {user} and {level} as placeholders"
            value={config.levelUpMessage}
            onChange={(e) => updateConfig('levelUpMessage', e.target.value)}
          />

          <CuteToggle
            label="Grant Roles on Level Up"
            icon="👑"
            enabled={config.roleOnLevelUp}
            onChange={(val) => updateConfig('roleOnLevelUp', val)}
          />
        </div>
      </CuteSection>

      <CuteDivider />

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 justify-end"
      >
        <CuteButton
          variant="ghost"
          onClick={fetchSettings}
          disabled={loading || saving}
        >
          Cancel
        </CuteButton>
        <CuteButton
          variant="primary"
          icon="💾"
          onClick={saveSettings}
          loading={saving}
          disabled={loading}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </CuteButton>
      </motion.div>
    </motion.div>
  );
}
