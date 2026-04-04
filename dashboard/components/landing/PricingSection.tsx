'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const features = [
  "All moderation commands", "Full leveling system",
  "Music playback", "Reaction & button roles",
  "Welcome system", "Giveaway manager",
  "AutoMod protection", "Analytics dashboard",
  "Fun commands", "24/7 uptime",
  "Priority support", "Unlimited servers"
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-4 md:px-[60px] relative z-10 overflow-hidden">
      <div className="max-w-[1000px] mx-auto text-center">
        <div className="mb-20">
           <h2 className="font-garamond text-[clamp(48px,7vw,80px)] font-light leading-[0.95] tracking-tight mb-8">
             completely free. forever.<br/>
             <span className="italic text-sakura-300">no catch. ✦</span>
           </h2>
           
           <div className="relative inline-block mt-8">
              <span className="font-garamond text-[200px] md:text-[300px] font-thin leading-none text-gradient-sakura opacity-40">
                $0
              </span>
              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-full">
                <p className="font-dm-mono text-sm tracking-widest text-landing-text-3 uppercase">
                  per month. per server. per everything.
                </p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-[700px] mx-auto mb-20">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 py-2 border-b border-landing-0 text-left">
              <Check size={14} className="text-mint shrink-0" />
              <span className="font-syne text-[15px] text-sakura-200">{feature}</span>
            </div>
          ))}
        </div>

        {/* Hint Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card max-w-[400px] mx-auto p-8 border-lavender/20 shadow-[0_0_40px_rgba(200,162,200,0.1)]"
          style={{ background: 'rgba(20, 15, 30, 0.4)' }}
        >
          <div className="text-sakura-300 font-syne text-xs tracking-widest uppercase mb-4">✦ Looki Premium — coming soon</div>
          <p className="text-landing-text-3 text-sm mb-6">
            Early supporters get lifetime access. No price announced yet.
          </p>
          <button className="text-sakura-200 font-syne text-sm font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all cursor-none">
            Join the waitlist <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
