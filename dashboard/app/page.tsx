'use client';

import { useState } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import Marquee from '@/components/landing/Marquee';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CommandsTerminal from '@/components/landing/CommandsTerminal';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingSection from '@/components/landing/PricingSection';
import FinalCTA from '@/components/landing/FinalCTA';
import CustomCursor from '@/components/landing/CustomCursor';
import ParticleField from '@/components/landing/ParticleField';
import SmoothScroll from '@/components/landing/SmoothScroll';
import Loader from '@/components/landing/Loader';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="landing-body font-syne overflow-x-hidden selection:bg-sakura-400 selection:text-white">
      
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      
      <SmoothScroll>
        <CustomCursor />
        <ParticleField />
        
        {/* Global Atmosphere Layers */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="blob-landing blob-landing-1" />
          <div className="blob-landing blob-landing-2" />
          <div className="blob-landing blob-landing-3" />
          <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,5,8,0.4) 100%)' }} />
          {/* Noise Texture would ideally be a real SVG but we'll use CSS noise simulation or wait for real asset */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>

        <LandingNavbar />
        
        <main className="relative z-10">
          <HeroSection />
          <Marquee />
          <FeaturesSection />
          <CommandsTerminal />
          <TestimonialsSection />
          <HowItWorks />
          <PricingSection />
          <FinalCTA />
        </main>
      </SmoothScroll>
    </div>
  );
}