'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiPlus, FiSmile, FiEdit2, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function ReactionRolesPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const reactionRoles = [
    { id: '1', name: 'Color Picker', messageId: '123456789', channel: '#general', emojis: ['🔴', '🔵', '🟢'], roles: ['Red', 'Blue', 'Green'] },
    { id: '2', name: 'Identity Roles', messageId: '987654321', channel: '#self-roles', emojis: ['👦', '👧', '🌈'], roles: ['He/Him', 'She/Her', 'They/Them'] },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Roles', href: `/dashboard/${guildId}/roles` },
          { label: 'Reaction Roles', href: `/dashboard/${guildId}/roles/reaction` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary px-6 h-11">Import YAML</Button>
           <Button variant="primary" className="shadow-glow-pink px-8 h-11 flex items-center gap-2">
              <FiPlus /> New Interaction
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {reactionRoles.map((rr, idx) => (
             <motion.div
               key={rr.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
                <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
                   <div className="p-6 border-b border-white/40 bg-white/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-pink/10 rounded-xl flex items-center justify-center text-pink text-xl">
                            <FiSmile />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-text-primary">{rr.name}</h3>
                            <p className="text-xs text-text-tertiary">Message ID: {rr.messageId} in {rr.channel}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 hover:bg-black/5 rounded-lg text-text-tertiary transition-colors"><FiEdit2 /></button>
                         <button className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><FiTrash2 /></button>
                      </div>
                   </div>
                   <CardBody className="p-6 overflow-x-auto">
                      <div className="flex gap-4">
                         {rr.emojis.map((emoji, i) => (
                           <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md transition-all group">
                              <span className="text-2xl group-hover:scale-125 transition-transform">{emoji}</span>
                              <Badge type="info" className="text-[10px] py-0 px-2 truncate w-full text-center">{rr.roles[i]}</Badge>
                           </div>
                         ))}
                         <button className="flex flex-col items-center justify-center gap-2 min-w-[80px] p-4 rounded-2xl border-2 border-dashed border-border-subtle hover:border-pink/30 hover:bg-pink/5 transition-all group">
                            <FiPlus className="text-xl text-text-tertiary group-hover:text-pink" />
                            <span className="text-[10px] font-bold text-text-tertiary group-hover:text-pink">ADD</span>
                         </button>
                      </div>
                   </CardBody>
                </GlassCard>
             </motion.div>
           ))}
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white/60 border-white/60 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                 <FiMessageSquare className="text-peach" /> Global Settings
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Role Cooldown', value: '1.2s', desc: 'Prevents role spamming.' },
                   { label: 'Unique Roles', value: 'On', desc: 'Allows only one role per message.' },
                   { label: 'DM Notifications', value: 'Off', desc: 'Notify user when role changes.' },
                 ].map(setting => (
                   <div key={setting.label}>
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-bold text-text-primary underline decoration-dotted decoration-border-subtle underline-offset-4">{setting.label}</span>
                         <Badge type={setting.value === 'On' ? 'success' : setting.value === 'Off' ? 'warn' : 'info'}>{setting.value}</Badge>
                      </div>
                      <p className="text-[10px] text-text-tertiary">{setting.desc}</p>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 border-peach/20 bg-peach/10 text-peach hover:bg-peach/20 font-bold rounded-2xl h-11">
                 Update Globally
              </Button>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
