'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiClock, FiPlus, FiTrash2, FiUserPlus, FiShield } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function AutoRolesPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const autoRoles = [
    { id: '1', role: 'Member🌸', delay: 'Immediate', type: 'JOIN' },
    { id: '2', role: 'Verified✨', delay: '10m', type: 'JOIN' },
    { id: '3', role: 'OG Looky👑', delay: '30d', type: 'STAY' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Roles', href: `/dashboard/${guildId}/roles` },
          { label: 'Auto Roles', href: `/dashboard/${guildId}/roles/auto` }
        ]} />
        <Button variant="primary" className="shadow-glow-pink h-11 px-6 flex items-center gap-2">
           <FiPlus /> New Auto-Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           {autoRoles.map((ar, idx) => (
             <motion.div
               key={ar.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
                <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-300">
                   <CardBody className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-3xl shadow-sm">
                            <FiUserPlus />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                               {ar.role} 
                               <Badge type={ar.type === 'JOIN' ? 'info' : 'success'} className="text-[10px] py-0 px-2 uppercase">{ar.type}</Badge>
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                               <span className="flex items-center gap-1"><FiClock className="text-pink/60" /> Delay: {ar.delay}</span>
                               <span className="flex items-center gap-1"><FiShield className="text-lavender/60" /> Bypasses: BOT, VERIFIED</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-3 hover:bg-black/5 rounded-2xl text-text-tertiary transition-colors"><FiClock /></button>
                         <button className="p-3 hover:bg-red-50 rounded-2xl text-red-400 transition-colors"><FiTrash2 /></button>
                      </div>
                   </CardBody>
                </GlassCard>
             </motion.div>
           ))}
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white border-white/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FiUserPlus className="text-6xl" /></div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Why Auto-Roles?</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">Auto-roles help you segment your community instantly upon joining or staying for a target duration. Perfect for tiered access!</p>
              <div className="p-4 rounded-2xl bg-pink/5 border border-pink/20 text-xs font-medium text-pink leading-normal">
                 ⚠️ Warning: Ensure the Bot role is HIGHER than the auto-roles in Discord Settings.
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
