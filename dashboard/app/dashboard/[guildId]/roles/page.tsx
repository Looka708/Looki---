'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  CuteEmptyState,
  CuteSettingsItem,
  CuteStat,
} from '@/components/CuteComponents';

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface ReactionRole {
  id: string;
  messageId: string;
  channelId: string;
  emoji: string;
  roleId: string;
  roleName: string;
}

interface AutoRole {
  id: string;
  roleId: string;
  roleName: string;
  delay: number;
}

const mockRoles: Role[] = [
  { id: '1', name: 'Member', color: '#FFB6C1', position: 1 },
  { id: '2', name: 'Active', color: '#C8A2C8', position: 2 },
  { id: '3', name: 'VIP', color: '#FFCBA4', position: 3 },
  { id: '4', name: 'Helper', color: '#B5EAD7', position: 4 },
  { id: '5', name: 'Moderator', color: '#AEC6CF', position: 5 },
];

const mockReactionRoles: ReactionRole[] = [
  { id: '1', messageId: '123456', channelId: '789012', emoji: '🎮', roleId: '1', roleName: 'Member' },
  { id: '2', messageId: '123456', channelId: '789012', emoji: '🎵', roleId: '2', roleName: 'Active' },
  { id: '3', messageId: '123456', channelId: '789012', emoji: '🎨', roleId: '3', roleName: 'VIP' },
];

const mockAutoRoles: AutoRole[] = [
  { id: '1', roleId: '1', roleName: 'Member', delay: 0 },
  { id: '2', roleId: '4', roleName: 'Helper', delay: 300 },
];

export default function RolesPage() {
  const { guildId } = useParams();
  const [activeTab, setActiveTab] = useState<'reaction' | 'button' | 'auto'>('reaction');
  const [roles, setRoles] = useState<Role[]>([]);
  const [reactionRoles, setReactionRoles] = useState<ReactionRole[]>([]);
  const [autoRoles, setAutoRoles] = useState<AutoRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRolesData();
  }, [guildId]);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      setError('');

      const [rolesRes, reactionRolesRes, autoRolesRes] = await Promise.all([
        fetch(`/api/roles?guildId=${guildId}`),
        fetch(`/api/roles/reaction?guildId=${guildId}`),
        fetch(`/api/roles/auto?guildId=${guildId}`),
      ]);

      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles || []);
      }

      if (reactionRolesRes.ok) {
        const data = await reactionRolesRes.json();
        setReactionRoles(data.reactionRoles || []);
      }

      if (autoRolesRes.ok) {
        const data = await autoRolesRes.json();
        setAutoRoles(data.autoRoles || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-3"
          >
            ⏳
          </motion.div>
          <p className="text-text-secondary">Loading roles...</p>
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
        title="Role Management"
        subtitle="Create and manage server roles for your members"
        emoji="🎭"
      />

      {error && <CuteInfoBox type="error" title="Error" message={error} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CuteStat emoji="👥" label="Total Roles" value={roles.length} change={10} />
        <CuteStat emoji="💬" label="Reaction Roles" value={reactionRoles.length} />
        <CuteStat emoji="⚡" label="Auto Roles" value={autoRoles.length} />
      </div>

      <CuteDivider />

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {(['reaction', 'button', 'auto'] as const).map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex-shrink-0 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-accent-pink to-accent-lavender text-white shadow-lg shadow-accent-pink/50'
                : 'bg-surface-card border border-accent-pink/20 text-accent-pink hover:border-accent-pink/50'
            }`}
          >
            {tab === 'reaction' && '💬 Reaction Roles'}
            {tab === 'button' && '🔘 Button Roles'}
            {tab === 'auto' && '⚡ Auto Roles'}
          </motion.button>
        ))}
      </div>

      <CuteDivider />

      {/* Reaction Roles Tab */}
      {activeTab === 'reaction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CuteSection emoji="💬" title="Reaction Roles">
              {reactionRoles.length === 0 ? (
                <CuteEmptyState 
                  emoji="💬" 
                  title="No Reaction Roles Yet" 
                  message="Create your first reaction role to let users self-assign roles" 
                />
              ) : (
                <div className="space-y-3">
                  {reactionRoles.map((rr, idx) => (
                    <motion.div
                      key={rr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-card/50 border border-accent-pink/10 hover:border-accent-pink/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{rr.emoji}</div>
                        <div>
                          <p className="font-semibold text-text-primary">{rr.roleName}</p>
                          <p className="text-xs text-text-secondary">Message ID: {rr.messageId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <CuteButton variant="ghost" icon="✏️">Edit</CuteButton>
                        <CuteButton variant="danger" icon="🗑️">Delete</CuteButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.div className="mt-6">
                <CuteButton variant="primary" icon="✨">
                  Create Reaction Role
                </CuteButton>
              </motion.div>
            </CuteSection>
          </div>

          <div>
            <CuteSection emoji="ℹ️" title="How It Works">
              <div className="space-y-4 text-sm">
                <CuteInfoBox 
                  type="info" 
                  message="Users can react with emojis to get roles!" 
                />
                <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                  <li>Create a message in a channel</li>
                  <li>Add emoji reactions</li>
                  <li>Assign roles to emojis</li>
                  <li>Users react to auto-assign</li>
                </ol>
              </div>
            </CuteSection>
          </div>
        </div>
      )}

      {/* Button Roles Tab */}
      {activeTab === 'button' && (
        <CuteSection emoji="🔘" title="Button Roles">
          <CuteEmptyState 
            emoji="🔘" 
            title="Coming Soon" 
            message="Button roles will let users click buttons to self-assign roles" 
          />
          <div className="mt-6">
            <CuteButton variant="primary" icon="🔘" disabled>
              Coming Soon
            </CuteButton>
          </div>
        </CuteSection>
      )}

      {/* Auto Roles Tab */}
      {activeTab === 'auto' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CuteSection emoji="⚡" title="Auto Roles">
              {autoRoles.length === 0 ? (
                <CuteEmptyState 
                  emoji="⚡" 
                  title="No Auto Roles" 
                  message="Add roles that will be automatically assigned to new members" 
                />
              ) : (
                <div className="space-y-3">
                  {autoRoles.map((ar, idx) => (
                    <motion.div
                      key={ar.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-card/50 border border-accent-pink/10 hover:border-accent-pink/30 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-text-primary">{ar.roleName}</p>
                        <p className="text-xs text-text-secondary">
                          ⏱️ {ar.delay === 0 ? 'Immediate' : `${ar.delay} seconds delay`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CuteButton variant="ghost" icon="✏️">Edit</CuteButton>
                        <CuteButton variant="danger" icon="🗑️">Delete</CuteButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.div className="mt-6">
                <CuteButton variant="primary" icon="⚡">
                  Add Auto Role
                </CuteButton>
              </motion.div>
            </CuteSection>
          </div>

          <div>
            <CuteSection emoji="ℹ️" title="About Auto Roles">
              <div className="space-y-4 text-sm">
                <CuteInfoBox 
                  type="info" 
                  message="Automatically assign roles when members join!" 
                />
                <p className="text-text-secondary">
                  You can set a delay to prevent raid attacks or to give users time to read the rules.
                </p>
                <CuteInfoBox 
                  type="warning" 
                  title="Tip"
                  message="Use this for basic member roles!" 
                />
              </div>
            </CuteSection>
          </div>
        </div>
      )}
    </motion.div>
  );
}
          onConfirm={() => setShowCreateModal(false)}
        >
          <div className="space-y-4">
            <Select
              label="Channel"
              options={[
                { value: '', label: 'Select a channel' },
                ...channels.map((ch) => ({ value: ch.id, label: `#${ch.name}` })),
              ]}
            />
            <Input label="Message ID" placeholder="The Discord message ID" />
            <Select
              label="Role"
              options={[
                { value: '', label: 'Select a role' },
                ...roles.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            <Input label="Emoji" placeholder="🎮" />
          </div>
        </Modal>
      )}
    </div>
  );
}
