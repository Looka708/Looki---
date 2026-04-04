'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiList, FiCheckCircle, FiSearch, FiFilter, FiDownload, FiTrash2 } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function LogsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const mockLogs = [
    { id: '1', action: 'Member Joined', user: 'Sakura🌸', date: '2026-04-03 14:22', details: 'Added to #general' },
    { id: '2', action: 'Role Added', user: 'Hoshi⭐', date: '2026-04-03 14:15', details: 'Assigned: Active Member' },
    { id: '3', action: 'Message Deleted', user: 'Mod#0001', date: '2026-04-03 13:50', details: 'Removed spam in #lounge' },
    { id: '4', action: 'Bot Invited', user: 'Owner', date: '2026-04-03 12:00', details: 'Looki 🌸 has arrived!' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Settings', href: `/dashboard/${guildId}/settings` },
          { label: 'Logs', href: `/dashboard/${guildId}/settings/logs` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary px-6 h-11"><FiDownload className="mr-2" /> Export</Button>
           <Button variant="primary" className="shadow-glow-pink px-8 h-11"><FiCheckCircle className="mr-2" /> Sync Logs</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
            <div className="p-8 border-b border-white/40 bg-white/30 flex flex-col sm:flex-row justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl shadow-sm">
                     <FiList />
                  </div>
                  <div>
                     <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Activity Stream</h2>
                     <p className="text-text-secondary text-sm">Detailed logs of everything happening in the dashboard.</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                     <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                     <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 rounded-2xl bg-white/40 border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-pink/20 h-10 w-full lg:w-48 transition-all" />
                  </div>
                  <button className="p-2 w-10 h-10 flex items-center justify-center bg-white/40 border border-white/60 rounded-xl hover:bg-white/60 text-text-primary transition-all"><FiFilter /></button>
               </div>
            </div>
            <CardBody className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/40 border-b border-white/40">
                           <th className="px-8 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Time</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Action</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Actor</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Details</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/40">
                        {mockLogs.map((log, idx) => (
                          <tr key={log.id} className="hover:bg-white/60 transition-colors">
                             <td className="px-8 py-4 text-xs font-medium text-text-tertiary">{log.date}</td>
                             <td className="px-8 py-4">
                                <Badge type="info" className="text-[10px] py-0 px-2 font-bold uppercase">{log.action}</Badge>
                             </td>
                             <td className="px-8 py-4 text-sm font-bold text-text-primary">{log.user}</td>
                             <td className="px-8 py-4 text-xs text-text-secondary italic">"{log.details}"</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-8 text-center text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-white/20">
                  Showing latest 50 entries. Upgrade to Pro for 1-year history.
               </div>
            </CardBody>
          </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white border-white/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FiTrash2 className="text-6xl" /></div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Auto-Cleanup</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">Logs are cleared every 30 days to keep your dashboard fast and snapy.</p>
              <div className="p-4 rounded-2xl bg-peach/5 border border-peach/20 text-xs font-bold text-peach text-center">
                 Next Cleanup: April 30, 2026
              </div>
           </GlassCard>

           <GlassCard className="p-8 rounded-3xl bg-gradient-to-br from-pink to-lavender border-pink shadow-glow-pink text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🔍 Audit Logs</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">Need to see precisely who changed which setting? Get detailed audit logs with Looki Pro.</p>
              <Button variant="ghost" className="w-full bg-white/20 border-white/40 text-white hover:bg-white/30 rounded-2xl flex items-center justify-center gap-2">
                 See Pro Pricing
              </Button>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
