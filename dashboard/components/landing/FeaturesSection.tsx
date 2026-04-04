'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ─── Shared fade-up variant ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { y: 56, opacity: 0 },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.75, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Feature card wrapper with 3D tilt ───────────────────────────────────────
function FeatureCard({
  children,
  className = '',
  custom = 0,
}: {
  children: React.ReactNode;
  className?: string;
  custom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    gsap.to(el, {
      rotateY: x * 9,
      rotateX: -y * 6,
      translateY: -6,
      duration: 0.35,
      ease: 'power2.out',
      transformPerspective: 900,
      transformStyle: 'preserve-3d',
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      translateY: 0,
      duration: 0.65,
      ease: 'elastic.out(1, 0.45)',
    });
  };

  return (
    <motion.div
      ref={ref}
      className={`feature-card relative flex flex-col bg-surface border border-landing-1 rounded-2xl p-7 overflow-hidden cursor-default
        before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300
        before:bg-[radial-gradient(300px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,182,193,0.06),transparent_70%)]
        hover:before:opacity-100 hover:border-sakura-300/25 transition-colors duration-300 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={custom}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
const Tag = ({ label }: { label: string }) => (
  <span className="font-dm-mono text-[10px] font-bold tracking-[0.14em] text-landing-text-3 border border-landing-1 px-3 py-1 rounded-full bg-surface/60 uppercase">
    {label}
  </span>
);

// ─── SVG icons (no emoji) ─────────────────────────────────────────────────────
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
  </svg>
);
const IconTrending = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconMusic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const IconGift = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" rx="1" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);
const IconEye = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconHeart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconSliders = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakura-300">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

// ─── Music bars ───────────────────────────────────────────────────────────────
const BAR_HEIGHTS = [24, 40, 56, 44, 32, 48, 28, 52, 36];
const MusicBars = () => (
  <div className="flex items-end gap-1 h-[64px]">
    {BAR_HEIGHTS.map((h, i) => (
      <motion.div
        key={i}
        className="w-2 rounded-t-sm bg-gradient-to-t from-sakura-500 to-sakura-200 flex-shrink-0"
        animate={{ scaleY: [1, 0.35 + Math.random() * 0.65, 1] }}
        transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        style={{ height: h, transformOrigin: 'bottom' }}
      />
    ))}
  </div>
);

// ─── Live countdown ───────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s <= 0 ? initialSeconds : s - 1)), 1000);
    return () => clearInterval(id);
  }, [initialSeconds]);
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return { h, m, s };
}

// ─── Spinning scanner (AutoMod) ───────────────────────────────────────────────
const Scanner = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <div className="absolute w-20 h-20 rounded-full border border-sakura-300/20" />
    <motion.div
      className="absolute w-20 h-20 rounded-full border border-sakura-300/60 border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute w-32 h-32 rounded-full border border-sakura-200/20 border-b-transparent"
      animate={{ rotate: -360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="w-3 h-3 rounded-full bg-sakura-300"
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </div>
);

// ─── Discord embed mockup ─────────────────────────────────────────────────────
const BanEmbed = () => (
  <div
    className="w-full max-w-[340px] bg-[#2B2D31] rounded-[4px] border-l-[3px] border-sakura-300 p-4 shadow-2xl"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sakura-200 to-sakura-500 flex-shrink-0" />
      <span className="font-bold text-[13px] text-white leading-none">Looki</span>
      <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold tracking-wide">BOT</span>
    </div>
    <p className="text-white font-bold text-[15px] mb-2">User Banned</p>
    <div className="text-[13px] text-[#DBDEE1] space-y-1">
      <div><span className="text-[#B5BAC1]">User</span> @annoyinguser</div>
      <div className="flex items-center gap-1">
        <span className="text-[#B5BAC1]">Reason</span>
        <span>disrupting the vibes</span>
        <motion.span
          className="inline-block w-[2px] h-[13px] bg-white ml-0.5"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      </div>
    </div>
  </div>
);

// ─── Level card mockup ────────────────────────────────────────────────────────
const LevelCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="w-[85%] bg-[#1E1F22] rounded-xl p-4 border border-landing-1 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full border-2 border-sakura-300 bg-gradient-to-br from-sakura-500/30 to-landing-mist flex-shrink-0" />
        <div>
          <div className="text-white font-bold text-[13px]">@pookie</div>
          <div className="text-sakura-300 text-[11px]">
            Rank #1 · Level <span className="text-yellow-400 font-bold">99</span>
          </div>
        </div>
        <div className="ml-auto font-dm-mono text-[11px] text-landing-text-3">12,840 XP</div>
      </div>
      <div className="h-1.5 w-full bg-[#2B2D31] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sakura-200 to-sakura-500"
          initial={{ width: '0%' }}
          animate={{ width: inView ? '84%' : '0%' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-dm-mono text-[10px] text-landing-text-4">84%</span>
        <span className="font-dm-mono text-[10px] text-landing-text-4">15,200 XP</span>
      </div>
    </div>
  );
};

// ─── Welcome card mockup ──────────────────────────────────────────────────────
const WelcomeCard = () => (
  <div className="relative h-[160px] rounded-xl border border-landing-1 overflow-hidden group-hover:border-sakura-300/30 transition-colors duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-sakura-500/15 via-landing-mist/10 to-[#1E1F22]" />
    <div className="absolute inset-0 flex items-center gap-5 px-6">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sakura-200 to-sakura-500 border-2 border-sakura-300/60 flex-shrink-0 shadow-[0_0_20px_rgba(255,182,193,0.3)]" />
      <div>
        <p className="text-[#DBDEE1] text-[12px] mb-0.5">A wild member appeared!</p>
        <p className="text-white font-bold font-syne text-[17px]">Welcome, pookie ♡</p>
        <p className="text-sakura-300 text-[12px] font-dm-mono mt-0.5">Member #1,204</p>
      </div>
    </div>
  </div>
);

// ─── Dashboard mockup ─────────────────────────────────────────────────────────
const DashboardMockup = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
    if (!cursorRef.current || !btnRef.current) return;
    tl.to(cursorRef.current, { x: 68, y: -22, duration: 1, ease: 'power2.inOut' })
      .to(cursorRef.current, { scale: 0.85, duration: 0.12 })
      .call(() => setClicked(true))
      .to(cursorRef.current, { scale: 1, duration: 0.12 })
      .to({}, { duration: 0.6 })
      .call(() => setClicked(false))
      .to(cursorRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.inOut' });
    return () => { tl.kill(); };
  }, []);

  return (
    <div className="relative h-[160px] rounded-xl border border-landing-1 overflow-hidden group-hover:border-sakura-300/25 transition-colors duration-300 bg-[#1A1B1E]">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-landing-0">
        <div className="w-2 h-2 rounded-full bg-red-400/70" />
        <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
        <div className="w-2 h-2 rounded-full bg-green-400/70" />
        <span className="ml-2 font-dm-mono text-[9px] text-landing-text-4 tracking-widest">looki.dashboard</span>
      </div>
      <div className="p-3 flex gap-3">
        <div className="w-[28%] space-y-1.5">
          {['Overview', 'Moderation', 'Levels', 'Music'].map((item, i) => (
            <div key={i} className={`h-5 rounded px-2 flex items-center ${i === 0 ? 'bg-sakura-300/20' : 'bg-surface/50'}`}>
              <div className={`h-1.5 rounded-full ${i === 0 ? 'w-12 bg-sakura-300' : 'w-8 bg-landing-2/40'}`} />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            {['Servers', 'Users', 'Commands'].map((_, i) => (
              <div key={i} className="flex-1 h-10 rounded bg-surface/60 border border-landing-1/50 p-1.5">
                <div className="h-1 w-8 bg-landing-2/40 rounded mb-1" />
                <div className="h-1.5 w-5 bg-sakura-300/50 rounded" />
              </div>
            ))}
          </div>
          <div className="relative h-12 rounded bg-surface/40 border border-landing-1/50 flex items-center px-2 gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full bg-landing-2/30 rounded" />
              <div className="h-1 w-3/4 bg-landing-2/30 rounded" />
            </div>
            <motion.div
              ref={btnRef}
              className="h-6 px-2 rounded flex items-center justify-center"
              animate={{ backgroundColor: clicked ? 'rgba(255,182,193,0.35)' : 'rgba(255,182,193,0.15)', borderColor: clicked ? 'rgba(255,182,193,0.5)' : 'rgba(255,182,193,0.25)' }}
              style={{ border: '1px solid' }}
            >
              <div className="h-1 w-8 bg-sakura-300 rounded" />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Animated cursor */}
      <div
        ref={cursorRef}
        className="absolute bottom-5 left-6 w-4 h-4 pointer-events-none z-20"
        style={{ willChange: 'transform' }}
      >
        <svg viewBox="0 0 16 18" fill="white" width="14" height="14" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}>
          <path d="M0 0l6 16 2-5 5 2z" />
        </svg>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { h, m, s } = useCountdown(8_953);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    const lines = headerRef.current?.querySelectorAll('.reveal-line') ?? [];
    if (!lines.length) return;
    gsap.fromTo(
      lines,
      { y: '112%' },
      {
        y: '0%',
        duration: 1,
        ease: 'expo.out',
        stagger: 0.13,
        scrollTrigger: { trigger: headerRef.current, start: 'top 82%', once: true },
      }
    );
  }, []);

  return (
    <section id="features" className="py-32 px-4 md:px-[60px] relative z-10">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-24" ref={headerRef}>
          <motion.div
            className="font-dm-mono text-[11px] tracking-[0.32em] text-landing-text-4 mb-8 flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span>02</span>
            <span className="w-8 h-px bg-landing-2/50 inline-block" />
            <span>WHAT LOOKI DOES</span>
          </motion.div>
          <h2 className="font-garamond text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-tight text-landing-text-1">
            <div className="overflow-hidden"><div className="reveal-line">every feature you</div></div>
            <div className="overflow-hidden"><div className="reveal-line">need, wrapped in</div></div>
            <div className="overflow-hidden"><div className="reveal-line italic text-sakura-300">something beautiful ✦</div></div>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">

          {/* ── CARD 1: Moderation (7 cols) ── */}
          <FeatureCard className="xl:col-span-7 justify-between group" custom={0}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <IconShield />
                <Tag label="Moderation" />
              </div>
            </div>
            {/* Discord embed — contained properly */}
            <div className="relative flex-1 min-h-[180px] mb-8 flex items-center">
              <motion.div
                className="relative z-10 ml-auto"
                initial={{ rotate: -2, opacity: 0.85 }}
                whileHover={{ rotate: 0, opacity: 1, scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <BanEmbed />
              </motion.div>
            </div>
            <div>
              <h3 className="font-syne text-[clamp(22px,2.8vw,34px)] font-bold text-landing-text-1 mb-3">
                Iron fist, silk glove ✦
              </h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed max-w-[400px] mb-6">
                Ban, kick, mute, warn — one command. Every action logged, every case tracked, every DM handled with grace.
              </p>
              <div className="flex flex-wrap gap-2">
                {['/ban', '/kick', '/mute', '/warn', '/purge'].map(cmd => (
                  <span key={cmd} className="font-dm-mono text-[11px] bg-[#1E1F22] border border-landing-1 text-sakura-300 px-3 py-1.5 rounded-md">
                    {cmd}
                  </span>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* ── CARD 2: Leveling (5 cols) ── */}
          <FeatureCard className="xl:col-span-5 justify-between group overflow-hidden" custom={1}>
            <div className="absolute -bottom-8 -right-6 font-garamond text-[clamp(80px,14vw,140px)] leading-none text-landing-text-1/[0.04] pointer-events-none select-none">
              99
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <IconTrending />
              <Tag label="XP & Levels" />
            </div>
            <div className="flex-1 min-h-[140px] flex items-center justify-center relative z-10 mb-8">
              <LevelCard />
            </div>
            <div className="relative z-10">
              <h3 className="font-syne text-[clamp(22px,2.8vw,34px)] font-bold text-landing-text-1 mb-3">
                Earn your place ✦
              </h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed">
                Custom rank cards. XP multipliers. Role rewards. The most beautiful leveling system on Discord.
              </p>
            </div>
          </FeatureCard>

          {/* ── CARD 3: Music (4 cols) ── */}
          <FeatureCard className="xl:col-span-4 justify-between group" custom={2}>
            <div className="flex items-center gap-3 mb-6">
              <IconMusic />
              <Tag label="Music" />
            </div>
            <div className="flex-1 min-h-[100px] flex items-end mb-8 px-2">
              <MusicBars />
            </div>
            <div>
              <h3 className="font-syne text-[22px] font-bold text-landing-text-1 mb-3">drop the beat ✦</h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed">
                YouTube, Spotify, SoundCloud. Queues, filters, lyrics. Music that slaps.
              </p>
            </div>
          </FeatureCard>

          {/* ── CARD 4: Giveaways (4 cols) ── */}
          <FeatureCard className="xl:col-span-4 justify-between group" custom={3}>
            <div className="flex items-center gap-3 mb-6">
              <IconGift />
              <Tag label="Giveaways" />
            </div>
            <div className="flex-1 min-h-[100px] flex flex-col items-center justify-center mb-8 gap-2">
              <p className="font-dm-mono text-[10px] tracking-[0.3em] text-landing-text-4 uppercase mb-2">ends in</p>
              <div className="flex items-end gap-1">
                {[{ v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEC' }].map(({ v, l }, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="font-garamond text-[clamp(32px,5vw,52px)] leading-none text-landing-text-1 tabular-nums">
                      {v}
                    </span>
                    <span className="font-dm-mono text-[9px] tracking-widest text-landing-text-4">{l}</span>
                    {i < 2 && <span className="absolute mt-[-4px] font-garamond text-[28px] text-landing-text-3 ml-[72px]">:</span>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-syne text-[22px] font-bold text-landing-text-1 mb-3">make it rain ✦</h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed">
                Bonus entries, role requirements, winners chosen by the universe (us).
              </p>
            </div>
          </FeatureCard>

          {/* ── CARD 5: AutoMod (4 cols) ── */}
          <FeatureCard className="xl:col-span-4 justify-between group" custom={4}>
            <div className="flex items-center gap-3 mb-6">
              <IconEye />
              <Tag label="AutoMod" />
            </div>
            <div className="flex-1 min-h-[100px] flex items-center justify-center mb-8">
              <Scanner />
            </div>
            <div>
              <h3 className="font-syne text-[22px] font-bold text-landing-text-1 mb-3">always watching ✦</h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed">
                Anti-spam, anti-raid, anti-links. Looki never sleeps, never misses, never lets chaos win.
              </p>
            </div>
          </FeatureCard>

          {/* ── CARD 6: Welcome (6 cols) ── */}
          <FeatureCard className="xl:col-span-6 justify-between group" custom={5}>
            <div className="flex items-center gap-3 mb-6">
              <IconHeart />
              <Tag label="Welcome" />
            </div>
            <div className="mb-8">
              <h3 className="font-syne text-[clamp(22px,2.8vw,34px)] font-bold text-landing-text-1 mb-3">
                first impressions matter ✦
              </h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed mb-6">
                Custom welcome cards, personalized DMs, automatic role assignment. Make every member feel expected.
              </p>
            </div>
            <WelcomeCard />
          </FeatureCard>

          {/* ── CARD 7: Dashboard (6 cols) ── */}
          <FeatureCard className="xl:col-span-6 justify-between group" custom={6}>
            <div className="flex items-center gap-3 mb-6">
              <IconSliders />
              <Tag label="Dashboard" />
            </div>
            <div className="mb-8">
              <h3 className="font-syne text-[clamp(22px,2.8vw,34px)] font-bold text-landing-text-1 mb-3">
                manage without typing ✦
              </h3>
              <p className="font-syne text-[15px] text-landing-text-2 leading-relaxed">
                The most beautiful Discord bot dashboard ever built. Click, toggle, configure. Your server, from anywhere.
              </p>
            </div>
            <DashboardMockup />
          </FeatureCard>

        </div>
      </div>
    </section>
  );
}