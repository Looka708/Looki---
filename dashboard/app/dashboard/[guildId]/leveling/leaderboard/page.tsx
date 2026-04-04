'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { CuteTable } from '@/components/CuteComponents';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiSettings, FiAward, FiStar, FiSearch } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function LeaderboardPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const mockLeaderboard = [
    { rank: 1, name: 'Crystal🌸', id: '123', level: 45, xp: 12500, messages: 3200, status: 'Active' },
    { rank: 2, name: 'Moonlight✨', id: '456', level: 42, xp: 11200, messages: 2800, status: 'Active' },
    { rank: 3, name: 'Sakura🍡', id: '789', level: 38, xp: 9500, messages: 2100, status: 'Active' },
    { rank: 4, name: 'Hoshi⭐', id: '101', level: 35, xp: 8800, messages: 1900, status: 'Away' },
    { rank: 5, name: 'Yuki❄️', id: '202', level: 30, xp: 7500, messages: 1500, status: 'Active' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Leveling', href: `/dashboard/${guildId}/leveling` },
          { label: 'Leaderboard', href: `/dashboard/${guildId}/leveling/leaderboard` }
        ]} />
        <div className="flex gap-3">
           <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="text" placeholder="Search user..." className="pl-10 pr-4 py-2 rounded-2xl bg-white/40 border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 w-48 transition-all" />
           </div>
           <Button variant="primary" className="shadow-glow-pink h-10">Export Stats</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top 3 Podium Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {mockLeaderboard.slice(0, 3).map((user, idx) => (
             <motion.div
               key={user.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
                <GlassCard className={`p-8 rounded-3xl border-2 text-center transition-all duration-500 overflow-hidden relative group ${
                  idx === 0 ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white' : 
                  idx === 1 ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-white' : 
                  'border-orange-200 bg-gradient-to-br from-orange-50 to-white'
                }`}>
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FiAward className="text-8xl" />
                   </div>
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold mx-auto mb-4 border-4 ${
                     idx === 0 ? 'bg-yellow-100 border-yellow-300 text-yellow-700 shadow-glow-peach' : 
                     idx === 1 ? 'bg-gray-100 border-gray-300 text-gray-700 shadow-lg' : 
                     'bg-orange-100 border-orange-300 text-orange-700 shadow-lg'
                   }`}>
                      #{user.rank}
                   </div>
                   <h3 className="text-xl font-bold text-text-primary mb-1">{user.name}</h3>
                   <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge type="info" className="text-[10px] uppercase font-bold">LVL {user.level}</Badge>
                      <span className="text-xs font-medium text-text-secondary">{user.xp.toLocaleString()} XP</span>
                   </div>
                   <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mb-4">
                      <div className={`h-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'} rounded-full`} style={{ width: `${(user.xp/15000)*100}%` }} />
                   </div>
                   <button className="text-xs font-bold text-text-tertiary hover:text-pink transition-colors">VIEW PROFILE</button>
                </GlassCard>
             </motion.div>
           ))}
        </div>

        {/* Full Table */}
        <div className="lg:col-span-8">
           <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-500">
              <div className="p-8 border-b border-border-subtle/50 bg-white/40 flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl">
                    <FiTrendingUp />
                 </div>
                 <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Full Leaderboard</h2>
                    <p className="text-text-secondary text-sm">Real-time status of server activity and member levels.</p>
                 </div>
              </div>
              <CardBody className="p-0">
                 <CuteTable 
                   columns={[
                      { key: 'rank', label: 'Rank', render: (val) => <span className="font-bold text-text-tertiary">#{val}</span> },
                      { key: 'name', label: 'Member', render: (val) => <div className="font-bold text-text-primary">{val}</div> },
                      { key: 'level', label: 'Level', render: (val) => <Badge type="info" className="font-bold px-3">LVL {val}</Badge> },
                      { key: 'xp', label: 'XP', render: (val) => <span className="text-text-secondary text-sm font-medium">{val.toLocaleString()}</span> },
                      { key: 'messages', label: 'Messages', render: (val) => <span className="text-text-tertiary text-sm">{val.toLocaleString()}</span> },
                   ]}
                   data={mockLeaderboard}
                   striped
                 />
              </CardBody>
           </GlassCard>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="p-8 rounded-3xl bg-white border-white/60 shadow-xl text-center">
              <div className="w-16 h-16 bg-lavender/10 rounded-2xl flex items-center justify-center text-lavender text-3xl mx-auto mb-4">
                 <FiStar />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">Total XP Generated</h3>
              <p className="text-3xl font-display font-bold text-lavender mb-2 animate-pulse-glow">1.2M+</p>
              <p className="text-xs text-text-secondary italic">Server-wide activity metric</p>
           </GlassCard>

           <GlassCard className="p-8 rounded-3xl bg-gradient-to-br from-pink to-lavender border-pink shadow-glow-pink text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🏅 Reward Config</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">Need to configure automated role rewards based on level?</p>
              <Button variant="ghost" className="w-full bg-white/20 border-white/40 text-white hover:bg-white/30 rounded-2xl flex items-center justify-center gap-2">
                 <FiSettings /> Level Settings
              </Button>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
