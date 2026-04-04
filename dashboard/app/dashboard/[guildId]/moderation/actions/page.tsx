'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { CuteTable } from '@/components/CuteComponents';
import { motion } from 'framer-motion';
import { FiShield, FiSlash, FiClock, FiTrash2 } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function ActionsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const mockActions = [
    { id: '1', user: 'ToxicUser#1234', mod: 'Mod#0001', type: 'BAN', reason: 'Spamming and toxicity.', time: '2h ago' },
    { id: '2', user: 'SpamBot#9999', mod: 'System', type: 'KICK', reason: 'Automated spam detection.', time: '5h ago' },
    { id: '3', user: 'Noob#5555', mod: 'Mod#0002', type: 'MUTE', reason: 'Continuous swearing after 3 warnings.', time: '1d ago' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white/30 p-4 rounded-3xl backdrop-blur-md border border-white/60 mb-8">
        <Breadcrumb items={[
          { label: 'Moderation', href: `/dashboard/${guildId}/moderation` },
          { label: 'Actions', href: `/dashboard/${guildId}/moderation/actions` }
        ]} />
        <Badge type="ban" className="px-4 py-1.5 rounded-full font-bold shadow-sm">🛡️ Server Security</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-peach/30 transition-all duration-500">
            <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-peach/10 rounded-2xl flex items-center justify-center text-peach text-2xl">
                    <FiShield />
                 </div>
                 <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Recent Actions</h2>
                    <p className="text-text-secondary text-sm">Full history of punishments in this server.</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="rounded-xl border border-white/60 bg-white/40">Export Logs</Button>
                 <Button variant="primary" className="shadow-glow-pink">Take Action</Button>
              </div>
            </div>
            <CardBody className="p-0">
               <CuteTable 
                 columns={[
                    { key: 'type', label: 'Type', render: (val) => <Badge type={val.toLowerCase() as any}>{val}</Badge> },
                    { key: 'user', label: 'User' },
                    { key: 'mod', label: 'Moderator' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'time', label: 'Time' },
                    { 
                      key: 'actions', 
                      label: 'Tools', 
                      render: () => (
                        <div className="flex gap-1">
                           <button className="p-2 hover:bg-black/5 rounded-lg text-peach transition-colors" title="Revoke"><FiSlash /></button>
                           <button className="p-2 hover:bg-black/5 rounded-lg text-text-tertiary transition-colors" title="History"><FiClock /></button>
                           <button className="p-2 hover:bg-black/5 rounded-lg text-red-400 transition-colors" title="Delete Log"><FiTrash2 /></button>
                        </div>
                      ) 
                    }
                 ]}
                 data={mockActions}
                 striped
               />
            </CardBody>
          </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-peach shadow-glow-peach border-peach text-white/90">
              <h3 className="text-xl font-bold mb-2">Moderation Pro-Tip 🛡️</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">Using AutoMod combined with Custom Warning levels can reduce spam by 80% on active servers.</p>
              <Button variant="ghost" className="w-full bg-white/20 border-white/40 text-white hover:bg-white/30 rounded-2xl">Setup AutoMod</Button>
           </GlassCard>

           <GlassCard className="p-8 rounded-3xl bg-white/60 border-white/60 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                 ⚡ Punishment Stats
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Total Bans', count: 124, color: 'bg-red-400' },
                   { label: 'Total Kicks', count: 45, color: 'bg-orange-400' },
                   { label: 'Warnings', count: 1205, color: 'bg-yellow-400' },
                 ].map(stat => (
                   <div key={stat.label}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                         <span className="text-text-secondary">{stat.label}</span>
                         <span className="text-text-primary">{stat.count}</span>
                      </div>
                      <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                         <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${Math.min(100, (stat.count/1500)*100)}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
