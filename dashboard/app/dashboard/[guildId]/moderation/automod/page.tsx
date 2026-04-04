'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiZap, FiEdit2, FiToggleRight, FiShield, FiXCircle } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function AutoModPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const autoModFeatures = [
    { id: '1', name: 'Link Detection', description: 'Blocks all invites/external links from non-moderators.', icon: '🔗', active: true },
    { id: '2', name: 'Spam Protection', description: 'Filters out rapid-fire messaging and duplicate content.', icon: '⚡', active: true },
    { id: '3', name: 'Bad Word Filter', description: 'Automatically removes phrases from your customized blacklist.', icon: '🙊', active: false },
    { id: '4', name: 'Auto-Caps Guard', description: 'Warns users for excessive capital letters.', icon: '🔠', active: false },
    { id: '5', name: 'Mass Mention Shield', description: 'Prevents raids by blocking messages with too many @mentions.', icon: '👥', active: true },
    { id: '6', name: 'AI Image Scanner', description: 'Scan and flag inappropriate media using Looki AI.', icon: '👁️', active: false },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4">
        <Breadcrumb items={[
          { label: 'Moderation', href: `/dashboard/${guildId}/moderation` },
          { label: 'AutoMod', href: `/dashboard/${guildId}/moderation/automod` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary h-10 px-4">Global Reset</Button>
           <Button variant="primary" className="shadow-glow-pink h-10 px-6">Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {autoModFeatures.map((feature, idx) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard className={`h-full rounded-3xl border-2 transition-all duration-300 ${feature.active ? 'border-pink/20 bg-white/60' : 'border-white/60 bg-white/40 opacity-70'}`}>
              <CardBody className="p-6 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white">
                       {feature.icon}
                    </div>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${feature.active ? 'bg-mint' : 'bg-border-subtle'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${feature.active ? 'right-1 shadow-sm' : 'left-1'}`} />
                    </div>
                 </div>
                 <h3 className="text-xl font-display font-bold text-text-primary mb-2 flex items-center gap-2">
                    {feature.name}
                    {feature.id === '6' && <Badge type="info" className="text-[10px] py-0 px-2 uppercase">Beta</Badge>}
                 </h3>
                 <p className="text-sm text-text-secondary leading-relaxed flex-grow">
                    {feature.description}
                 </p>
                 <div className="mt-6 pt-4 border-t border-white/40 flex justify-between items-center">
                    <button className="text-pink hover:text-pink-dim text-xs font-bold flex items-center gap-1 group">
                       <FiEdit2 className="group-hover:translate-x-0.5 transition-transform" /> CONFIGURE
                    </button>
                    {feature.active && (
                       <div className="flex items-center gap-1 text-[10px] font-bold text-mint uppercase tracking-wider">
                          <FiZap className="animate-pulse" /> Active Protection
                       </div>
                    )}
                 </div>
              </CardBody>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="rounded-3xl border-white/60 bg-gradient-to-r from-pink/10 to-lavender/10 p-8 flex flex-col sm:flex-row items-center gap-8 shadow-xl">
         <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-peach text-4xl shadow-glow-peach flex-shrink-0 animate-bounce-slow">
            <FiShield />
         </div>
         <div className="text-center sm:text-left flex-grow">
            <h3 className="text-2xl font-display font-bold text-text-primary mb-1 tracking-tight">Need stricter security? 🛡️</h3>
            <p className="text-text-secondary leading-relaxed">Combine AutoMod with our new global reputation score to instantly block known bad actors before they even speak.</p>
         </div>
         <Button variant="primary" className="shadow-glow-pink whitespace-nowrap">Upgrade to Looki Pro</Button>
      </GlassCard>
    </div>
  );
}
