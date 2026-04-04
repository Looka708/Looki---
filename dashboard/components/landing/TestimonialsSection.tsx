'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    username: '@pookie_lover',
    server: 'Cute Clan',
    members: '12,400',
    quote: "honestly the most beautiful bot i've ever added. the embeds look incredible and the commands work perfectly. looki is permanently in my server. ✦",
    featured: true,
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=pookie&backgroundColor=ffd6df'
  },
  {
    id: 2,
    username: '@mod_master',
    server: 'Tech Central',
    members: '45,000',
    quote: "looki literally saved my server from being raided. she banned 47 alts in like 2 seconds bestie 🌸",
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=mod&backgroundColor=ffd6df'
  },
  {
    id: 3,
    username: '@vibe_check',
    server: 'Vibe Lounge',
    members: '2,100',
    quote: "the music quality is actually insane. and the level cards? forget about it. 10/10.",
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=vibe&backgroundColor=ffd6df'
  },
  {
    id: 4,
    username: '@server_owner_99',
    server: 'Gaming Hub',
    members: '8,500',
    quote: "best bot i've used in years. setup was so easy and the vibes are just perfect.",
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=gaming&backgroundColor=ffd6df'
  }
];

export default function TestimonialsSection() {
  return (
    <section id="showcase" className="py-32 px-4 md:px-[60px] relative z-10 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20 text-center">
          <h2 className="font-garamond text-[clamp(48px,7vw,90px)] font-light leading-[0.95] tracking-tight">
             servers are talking <span className="text-sakura-300">✦</span>
          </h2>
          <p className="font-italiana italic text-landing-text-2 text-xl mt-4 opacity-60">
            50,000+ communities already running on Looki
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <TestimonialCard testimonial={testimonials[1]} />
          </div>

          {/* Column 2 (Featured) */}
          <div className="lg:col-span-2">
            <TestimonialCard testimonial={testimonials[0]} featured />
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-6">
            <TestimonialCard testimonial={testimonials[2]} />
            <TestimonialCard testimonial={testimonials[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, featured }: { testimonial: any, featured?: boolean }) {
  const [usedFor, setUsedFor] = useState<number | null>(null);

  useEffect(() => {
    setUsedFor(Math.floor(Math.random() * 10) + 1);
  }, []);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`feature-card !p-6 flex flex-col justify-between ${
        featured ? 'border-sakura-300/30 shadow-[0_0_60px_rgba(255,182,193,0.1)] bg-landing-surface/50' : ''
      }`}
    >
      {featured && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-sakura-300 to-sakura-500 text-[#060508] font-dm-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
          FEATURED REVIEW
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full border border-sakura-300/30 overflow-hidden">
           <img src={testimonial.avatar} alt={testimonial.username} />
        </div>
        <div>
          <div className="text-landing-text-1 font-bold text-sm">{testimonial.username}</div>
          <div className="text-landing-text-3 text-[11px] font-dm-mono uppercase tracking-wider">
            {testimonial.server} • {testimonial.members}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
        <p className={`font-garamond italic ${featured ? 'text-2xl leading-relaxed' : 'text-lg leading-relaxed'} text-landing-text-2`}>
          "{testimonial.quote}"
        </p>
      </div>

      <div className="text-[11px] text-landing-text-4 font-dm-mono">
        Used for: {usedFor ?? '...'} months
      </div>
    </motion.div>
  );
}
