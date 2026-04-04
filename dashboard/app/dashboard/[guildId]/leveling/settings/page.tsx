'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiEdit2, FiType, FiStar, FiClock, FiShield, FiPlus } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function LevelingSettingsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const roleRewards = [
    { level: 5, role: 'Rookie🌸', color: '#FFD1DC' },
    { level: 10, role: 'Active Member✨', color: '#BDE0FE' },
    { level: 25, role: 'Elite Looky👑', color: '#FFC8DD' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Leveling', href: `/dashboard/${guildId}/leveling` },
          { label: 'Settings', href: `/dashboard/${guildId}/leveling/settings` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary px-6 h-11">Restore Defaults</Button>
           <Button variant="primary" className="shadow-glow-pink px-8 h-11">Save Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
          <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl font-bold">
                  <FiType />
               </div>
               <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Level-Up Message</h2>
                  <p className="text-text-secondary text-sm">Customize how users are celebrated.</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full bg-mint relative cursor-pointer shadow-sm`}>
               <div className={`absolute top-1 right-1 w-4 h-4 bg-white rounded-full`} />
            </div>
          </div>
          <CardBody className="p-8 space-y-6">
             <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Message Template</label>
                <textarea 
                  className="w-full h-32 p-4 rounded-2xl bg-white/40 border border-white/60 text-text-primary focus:outline-none focus:ring-2 focus:ring-pink/20 transition-all font-mono text-sm leading-relaxed"
                  defaultValue="Congrats {user}! You just leveled up to **Level {level}**! Keep blooming! 🌸"
                />
                <p className="text-[10px] text-text-tertiary mt-2">Available tags: {'{user}'}, {'{level}'}, {'{xp}'}, {'{rank}'}</p>
             </div>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60">
                <span className="text-sm font-bold text-text-primary">Direct Message Notification</span>
                <div className={`w-10 h-5 rounded-full bg-border-subtle relative cursor-pointer`}>
                   <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full`} />
                </div>
             </div>
          </CardBody>
        </GlassCard>

        <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
          <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-lavender/10 rounded-2xl flex items-center justify-center text-lavender text-2xl font-bold">
                  <FiStar />
               </div>
               <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Role Rewards</h2>
                  <p className="text-text-secondary text-sm">Automated roles based on levels.</p>
               </div>
            </div>
            <button className="text-lavender hover:text-lavender-dim transition-colors h-10 w-10 flex items-center justify-center bg-lavender/10 rounded-xl">
               <FiPlus />
            </button>
          </div>
          <CardBody className="p-8 space-y-4">
             {roleRewards.map(reward => (
               <div key={reward.level} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all shadow-sm group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center text-xs font-bold text-text-tertiary">LVL {reward.level}</div>
                     <div>
                        <span className="text-sm font-bold text-text-primary">{reward.role}</span>
                        <div className="w-full h-1 bg-lavender/30 rounded-full mt-1" />
                     </div>
                  </div>
                  <button className="text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"><FiEdit2 /></button>
               </div>
             ))}
             <p className="text-xs text-text-tertiary italic text-center pt-2">New members can start earning rewards at level 10+</p>
          </CardBody>
        </GlassCard>

        <GlassCard className="lg:col-span-2 rounded-3xl border-white/60 bg-gradient-to-br from-peach/5 via-white/50 to-pink/5 backdrop-blur-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-white shadow-xl">
           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-peach text-4xl shadow-glow-peach flex-shrink-0">
              <FiClock />
           </div>
           <div className="flex-grow text-center md:text-left space-y-2">
              <h3 className="text-xl font-bold text-text-primary tracking-tight flex items-center justify-center md:justify-start gap-2">
                 Advanced XP Logic ⚡ <Badge type="info" className="text-[10px]">PRO</Badge>
              </h3>
              <p className="text-text-secondary text-sm">Configure XP decay, holiday multipliers, and role-based boosters to customize your server economy.</p>
           </div>
           <Button variant="primary" className="shadow-smooth bg-text-primary text-white hover:bg-black rounded-2xl h-11 px-6 whitespace-nowrap">Explore Pro Logic</Button>
        </GlassCard>
      </div>
    </div>
  );
}
