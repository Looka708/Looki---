'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      if (!isScrolled) setIsScrolled(true);
    } else {
      if (isScrolled) setIsScrolled(false);
    }
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // expo.out
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-400`}
      style={{
        padding: isScrolled ? '18px 60px' : '28px 60px',
        backgroundColor: isScrolled ? 'rgba(10, 9, 14, 0.75)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border-0)' : '1px solid transparent',
        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <motion.span 
            className="text-sakura-300 text-xl inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
          >
            ✦
          </motion.span>
          <span className="font-garamond italic text-[22px] text-landing-text-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sakura-200 group-hover:via-lavender group-hover:to-sakura-200" style={{ backgroundSize: '200% auto', transition: 'all 0.3s' }}>
            looki
          </span>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Commands', 'Showcase', 'Pricing', 'Docs'].map((link, i) => (
            <div key={link} className="flex items-center gap-6">
              <Link href={`#${link.toLowerCase()}`} className="relative group font-syne text-[13px] font-medium tracking-[0.08em] text-landing-text-3 hover:text-landing-text-1 transition-colors">
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sakura-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {i < 4 && <span className="text-landing-text-4">·</span>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <Link href="/auth/login">
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full font-syne text-[12px] font-bold tracking-[0.1em] text-[#060508] !cursor-none"
              style={{
                background: 'linear-gradient(135deg, #FFB6C1, #FF8FA3)',
                padding: '10px 22px',
                boxShadow: '0 0 20px rgba(255,182,193,0.35)'
              }}
            >
              Add to Discord 
              <ArrowRight size={14} className="hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>

      </div>
    </motion.nav>
  );
}
