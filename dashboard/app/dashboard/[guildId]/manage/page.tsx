'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiSettings, FiGrid, FiLayout, FiMaximize, FiStar } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function ManagePage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white/30 p-4 rounded-3xl backdrop-blur-md border border-white/60 mb-8">
        <Breadcrumb items={[{ label: 'Server Management', href: `/dashboard/${guildId}/manage` }]} />
        <Badge type="info" className="px-4 py-1.5 rounded-full font-bold shadow-sm">🌸 Global Manager</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
            <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl">
                    <FiLayout />
                 </div>
                 <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Core Modules</h2>
                    <p className="text-text-secondary text-sm">Control which features are active on your server.</p>
                 </div>
              </div>
              <Button variant="primary" className="shadow-glow-pink">Save Layout</Button>
            </div>
            <CardBody className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Moderation Toolkit', desc: 'Auto-logs, warnings, and protection.', active: true, icon: '🛡️' },
                { name: 'Leveling System', desc: 'XP, ranks, and custom leaderboards.', active: true, icon: '📈' },
                { name: 'Welcome Message', desc: 'Customizable greetings for new members.', active: false, icon: '👋' },
                { name: 'Utility Commands', desc: 'Reminders, polls, and info commands.', active: true, icon: '⚙️' },
              ].map(module => (
                <div key={module.name} className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group cursor-pointer active:scale-95">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{module.icon}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${module.active ? 'bg-mint' : 'bg-border-subtle'}`}>
                         <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${module.active ? 'right-1' : 'left-1'}`} />
                      </div>
                   </div>
                   <h3 className="font-bold text-text-primary mb-1">{module.name}</h3>
                   <p className="text-xs text-text-secondary leading-relaxed">{module.desc}</p>
                </div>
              ))}
            </CardBody>
          </GlassCard>

          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden p-8">
             <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-lavender/10 rounded-2xl flex items-center justify-center text-lavender text-2xl">
                    <FiMaximize />
                 </div>
                 <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Advanced Discovery</h2>
                    <p className="text-text-secondary text-sm">Manage how your server appears in global lists.</p>
                 </div>
              </div>
              <div className="h-48 rounded-2xl bg-gradient-to-br from-pink/5 via-lavender/5 to-peach/5 border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-center p-8">
                 <FiGrid className="text-4xl text-text-tertiary mb-3 opacity-50" />
                 <p className="text-text-secondary font-medium italic">Advanced management tools coming soon to Looki Pro 🌸</p>
              </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl p-8 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-peach/10 rounded-full flex items-center justify-center text-peach text-4xl mb-6 shadow-glow-peach">
                <FiStar />
             </div>
             <h3 className="text-xl font-bold text-text-primary mb-2">Support Looki</h3>
             <p className="text-text-secondary text-sm mb-6">Love using Looki for your server? Consider supporting the development to unlock exclusive 🌸 features.</p>
             <Button variant="primary" className="w-full shadow-glow-pink">Explore Premium</Button>
          </GlassCard>

          <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl p-8">
             <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <FiSettings className="text-pink animate-spin-slow" /> Stats at a Glance
             </h3>
             <div className="space-y-4">
                {[
                  { label: 'Uptime', value: '100%', color: 'text-mint' },
                  { label: 'Region', value: 'Global Decor', color: 'text-lavender' },
                  { label: 'Bot Latency', value: '24ms', color: 'text-peach' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center py-3 border-b border-white/30 last:border-0">
                    <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
