'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Play } from 'lucide-react';

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Parallax text on scroll
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -150,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 30%",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }
  }, []);

  return (
    <section className="relative w-full h-[100svh] flex flex-col items-center justify-center overflow-hidden z-10 pt-16">

      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-30">
        <span className="font-dm-mono text-[11px] tracking-[0.5em] text-sakura-300">L O O K I</span>
      </div>
      <div className="absolute top-10 right-10 opacity-30">
        <span className="font-italiana text-[13px] text-sakura-300">✦ 2026 ✦</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.025]">
        <h1 className="font-garamond text-[clamp(100px,30vw,500px)] tracking-[-0.05em] text-sakura-200">looki</h1>
      </div>
      <div className="absolute bottom-20 left-10 opacity-60 origin-bottom-left -rotate-90">
        <span className="font-dm-mono text-[10px] tracking-[0.3em] text-landing-text-3">DISCORD BOT · POOKIE CODED ·</span>
      </div>

      <div className="relative z-10 max-w-[1100px] w-full px-[60px] flex flex-col items-center text-center">

        {/* Status Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 px-4 py-1.5 rounded-full border border-mint/20 bg-mint/5 flex items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-mint"
          />
          <span className="font-dm-mono text-[11px] tracking-[0.15em] text-mint">
            LIVE · serving 50,000+ servers today
          </span>
        </motion.div>

        {/* Headline */}
        <h1 ref={headlineRef} className="font-garamond text-[clamp(64px,9.5vw,136px)] leading-[0.92] tracking-tighter text-landing-text-1 drop-shadow-2xl">
          <motion.div initial={{ y: 100, opacity: 0, rotateX: -40 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} style={{ transformPerspective: 800 }}>the most</motion.div>
          <motion.div initial={{ y: 100, opacity: 0, rotateX: -40 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="italic text-gradient-sakura" style={{ transformPerspective: 800 }}>beautiful bot</motion.div>
          <motion.div initial={{ y: 100, opacity: 0, rotateX: -40 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ transformPerspective: 800 }}>you've ever met <span className="text-sakura-300">✦</span></motion.div>
        </h1>

        {/* Subhead */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="font-syne text-[18px] font-light text-landing-text-2 max-w-[520px] leading-[1.7] mt-8 mb-10"
        >
          Looki runs your server so you can focus on the vibes.
          Moderation, levels, music, and more — wrapped in a{' '}
          <span className="italic text-landing-text-accent">soft pink bow</span>{' '}
          and delivered with a ♡
        </motion.p>

        {/* CTA Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 mb-16"
        >
          <button className="relative group px-10 py-[18px] rounded-full font-syne text-[15px] font-bold tracking-[0.08em] text-[#060508] transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg, #FFB6C1 0%, #FF8FA3 40%, #C0435A 100%)', boxShadow: '0 4px 30px rgba(255,182,193,0.45)' }}
          >
            <div className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none opacity-50 shadow-[0_0_0_0_rgba(255,182,193,0.3)]"></div>
            <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">
              Add to Discord — Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button className="group flex items-center gap-3 px-9 py-[18px] rounded-full border border-landing-2 text-landing-text-2 font-syne text-[15px] font-medium backdrop-blur-md transition-all hover:border-landing-3 hover:text-landing-text-1 hover:backdrop-blur-xl">
            <div className="w-8 h-8 rounded-full bg-sakura-500/20 flex items-center justify-center group-hover:bg-sakura-500/40 transition-colors group-hover:scale-110">
              <Play size={12} className="text-white fill-white ml-0.5" />
            </div>
            Watch it in action
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-8"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-sakura-300 overflow-hidden bg-surface">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=ffd6df`} alt="avatar" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="font-dm-mono text-[12px] text-mint">+50,000 servers trust Looki</div>
            <div className="flex items-center gap-2 text-landing-text-2 font-italiana italic text-[16px]">
              <span className="text-yellow-400">★★★★★</span> "best bot i've used" — @username
            </div>
          </div>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="relative w-11 h-11 border border-landing-2 rounded-full flex items-center justify-center">
          <div className="absolute inset-[-1px] rounded-full border border-transparent border-t-sakura-300 animate-spin" style={{ animationDuration: '3s' }}></div>
          <ArrowDown size={14} className="text-landing-text-3 animate-bounce" />
        </div>
        <div className="font-dm-mono text-[10px] tracking-[0.25em] text-landing-text-4">SCROLL TO EXPLORE</div>
      </motion.div>

    </section>
  );
}

// ArrowRight component fallback for Lucide
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
