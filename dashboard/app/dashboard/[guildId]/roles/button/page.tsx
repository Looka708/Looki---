'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiLayout, FiMaximize, FiEdit2, FiTrash2, FiSquare, FiPlus } from 'react-icons/fi';
import { useParams } from 'next/navigation';

export default function ButtonRolesPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const buttonRoles = [
    { id: '1', name: 'Color Shop', channel: '#shop', message: 'Click a button to pick your name color!', buttons: ['RED', 'BLUE', 'GREEN'] },
    { id: '2', name: 'Pronoun Toggles', channel: '#roles', message: 'Select your preferred pronouns.', buttons: ['HE/HIM', 'SHE/HER', 'THEY/THEM'] },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Roles', href: `/dashboard/${guildId}/roles` },
          { label: 'Button Roles', href: `/dashboard/${guildId}/roles/button` }
        ]} />
        <Button variant="primary" className="shadow-smooth bg-text-primary text-white hover:bg-black rounded-2xl h-11 px-8 flex items-center gap-2">
           <FiPlus /> Create Interaction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {buttonRoles.map((br, idx) => (
           <motion.div
             key={br.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: idx * 0.1 }}
           >
              <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-peach/30 transition-all duration-300">
                 <div className="p-6 border-b border-white/40 bg-white/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-peach/10 rounded-xl flex items-center justify-center text-peach text-xl shadow-sm">
                          <FiSquare />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-text-primary">{br.name}</h3>
                          <p className="text-xs text-text-tertiary">Channel: {br.channel}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-black/5 rounded-lg text-text-tertiary transition-colors"><FiEdit2 /></button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><FiTrash2 /></button>
                    </div>
                 </div>
                 <CardBody className="p-6">
                    <div className="mb-6 p-4 rounded-2xl bg-white/40 border border-white/60 text-sm text-text-secondary italic shadow-inner">
                       "{br.message}"
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       {br.buttons.map((btn, i) => (
                         <div key={i} className={`p-3 rounded-xl border border-white/80 shadow-sm text-center text-[10px] font-bold text-white tracking-widest ${
                           i === 0 ? 'bg-red-400/80' : i === 1 ? 'bg-blue-400/80' : 'bg-green-400/80'
                         }`}>
                            {btn}
                         </div>
                       ))}
                       <button className="p-3 rounded-xl border-2 border-dashed border-border-subtle hover:border-peach/30 hover:bg-peach/5 transition-all flex items-center justify-center text-text-tertiary">
                          <FiPlus />
                       </button>
                    </div>
                 </CardBody>
              </GlassCard>
           </motion.div>
         ))}

         <GlassCard className="rounded-3xl border-white/60 bg-gradient-to-br from-peach/5 via-white/50 to-pink/5 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center border shadow-xl group">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-lavender text-3xl mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
               <FiMaximize />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Build more interfaces 🚀</h3>
            <p className="text-sm text-text-secondary mb-6">Need select menus, custom link buttons, or advanced UI components? Pro members get full control.</p>
            <Button variant="ghost" className="w-full bg-lavender/10 border-lavender/20 text-lavender hover:bg-lavender/20 rounded-2xl h-11">View Pro Features</Button>
         </GlassCard>
      </div>
    </div>
  );
}
