'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
          onComplete();
        }
      });

      // 1. Draw Star
      tl.fromTo(starRef.current, 
        { rotate: -90, scale: 0, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      )
      // 2. Text fade up
      .fromTo(textRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      )
      // 3. Line progress
      .fromTo(lineRef.current,
        { width: "0%" },
        { width: "100%", duration: 0.6, ease: "power2.inOut" },
        "-=0.1"
      )
      // 4. Fade everything out
      .to(containerRef.current, 
        { opacity: 0, duration: 0.4, ease: "power2.inOut", delay: 0.2 }
      );
    }
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-landing-void"
    >
      <div className="flex flex-col items-center">
        <span ref={starRef} className="text-sakura-300 text-4xl mb-4">✦</span>
        <div ref={textRef} className="font-garamond italic text-3xl text-landing-text-1 mb-6">
          looki
        </div>
        <div className="w-32 h-[2px] bg-landing-surface rounded-full overflow-hidden">
          <div ref={lineRef} className="h-full bg-sakura-400 w-0"></div>
        </div>
      </div>
    </div>
  );
}
