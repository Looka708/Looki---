'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiTrash2, FiRefreshCcw, FiXCircle, FiLock } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function DangerZonePage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-red-50/30 p-6 rounded-3xl backdrop-blur-md border border-red-200/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Settings', href: `/dashboard/${guildId}/settings` },
          { label: 'Danger Zone', href: `/dashboard/${guildId}/settings/danger` }
        ]} />
        <Badge type="warn" className="px-4 py-1.5 rounded-full font-bold shadow-sm bg-red-400 text-white border-transparent">⚠️ High Risk Area</Badge>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <GlassCard className="rounded-3xl border-red-200/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-red-400/30 transition-all duration-300">
           <div className="p-8 border-b border-red-100/50 bg-red-50/40 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 text-2xl shadow-sm">
                 <FiRefreshCcw />
              </div>
              <div>
                 <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Reset Server Data</h2>
                 <p className="text-text-secondary text-sm">Wipe all configuration, levels, and logs for this server.</p>
              </div>
           </div>
           <CardBody className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-sm text-text-secondary leading-relaxed">
                 This action is <span className="font-bold text-red-500">irreversible</span>. All XP, custom moderation settings, and audit logs will be permanently deleted from the Looki 🌸 database.
              </div>
              <Button variant="ghost" className="bg-red-400/10 border-red-400/20 text-red-400 hover:bg-red-400/20 rounded-2xl h-11 px-6 whitespace-nowrap font-bold">Reset All Data</Button>
           </CardBody>
        </GlassCard>

        <GlassCard className="rounded-3xl border-red-200/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-red-400/30 transition-all duration-300">
           <div className="p-8 border-b border-red-100/50 bg-red-50/40 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 text-2xl shadow-sm">
                 <FiXCircle />
              </div>
              <div>
                 <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Leave Server</h2>
                 <p className="text-text-secondary text-sm">Force Looki 🌸 to leave your Discord server.</p>
              </div>
           </div>
           <CardBody className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-sm text-text-secondary leading-relaxed">
                 Looki will immediately stop functioning and all dashboard access for this server will be suspended.
              </div>
              <Button variant="ghost" className="bg-red-400/10 border-red-400/20 text-red-400 hover:bg-red-400/20 rounded-2xl h-11 px-6 whitespace-nowrap font-bold">Force Leave</Button>
           </CardBody>
        </GlassCard>

        <div className="p-8 rounded-3xl bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-xl flex flex-col sm:flex-row items-center gap-8 border-t-4 border-white/20">
           <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-white text-4xl shadow-sm flex-shrink-0 animate-pulse-glow">
              <FiLock />
           </div>
           <div className="text-center sm:text-left flex-grow">
              <h3 className="text-2xl font-display font-bold mb-1 tracking-tight">Security Lock 🔒</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Critical actions require 2FA verification. Your account is currently secured.</p>
              <div className="flex justify-center sm:justify-start gap-2">
                 <Badge type="info" className="bg-white/30 text-white font-bold p-1 px-3 uppercase tracking-widest text-[10px]">Verified 2FA</Badge>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
