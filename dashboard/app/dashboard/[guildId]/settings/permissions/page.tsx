'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiPlus, FiUser, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function PermissionsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const roles = [
    { name: 'Admin', color: '#ff4d4d', permissions: ['ALL'] },
    { name: 'Moderator', color: '#4d94ff', permissions: ['KICK', 'BAN', 'MUTE', 'WARN'] },
    { name: 'Staff', color: '#4dff88', permissions: ['WARN', 'MUTE'] },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Settings', href: `/dashboard/${guildId}/settings` },
          { label: 'Permissions', href: `/dashboard/${guildId}/settings/permissions` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary px-6 h-11">Sync Roles</Button>
           <Button variant="primary" className="shadow-glow-pink px-8 h-11"><FiPlus className="mr-2" /> New Override</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-300">
              <div className="p-8 border-b border-white/40 bg-white/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl shadow-sm">
                       <FiShield />
                    </div>
                    <div>
                       <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Dashboard Access</h2>
                       <p className="text-text-secondary text-sm">Control exactly who can view and edit the server's configuration.</p>
                    </div>
                 </div>
              </div>
              <CardBody className="p-8 space-y-6">
                 {roles.map(role => (
                   <div key={role.name} className="p-4 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-between group hover:bg-white/60 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: role.color }} />
                         <span className="font-bold text-text-primary">{role.name}</span>
                         <div className="flex gap-1 ml-2">
                            {role.permissions.map(p => (
                              <Badge key={p} type="info" className="text-[10px] py-0 px-2 uppercase">{p}</Badge>
                            ))}
                         </div>
                      </div>
                      <button className="p-2 hover:bg-black/5 rounded-xl text-text-tertiary transition-colors opacity-0 group-hover:opacity-100"><FiSettings /></button>
                   </div>
                 ))}
                 <p className="text-center text-xs text-text-tertiary italic">Looking for more granular control? 🌸</p>
              </CardBody>
           </GlassCard>

           <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl p-8 space-y-6">
              <h3 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
                 <FiUser className="text-lavender" /> Specific User Overrides
              </h3>
              <div className="h-48 rounded-2xl bg-gradient-to-br from-lavender/5 to-white/50 border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-center p-8">
                 <p className="text-text-secondary text-sm font-medium mb-4 italic">No personal overrides set yet.</p>
                 <Button variant="ghost" className="bg-lavender/10 border-lavender/20 text-lavender hover:bg-lavender/20 rounded-2xl flex items-center gap-2"><FiPlus /> Add User</Button>
              </div>
           </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white border-white/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FiLock className="text-6xl" /></div>
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                 🛡️ Security Hardening
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Admin Only Panels', active: true },
                   { label: 'Action 2FA', active: false },
                   { label: 'IP Lock', active: false },
                 ].map(s => (
                   <div key={s.label} className="p-4 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-between">
                      <span className="text-sm font-bold text-text-primary">{s.label}</span>
                      <div className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${s.active ? 'bg-mint/10 border-mint/20 text-mint' : 'bg-red-400/10 border-red-400/20 text-red-400'}`}>
                         {s.active ? <FiCheck /> : <FiX />}
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 bg-pink/5 border-pink/20 text-pink hover:bg-pink/10 rounded-2xl h-11">Review Security Settings</Button>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
