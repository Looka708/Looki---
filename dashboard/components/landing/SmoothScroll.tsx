'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis
    const lenis = new Lenis({
      lerp: 0.18, // Much snappier (increased from 0.12 to address 'delay' feeling)
      wheelMultiplier: 1.1, // Slightly boost wheel for better response
      touchMultiplier: 1.5,
      smoothWheel: true,
    });

    // Update ScrollTrigger on every scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP with Lenis
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Disable lag smoothing to prevent syncing issues
    gsap.ticker.lagSmoothing(0);

    // Handle anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash);
        if (element) {
          lenis.scrollTo(element as HTMLElement, {
            offset: -80,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Cleanup
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
      document.removeEventListener('click', handleAnchorClick);
      // Optional: don't kill all if others use it, but here it's likely safe
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return <>{children}</>;
}