'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { CuteTable } from '@/components/CuteComponents';
import { FiAlertCircle, FiTrash2, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function WarningsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const mockWarnings = [
    { id: '1', user: 'Noob#1234', mod: 'Mod#0001', reason: 'Self-promotion in #general.', date: '2026-04-01' },
    { id: '2', user: 'Spammy#9999', mod: 'System', reason: 'Repeated caps in #lounge.', date: '2026-04-02' },
    { id: '3', user: 'ToxicGuy#5555', mod: 'Mod#0003', reason: 'Disrespectful behavior.', date: '2026-04-03' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4">
        <Breadcrumb items={[
          { label: 'Moderation', href: `/dashboard/${guildId}/moderation` },
          { label: 'Warnings', href: `/dashboard/${guildId}/moderation/warnings` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60">Search Users</Button>
           <Button variant="primary" className="shadow-glow-pink">Issue Warning</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
            <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center gap-4">
               <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl">
                  <FiAlertCircle />
               </div>
               <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Warning History</h2>
                  <p className="text-text-secondary text-sm">Detailed record of all verbal and digital warnings issued.</p>
               </div>
            </div>
            <CardBody className="p-0">
               <CuteTable 
                 columns={[
                    { key: 'user', label: 'User', render: (val) => <div className="flex items-center gap-2"><FiUser className="text-pink/60" /> {val}</div> },
                    { key: 'mod', label: 'Moderator' },
                    { key: 'reason', label: 'Reason', render: (val) => <div className="flex items-center gap-2"><FiFileText className="text-lavender/60" /> {val}</div> },
                    { key: 'date', label: 'Date', render: (val) => <div className="flex items-center gap-2"><FiCalendar className="text-peach/60" /> {val}</div> },
                    { 
                      key: 'actions', 
                      label: 'Tools', 
                      render: () => (
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Delete warning"><FiTrash2 /></button>
                        </div>
                      ) 
                    }
                 ]}
                 data={mockWarnings}
                 striped
               />
            </CardBody>
          </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white/60 border-white/60 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                 🛡️ Auto-Actions
              </h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">System automatically acts after multiple warnings.</p>
              <div className="space-y-4">
                 {[
                   { warnings: 3, action: 'MUTE', duration: '2h' },
                   { warnings: 5, action: 'KICK', duration: 'Permanent' },
                   { warnings: 10, action: 'BAN', duration: 'Permanent' },
                 ].map(config => (
                   <div key={config.warnings} className="p-4 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-between border-l-4 border-l-pink">
                      <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest">{config.warnings} Warnings</div>
                      <Badge type={config.action.toLowerCase() as any}>{config.action}</Badge>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-pink hover:text-pink-dim font-bold text-sm bg-pink/5 hover:bg-pink/10 border-pink/20">Edit Thresholds</Button>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
