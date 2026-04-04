'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Globe, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 px-4 md:px-[60px] overflow-hidden">
      
      {/* Background vortex effect simulated with a blur blob */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-sakura-400/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto text-center">
        {/* Animated Avatar */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full border-[1px] border-sakura-300 shadow-[0_0_40px_rgba(255,182,193,0.2)] flex items-center justify-center bg-landing-depth mx-auto mb-10 overflow-hidden"
        >
           <img src="https://api.dicebear.com/7.x/notionists/svg?seed=looki&backgroundColor=ffd6df" alt="Looki" className="w-24 h-24" />
        </motion.div>

        <h2 className="font-garamond text-[clamp(56px,8vw,110px)] font-light leading-[0.9] tracking-tighter mb-8">
          ready to make your<br/>
          <span className="italic text-sakura-300">server beautiful? ✦</span>
        </h2>

        <p className="font-syne text-lg md:text-xl text-landing-text-2 font-light max-w-[600px] mx-auto mb-12">
          join 50,000+ servers already running on Looki. setup takes 30 seconds. results are immediate.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/auth/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-[22px] rounded-full font-syne text-[17px] font-bold tracking-[0.08em] text-[#060508] shadow-[0_4px_30px_rgba(255,182,193,0.45)] !cursor-none"
              style={{ background: 'linear-gradient(135deg, #FFB6C1 0%, #FF8FA3 40%, #C0435A 100%)' }}
            >
              Add Looki to Discord — It's Free
            </motion.button>
          </Link>
          
          <button className="px-12 py-[22px] rounded-full border border-landing-2 text-landing-text-2 font-syne text-[17px] font-medium hover:border-sakura-300 hover:text-landing-text-1 transition-all backdrop-blur-md !cursor-none">
            Join our Discord
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full mt-32 border-t border-landing-0 pt-20 pb-12">
         <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
               {/* Brand */}
               <div className="col-span-2">
                  <div className="font-garamond text-2xl text-landing-text-1 mb-4 flex items-center gap-2">
                    <span className="text-sakura-300">✦</span> looki
                  </div>
                  <p className="font-italiana italic text-landing-text-3 text-lg leading-snug">
                    the most beautiful<br/>Discord bot ever.
                  </p>
                  <div className="mt-8 flex items-center gap-4 text-landing-text-4">
                     <Globe size={20} className="hover:text-sakura-300 cursor-none" />
                     <Share2 size={20} className="hover:text-sakura-300 cursor-none" />
                     <MessageCircle size={20} className="hover:text-sakura-300 cursor-none" />
                  </div>
               </div>

               {/* Links */}
               <div>
                  <h4 className="font-dm-mono text-[10px] tracking-widest text-landing-text-4 uppercase mb-6">Product</h4>
                  <ul className="flex flex-col gap-3 font-syne text-sm text-landing-text-3 font-medium">
                    <li className="hover:text-sakura-300 cursor-none">Features</li>
                    <li className="hover:text-sakura-300 cursor-none">Commands</li>
                    <li className="hover:text-sakura-300 cursor-none">Pricing</li>
                    <li className="hover:text-sakura-300 cursor-none">Roadmap</li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-dm-mono text-[10px] tracking-widest text-landing-text-4 uppercase mb-6">Resources</h4>
                  <ul className="flex flex-col gap-3 font-syne text-sm text-landing-text-3 font-medium">
                    <li className="hover:text-sakura-300 cursor-none">Documentation</li>
                    <li className="hover:text-sakura-300 cursor-none flex items-center gap-2">Status Page <span className="w-1.5 h-1.5 bg-mint rounded-full"></span></li>
                    <li className="hover:text-sakura-300 cursor-none">Changelog</li>
                    <li className="hover:text-sakura-300 cursor-none">Discord Server</li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-dm-mono text-[10px] tracking-widest text-landing-text-4 uppercase mb-6">Legal</h4>
                  <ul className="flex flex-col gap-3 font-syne text-sm text-landing-text-3 font-medium">
                    <li className="hover:text-sakura-300 cursor-none">Privacy Policy</li>
                    <li className="hover:text-sakura-300 cursor-none">Terms of Service</li>
                    <li className="hover:text-sakura-300 cursor-none">Cookie Policy</li>
                  </ul>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-landing-0 pt-8 mt-8">
               <div className="text-[11px] text-landing-text-4 font-dm-mono">
                 © 2026 Looki Bot. All rights reserved. • Not affiliated with Discord Inc.
               </div>
               <div className="text-[11px] text-landing-text-4 font-dm-mono flex items-center gap-1">
                 Made with <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-sakura-500">♡</motion.span> by looki team in Lahore
               </div>
            </div>
         </div>
      </footer>
    </section>
  );
}
