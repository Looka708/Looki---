"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GlassCard,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import { FiUsers, FiShield, FiSettings, FiLink2, FiZap } from 'react-icons/fi';
import { ClipboardIcon } from '@/components/icons';

type ServerInfo = {
  name?: string;
  memberCount?: number;
  iconUrl?: string;
};

function snowflakeDateFromId(id: string): string {
  try {
    // Discord Snowflake: timestamp in first 42 bits since 1420070400000
    const big = BigInt(id);
    const ts = Number((big >> 22n) + 1420070400000n);
    const d = new Date(ts);
    const diffMs = Date.now() - d.getTime();
    const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    if (years >= 1) return `${years}y ago`;
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    if (months >= 1) return `${months}mo ago`;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days >= 1) return `${days}d ago`;
    return 'today';
  } catch {
    return '';
  }
}

export default function ServerSettingsServerPage({}: {}) {
  const { guildId } = useParams<{ guildId: string }>();
  const [serverInfo, setServerInfo] = useState<ServerInfo>({});
  const [unsaved, setUnsaved] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locale, setLocale] = useState('en-US');
  const [joined, setJoined] = useState('2y ago');

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/server-info`)
      .then((r) => r.json())
      .then((data) => {
        setServerInfo({ name: data?.name, memberCount: data?.memberCount, iconUrl: data?.iconUrl });
        if (typeof data?.name === 'string') setName(data.name);
      })
      .catch(() => {});
  }, [guildId]);

  const createdLabel = useMemo(() => {
    if (!guildId) return '';
    return snowflakeDateFromId(guildId);
  }, [guildId]);

  // Save changes handler
  const saveServerInfo = async () => {
    if (!guildId) return;
    try {
      const payload = { name, description, locale };
      const res = await fetch(`/api/discord/${guildId}/server-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // show a simple alert; could be replaced with a toast in UI
        throw new Error('Failed to save server info');
      }
      const data = await res.json();
      if (data?.updated) {
        setServerName(name);
        setUnsaved(false);
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Settings' }, { label: 'Server' }]} />
      </div>
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
            {/* Placeholder for server icon; real icon URL would be used if available */}
            <ClipboardIcon size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">server management <span className="text-pink">✦</span></h1>
            <div className="text-sm text-text-secondary">your server, your rules, your aesthetic ✦</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-surface-card border border-accent-pink/20 text-sm">{serverInfo?.memberCount ?? 0} Members</span>
          <span className="px-3 py-1 rounded-full bg-surface-card border border-accent-pink/20 text-sm">Boost Lv.2 · 7 Boosts</span>
          <span className="px-3 py-1 rounded-full bg-surface-card border border-accent-pink/20 text-sm">Created {createdLabel}</span>
        </div>
      </div>

      <div className="px-8 sticky top-14 z-20 bg-white/50 backdrop-blur-md border-t border-b border-accent-pink/20">
        <div className="flex gap-4 py-3 overflow-x-auto">
          {['Overview', 'Channels', 'Roles', 'Members', 'Bans', 'Invites', 'Emojis', 'Webhooks'].map((t) => (
            <button key={t} className={`px-4 py-2 -mb-px rounded-t-lg border-b-2 ${t === 'Overview' ? 'border-pink text-pink' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <GlassCard>
          <CardHeader title="Server Identity" />
          <CardBody>
            <div className="space-y-3">
              <Input label="Server Name" value={name} onChange={(e) => { setName(e.target.value); setUnsaved(true); }} />
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setUnsaved(true); }}
                  rows={4}
                  className="p-2 border border-accent-pink/20 rounded-md bg-surface-card"
                />
              </div>
              <Select label="Locale" value={locale} onChange={(e) => { setLocale(e.target.value); setUnsaved(true); }}>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish (Spain)</option>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">AFK Channel</span>
                <Select><option>#afk-voice</option></Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">AFK Timeout</span>
                <Select><option>5 minutes</option><option>10 minutes</option></Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">System Channel</span>
                <Select><option>#welcome</option></Select>
              </div>
            </div>
          </CardBody>
        </GlassCard>
        <GlassCard>
          <CardHeader title="Verification & Security" />
          <CardBody>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-text-secondary">Verification Level</span>
                <div className="mt-1">Medium</div>
              </div>
              <div>
                <span className="text-sm text-text-secondary">Explicit Content Filter</span>
                <div className="mt-1">Members only</div>
              </div>
              <div>
                <span className="text-sm text-text-secondary">2FA for Mods</span>
                <div className="mt-1">Required</div>
              </div>
            </div>
          </CardBody>
        </GlassCard>
        <GlassCard>
          <CardHeader title="Boost Status" />
          <CardBody>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="text-sm text-text-secondary">7 Boosts</div>
            </div>
          </CardBody>
        </GlassCard>
      </div>

      {unsaved && (
        <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-pink-200 p-4 flex items-center justify-between gap-4 shadow-lg">
          <span className="text-sm text-text-secondary">You have unsaved changes</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setName(''); setDescription(''); setLocale('en-US'); setUnsaved(false); }}>Reset</Button>
            <Button variant="primary" onClick={saveServerInfo}>Save Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}
