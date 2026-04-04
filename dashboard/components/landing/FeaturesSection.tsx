'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Header text mask reveal
      const lines = headerRef.current?.querySelectorAll('.reveal-line') || [];
      gsap.fromTo(lines, 
        { y: '110%' },
        {
          y: '0%',
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true
          }
        }
      );

      // Wait a moment for DOM to paint cards, then animate
      setTimeout(() => {
         const cards = document.querySelectorAll('.feature-card');
         
         // Card entrance
         gsap.fromTo(cards, 
           { y: 60, opacity: 0 },
           {
             y: 0,
             opacity: 1,
             duration: 0.7,
             ease: 'expo.out',
             stagger: 0.1,
             scrollTrigger: {
               trigger: containerRef.current,
               start: "top 75%",
               once: true
             }
           }
         );

         // 3D Tilt interaction
         cards.forEach(card => {
            const el = card as HTMLElement;
            el.addEventListener('mousemove', (e) => {
              const rect = el.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              
              el.style.setProperty('--mouse-x', `${x}%`);
              el.style.setProperty('--mouse-y', `${y}%`);

              // Tilt physics
              const xPos = (e.clientX - rect.left) / rect.width - 0.5;
              const yPos = (e.clientY - rect.top) / rect.height - 0.5;
              
              gsap.to(el, {
                rotateY: xPos * 8, // max 8 deg
                rotateX: -yPos * 6, // max 6 deg
                translateY: -8,
                duration: 0.4,
                ease: "power2.out"
              });
            });

            el.addEventListener('mouseleave', () => {
              gsap.to(el, {
                rotateY: 0,
                rotateX: 0,
                translateY: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
              });
            });
         });
      }, 100);
    }
  }, []);

  return (
    <section id="features" className="py-32 px-4 md:px-[60px] relative z-10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="mb-24" ref={headerRef}>
          <div className="font-dm-mono text-[11px] tracking-[0.3em] text-landing-text-4 mb-8 flex items-center gap-4">
            <span>02</span>
            <span>— WHAT LOOKI DOES</span>
          </div>
          <h2 className="font-garamond text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-tight">
            <div className="overflow-hidden"><div className="reveal-line">every feature you</div></div>
            <div className="overflow-hidden"><div className="reveal-line">need, wrapped in</div></div>
            <div className="overflow-hidden"><div className="reveal-line italic text-sakura-300">something beautiful ✦</div></div>
          </h2>
        </div>

        {/* CSS Grid */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-8">
          
          {/* CARD 1 - Moderation (Col 1-7) */}
          <div className="feature-card xl:col-span-7 flex flex-col justify-between group">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl filter hue-rotate-30 opacity-90 drop-shadow-[0_0_10px_rgba(255,182,193,0.3)]">🛡️</span>
                  <span className="font-dm-mono text-[11px] font-bold tracking-[0.1em] text-landing-text-3 border border-landing-1 px-3 py-1 rounded-full bg-surface/50">MODERATION</span>
                </div>
             </div>
             
             <div className="mb-12 relative flex-1 min-h-[200px]">
                {/* Embed Mockup */}
                <div className="absolute top-4 -right-4 w-[400px] bg-[#2B2D31] rounded-[4px] border-l-4 border-sakura-300 p-4 shadow-xl opacity-90 rotate-[-2deg] group-hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-sakura-200"></div>
                    <span className="font-bold text-[14px] text-white">Looki ✦</span>
                    <span className="text-[11px] text-[#949BA4] bg-[#5865F2] px-1 rounded text-white font-bold tracking-wide">BOT</span>
                  </div>
                  <h3 className="text-white font-bold text-[16px] mb-1">User Banned</h3>
                  <div className="text-[14px] text-[#DBDEE1]">
                    <strong>User:</strong> @annoyinguser<br/>
                    <strong>Reason:</strong> disrupting the vibes <span className="inline-block w-1 h-3 bg-white animate-pulse ml-1"></span>
                  </div>
                </div>
             </div>

             <div>
               <h3 className="font-syne text-[clamp(24px,3vw,36px)] font-bold text-landing-text-1 mb-3">Iron fist, silk glove ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed max-w-[400px] mb-6">
                 Ban, kick, mute, warn — done in one command. Every action logged, every case tracked, every DM handled with grace.
               </p>
               <div className="flex flex-wrap gap-2">
                 {['ban~', 'kick~', 'mute~', 'warn~', 'purge~'].map(cmd => (
                   <span key={cmd} className="font-dm-mono text-[12px] bg-surface border border-sakura-300/30 text-sakura-300 px-3 py-1.5 rounded-[4px]">{cmd}</span>
                 ))}
               </div>
             </div>
          </div>

          {/* CARD 2 - Leveling (Col 8-12) */}
          <div className="feature-card xl:col-span-5 flex flex-col justify-between group overflow-hidden relative">
             <div className="absolute -bottom-10 -right-10 text-[180px] font-garamond font-light text-landing-2 opacity-10 pointer-events-none select-none">
               LVL 99
             </div>
             
             <div className="mb-6 flex items-center gap-3 relative z-10">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(255,182,193,0.3)]">📈</span>
                <span className="font-dm-mono text-[11px] font-bold tracking-[0.1em] text-landing-text-3 border border-landing-1 px-3 py-1 rounded-full bg-surface/50">XP & LEVELS</span>
             </div>

             <div className="mb-12 relative flex-1 min-h-[160px] flex items-center justify-center z-10">
                {/* Level Card Mock */}
                <div className="w-[85%] bg-[#1E1F22] rounded-[12px] p-4 border border-landing-1 shadow-2xl relative">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-full border-2 border-sakura-300 bg-landing-mist group-hover:rotate-[360deg] transition-transform duration-[3s]"></div>
                     <div>
                       <div className="text-white font-bold">@pookie</div>
                       <div className="text-sakura-300 text-[12px]">Rank #1 • Level <span className="group-hover:scale-150 inline-block transition-transform text-yellow-400">99</span></div>
                     </div>
                   </div>
                   <div className="h-2 w-full bg-[#2B2D31] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sakura-200 to-sakura-500 w-[85%] group-hover:w-full transition-all duration-1000 ease-out"></div>
                   </div>
                </div>
             </div>

             <div className="relative z-10">
               <h3 className="font-syne text-[clamp(24px,3vw,36px)] font-bold text-landing-text-1 mb-3">Earn your place ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 Custom rank cards. XP multipliers. Role rewards. The most beautiful leveling system on Discord.
               </p>
             </div>
          </div>

          {/* CARD 3 - Music (Col 1-4) */}
          <div className="feature-card xl:col-span-4 flex flex-col justify-between group">
             <div className="mb-6 text-4xl drop-shadow-[0_0_10px_rgba(255,182,193,0.3)]">🎵</div>
             <div className="flex-1 min-h-[120px] mb-8 relative">
               <div className="absolute inset-0 flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-2 bg-sakura-300 rounded-t-sm" style={{ height: `${10 + i * 8}px`, animation: `pulse-glow ${1 + i*0.2}s infinite alternate` }}></div>
                  ))}
               </div>
             </div>
             <div>
               <h3 className="font-syne text-[24px] font-bold text-landing-text-1 mb-3">drop the beat ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 YouTube, Spotify, SoundCloud. Queues, filters, lyrics. Music that slaps as hard as we do.
               </p>
             </div>
          </div>

          {/* CARD 4 - Giveaways (Col 5-8) */}
          <div className="feature-card xl:col-span-4 flex flex-col justify-between group overflow-hidden">
             <div className="mb-6 text-4xl group-hover:-translate-y-4 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,182,193,0.3)]">🎉</div>
             <div className="flex-1 min-h-[120px] mb-8 relative flex items-center justify-center">
                <div className="font-dm-mono text-[24px] text-landing-text-1">02:14:33</div>
                {/* CSS Confetti would go here */}
             </div>
             <div>
               <h3 className="font-syne text-[24px] font-bold text-landing-text-1 mb-3">make it rain ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 Giveaways with bonus entries, role requirements, and winners chosen by the universe (us).
               </p>
             </div>
          </div>

          {/* CARD 5 - AutoMod (Col 9-12) */}
          <div className="feature-card xl:col-span-4 flex flex-col justify-between group">
             <div className="mb-6 text-4xl drop-shadow-[0_0_10px_rgba(255,182,193,0.3)] z-10 relative">👁️</div>
             <div className="flex-1 min-h-[120px] mb-8 relative flex items-center justify-center">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-sakura-500 to-lavender flex items-center justify-center">
                  <div className="absolute w-24 h-24 border border-sakura-300 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute w-32 h-32 border border-lavender rounded-full border-b-transparent animate-spin [animation-direction:reverse]" style={{ animationDuration: '6s' }}></div>
                </div>
             </div>
             <div>
               <h3 className="font-syne text-[24px] font-bold text-landing-text-1 mb-3">always watching ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 Anti-spam, anti-raid, anti-links. Looki never sleeps, never misses, never lets the chaos win.
               </p>
             </div>
          </div>

          {/* CARD 6 - Welcome (Col 1-6) */}
          <div className="feature-card xl:col-span-6 flex flex-col justify-between group">
             <div className="mb-8">
               <h3 className="font-syne text-[clamp(24px,3vw,36px)] font-bold text-landing-text-1 mb-3">first impressions matter ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 Custom welcome cards, personalized DMs, automatic role assignment. Make every member feel like they were expected.
               </p>
             </div>
             <div className="relative h-[180px] bg-void rounded-[12px] border border-landing-1 overflow-hidden group-hover:border-sakura-300/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-r from-sakura-300/20 to-lavender/20"></div>
                <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white mb-2 shadow-[0_0_20px_rgba(255,255,255,0.8)] border-2 border-sakura-300"></div>
                    <div className="text-white font-bold font-syne text-[18px]">Welcome to the server!</div>
                    <div className="text-sakura-100 text-[12px]">Member #1,204</div>
                  </div>
                </div>
             </div>
          </div>

          {/* CARD 7 - Dashboard (Col 7-12) */}
          <div className="feature-card xl:col-span-6 flex flex-col justify-between group">
             <div className="mb-8">
               <h3 className="font-syne text-[clamp(24px,3vw,36px)] font-bold text-landing-text-1 mb-3">manage without typing ✦</h3>
               <p className="font-syne text-[16px] text-landing-text-2 leading-relaxed">
                 The most beautiful Discord bot dashboard ever built. Click, toggle, configure. Your server, controlled from anywhere.
               </p>
             </div>
             <div className="relative h-[180px] bg-void rounded-[12px] border border-landing-1 shadow-[inset_0_0_40px_rgba(255,182,193,0.1)] group-hover:scale-[1.02] transition-transform overflow-hidden">
                <div className="p-4 border-b border-landing-0 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-[30%] h-20 bg-surface rounded"></div>
                  <div className="w-[70%] h-20 bg-surface rounded"></div>
                  {/* Fake Cursor */}
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 text-white -translate-x-1/2 -translate-y-1/2 group-hover:translate-x-[40px] group-hover:translate-y-[-20px] transition-transform duration-700">
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M4 0l16 12-7 2 3 8-4 2-3-8-4 5z"/></svg>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
