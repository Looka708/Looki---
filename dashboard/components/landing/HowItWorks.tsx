'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: 'Invite Looki',
    desc: 'Add Looki to your server with just one click and authorize the vibes.',
    icon: '🌸',
  },
  {
    id: 2,
    title: 'Configure Everything',
    desc: 'Open the stunning dashboard and set up systems exactly how you like.',
    icon: '⚙️',
  },
  {
    id: 3,
    title: 'Enjoy the Vibes',
    desc: 'Sit back and relax while Looki handles moderation and leveling with grace.',
    icon: '✦',
  }
];

export default function HowItWorks() {
  return (
    <section id="docs" className="py-32 px-4 md:px-[60px] relative z-10 overflow-hidden bg-landing-abyss/50">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-20">
          <div className="font-dm-mono text-[11px] tracking-[0.3em] text-landing-text-4 mb-8">
            03 — HOW IT WORKS
          </div>
          <h2 className="font-garamond text-[clamp(48px,7vw,80px)] font-light leading-[0.95] tracking-tight">
            up and running in<br/>
            <span className="italic text-sakura-300">30 seconds ✦</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-[1px] border-t border-dashed border-landing-1 -z-10" />
          
          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center">
              <div className="text-[clamp(120px,15vw,180px)] font-garamond font-thin leading-none tracking-tighter opacity-10 select-none pointer-events-none mb-[-40px]">
                {step.id}
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-16 h-16 rounded-full bg-landing-surface border border-landing-1 flex items-center justify-center text-2xl shadow-xl mb-6 backdrop-blur-md"
              >
                {step.icon}
              </motion.div>
              
              <h3 className="font-syne text-xl font-bold text-landing-text-1 mb-4">{step.title}</h3>
              <p className="font-syne text-sm text-landing-text-2 leading-relaxed max-w-[250px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
