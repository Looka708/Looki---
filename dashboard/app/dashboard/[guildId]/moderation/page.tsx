'use client';

import { useState, useEffect } from 'react';
import { GlassCard, CardHeader, CardBody, Button, Badge, Input, Select, Modal } from '@/components/ui';
import { ShieldIcon, TrashIcon, BanIcon, KickIcon, MuteIcon, ClipboardIcon } from '@/components/icons';
import { useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/Topnav';
import { motion } from 'framer-motion';

interface ModAction {
  id: string;
  type: 'BAN' | 'KICK' | 'MUTE' | 'WARN' | 'UNMUTE' | 'UNBAN';
  user: string;
  userId: string;
  mod: string;
  modId: string;
  reason: string;
  duration?: string;
  timestamp: string;
}

interface Filters {
  type: string;
  search: string;
}

const actionTypes = [
  { value: '', label: 'All Types', icon: <ClipboardIcon size={14} /> },
  { value: 'BAN', label: 'Ban' },
  { value: 'KICK', label: 'Kick' },
  { value: 'MUTE', label: 'Mute' },
  { value: 'WARN', label: 'Warn' },
  { value: 'UNMUTE', label: 'Unmute' },
  { value: 'UNBAN', label: 'Unban' },
];

// Real data will be fetched from Discord API via /api/discord/[guildId]/moderation/actions

export default function ModerationPage({ params }: { params: { guildId: string } }) {
  const [actions, setActions] = useState<ModAction[]>([]);
  const [filters, setFilters] = useState<Filters>({ type: '', search: '' });
  const [selectedAction, setSelectedAction] = useState<ModAction | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeCount, setPurgeCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverName, setServerName] = useState<string>('Unknown Server');
  const guildIdFromParams = params?.guildId ?? '';
  // Fetch real data when guildId is available
  useEffect(() => {
    const gid = guildIdFromParams;
    if (!gid) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/discord/${gid}/moderation/actions`).then((r) => r.json()),
      fetch(`/api/discord/${gid}/server-info`).then((r) => r.json()),
    ])
      .then(([actionsData, serverInfo]) => {
        if (Array.isArray(actionsData?.actions)) setActions(actionsData.actions);
        if (serverInfo?.name) setServerName(serverInfo.name);
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to load data');
      })
      .finally(() => setLoading(false));
  }, [guildIdFromParams]);

  const filteredActions = actions.filter((action) => {
    if (filters.type && action.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        action.user.toLowerCase().includes(searchLower) ||
        action.mod.toLowerCase().includes(searchLower) ||
        action.reason.toLowerCase().includes(searchLower) ||
        action.id.includes(searchLower)
      );
    }
    return true;
  });

  const getBadgeType = (type: ModAction['type']) => {
    switch (type) {
      case 'BAN':
      case 'UNBAN':
        return 'ban';
      case 'KICK':
        return 'kick';
      case 'MUTE':
        return 'mute';
      case 'UNMUTE':
        return 'success';
      case 'WARN':
        return 'warn';
      default:
        return 'note';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base relative z-5 animate-fade-in">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Moderation' }]} />
      </div>

      <div className="px-8 py-6">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-1 flex items-center gap-2">
          moderation <ShieldIcon className="text-pink" size={22} />
        </h1>
        <div className="text-sm text-text-secondary mb-1">{serverName}</div>
        <p className="text-sm text-text-secondary font-script">keep your server safe and sound</p>
      </div>

      {loading && <div className="px-8 pb-4 text-sm text-text-secondary">Loading data from Discord...</div>}
      {error && <div className="px-8 pb-4 text-sm text-red-600">{error}</div>}
      <div className="px-8 pb-8 flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setShowPurgeModal(true)}>
          <span className="inline-flex items-center gap-2">
            <TrashIcon size={16} /> Purge Messages
          </span>
        </Button>
        <Button variant="ghost">
          <span className="inline-flex items-center gap-2"><BanIcon size={16} /> Manual Ban</span>
        </Button>
        <Button variant="ghost">
          <span className="inline-flex items-center gap-2"><KickIcon size={16} /> Manual Kick</span>
        </Button>
        <Button variant="ghost">
          <span className="inline-flex items-center gap-2"><MuteIcon size={16} /> Manual Mute</span>
        </Button>
      </div>

      <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <GlassCard>
            <CardHeader title="filters" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Action Type"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  options={actionTypes}
                />
                <Input
                  label="Search"
                  placeholder="Search actions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <Button
                  variant="ghost"
                  onClick={() => setFilters({ type: '', search: '' })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border-subtle">
                <h3 className="text-sm font-medium text-text-secondary mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-tertiary">Total Actions</span>
                    <span className="text-sm font-medium text-text-primary">{actions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-tertiary">Bans</span>
                    <span className="text-sm font-medium text-rose">{actions.filter((a) => a.type === 'BAN').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-tertiary">Kicks</span>
                    <span className="text-sm font-medium text-peach">{actions.filter((a) => a.type === 'KICK').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-tertiary">Warnings</span>
                    <span className="text-sm font-medium text-lemon">{actions.filter((a) => a.type === 'WARN').length}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </GlassCard>
        </div>

        <div className="lg:col-span-3">
          <GlassCard>
            <CardHeader title="moderation history" />
            <CardBody>
              {filteredActions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-text-secondary">No actions found matching your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="dashboard-table w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">ID</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">Type</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">User</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">Moderator</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">Reason</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">Duration</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions.map((action) => (
                        <motion.tr
                          key={action.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-border-subtle hover:bg-pink-surface/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAction(action)}
                        >
                          <td className="py-3 px-4 text-text-secondary font-mono">#{action.id}</td>
                          <td className="py-3 px-4">
                            <Badge type={getBadgeType(action.type)}>{action.type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-text-primary">{action.user}</td>
                          <td className="py-3 px-4 text-text-secondary">{action.mod}</td>
                          <td className="py-3 px-4 text-text-secondary max-w-xs truncate">{action.reason}</td>
                          <td className="py-3 px-4 text-text-tertiary">{action.duration || '-'}</td>
                          <td className="py-3 px-4 text-text-tertiary">{action.timestamp}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </GlassCard>
        </div>
      </div>

      {selectedAction && (
        <Modal
          isOpen={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          title={`Action #${selectedAction.id}`}
          confirmText="Close"
          onConfirm={() => setSelectedAction(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Type</p>
              <Badge type={getBadgeType(selectedAction.type)}>{selectedAction.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">User</p>
              <p className="text-sm text-text-primary">{selectedAction.user} ({selectedAction.userId})</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Moderator</p>
              <p className="text-sm text-text-primary">{selectedAction.mod} ({selectedAction.modId})</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Reason</p>
              <p className="text-sm text-text-secondary">{selectedAction.reason}</p>
            </div>
            {selectedAction.duration && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">Duration</p>
                <p className="text-sm text-text-secondary">{selectedAction.duration}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-tertiary mb-1">Timestamp</p>
              <p className="text-sm text-text-secondary">{selectedAction.timestamp}</p>
            </div>
          </div>
        </Modal>
      )}

      {showPurgeModal && (
        <Modal
          isOpen={showPurgeModal}
          onClose={() => setShowPurgeModal(false)}
          title="Purge Messages"
          confirmText="Purge"
          destructive
          onConfirm={() => {
            setShowPurgeModal(false);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              This will delete the specified number of messages from the current channel. This action cannot be undone.
            </p>
            <Input
              label="Number of Messages"
              type="number"
              min={1}
              max={100}
              value={purgeCount.toString()}
              onChange={(e) => setPurgeCount(parseInt(e.target.value) || 10)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
