'use client';

import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { FiSettings, FiGlobe, FiSmile, FiLock, FiEdit2, FiRepeat } from 'react-icons/fi';
import { useParams } from 'react-navigation'; // Wait, next/navigation

export default function GeneralSettingsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-6 rounded-3xl backdrop-blur-md border border-white/60 mb-8 gap-4 shadow-sm">
        <Breadcrumb items={[
          { label: 'Settings', href: `/dashboard/${guildId}/settings` },
          { label: 'General', href: `/dashboard/${guildId}/settings/general` }
        ]} />
        <div className="flex gap-3">
           <Button variant="ghost" size="sm" className="bg-white/40 border-white/60 text-text-primary px-6 h-11">Discard Changes</Button>
           <Button variant="primary" className="shadow-glow-pink px-8 h-11">Sync Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-pink/30 transition-all duration-300">
          <div className="p-8 border-b border-white/40 bg-white/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink text-2xl shadow-sm">
                  <FiGlobe />
               </div>
               <div>
                  <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Prefix & Language</h2>
                  <p className="text-text-secondary text-sm">How you interact with Looki.</p>
               </div>
            </div>
          </div>
          <CardBody className="p-8 space-y-6">
             <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Command Prefix</label>
                <div className="flex gap-2">
                   <div className="flex-1 p-4 rounded-2xl bg-white/40 border border-white/60 text-text-primary font-mono text-xl text-center">!</div>
                   <button className="p-4 rounded-2xl bg-pink/10 text-pink hover:bg-pink/20 transition-all border border-pink/20"><FiEdit2 /></button>
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Bot Language</label>
                <select className="w-full p-4 rounded-2xl bg-white/40 border border-white/60 text-text-primary focus:outline-none focus:ring-2 focus:ring-pink/20 transition-all appearance-none">
                   <option>English (US) 🇺🇸</option>
                   <option>Portuguese (BR) 🇧🇷</option>
                   <option>Japanese (JP) 🇯🇵</option>
                </select>
             </div>
          </CardBody>
        </GlassCard>

        <GlassCard className="rounded-3xl border-white/60 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden hover:border-lavender/30 transition-all duration-300">
          <div className="p-8 border-b border-white/40 bg-white/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-lavender/10 rounded-2xl flex items-center justify-center text-lavender text-2xl shadow-sm">
                  <FiSmile />
               </div>
               <div>
                  <h2 className="text-xl font-display font-bold text-text-primary tracking-tight">Bot Personality</h2>
                  <p className="text-text-secondary text-sm">Fine-tune Looki's behavior.</p>
               </div>
            </div>
          </div>
          <CardBody className="p-8 space-y-6">
             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60">
                <div>
                   <span className="block text-sm font-bold text-text-primary">Response Emojis</span>
                   <span className="text-[10px] text-text-tertiary">Adds 🌸/✨ to bot replies.</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-mint relative cursor-pointer">
                   <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
             </div>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60">
                <div>
                   <span className="block text-sm font-bold text-text-primary">Mention Response</span>
                   <span className="text-[10px] text-text-tertiary">Replies when tagged in chat.</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-border-subtle relative cursor-pointer">
                   <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
             </div>
          </CardBody>
        </GlassCard>

        <GlassCard className="lg:col-span-2 rounded-3xl border-white/60 bg-gradient-to-br from-peach/5 via-white/50 to-pink/5 backdrop-blur-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-white shadow-xl">
           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-peach text-4xl shadow-glow-peach animate-pulse-glow">
              <FiRepeat />
           </div>
           <div className="flex-grow text-center md:text-left space-y-2">
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Looking to migrate? 📦</h3>
              <p className="text-text-secondary text-sm">Import settings from Mee6, Dyno, or Carl-bot instantly. Our intelligent parser will map your existing moderation and leveling systems to Looki.</p>
           </div>
           <Button variant="primary" className="shadow-smooth bg-text-primary text-white hover:bg-black rounded-2xl h-11 px-8">Start Importer</Button>
        </GlassCard>
      </div>
    </div>
  );
}
