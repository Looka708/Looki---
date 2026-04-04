'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'text'>('default');
  
  // Track petals array, each has an id, x, y, rotation
  const [petals, setPetals] = useState<{id: number, x: number, y: number, rotation: number}[]>([]);
  const petalIdRef = useRef(0);
  const lastSpawnCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Quick GSAP setters for dot and ring
    const xSetDot = gsap.quickSetter(dot, "x", "px");
    const ySetDot = gsap.quickSetter(dot, "y", "px");
    const xSetRing = gsap.quickSetter(ring, "x", "px");
    const ySetRing = gsap.quickSetter(ring, "y", "px");

    // Smooth position for ring
    const ringPos = { x: mouseX, y: mouseY };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update dot immediately
      xSetDot(mouseX);
      ySetDot(mouseY);
      
      // Calculate distance from last spawn
      const dx = mouseX - lastSpawnCoords.current.x;
      const dy = mouseY - lastSpawnCoords.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Spawn petal every 30px
      if (distance > 30) {
        lastSpawnCoords.current = { x: mouseX, y: mouseY };
        spawnPetal(mouseX, mouseY);
      }

      // Check hovering state based on elements
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        setCursorState('hover');
      } else if (target.closest('p') || target.closest('h1') || target.closest('h2') || target.closest('h3') || target.closest('span')) {
        setCursorState('text');
      } else {
        setCursorState('default');
      }
    };

    // Use GSAP ticker for smooth ring lerping
    const tick = () => {
      // Lerp ring towards mouse
      ringPos.x += (mouseX - ringPos.x) * 0.15; // smooth factor
      ringPos.y += (mouseY - ringPos.y) * 0.15;
      
      xSetRing(ringPos.x);
      ySetRing(ringPos.y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  const spawnPetal = (x: number, y: number) => {
    const id = petalIdRef.current++;
    const rotation = Math.random() * 360;
    
    setPetals(prev => [...prev.slice(-15), { id, x, y, rotation }]); // Keep max 15 petals to avoid dom bloat
    
    // Automatically remove after 1.2s (matching animation duration)
    setTimeout(() => {
      setPetals(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  // Ring styles based on state
  let ringStyle = {};
  if (cursorState === 'hover') {
    ringStyle = {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(255, 182, 193, 0.15)',
      borderColor: 'rgba(255, 182, 193, 0)'
    };
  } else if (cursorState === 'text') {
    ringStyle = {
      width: 2,
      height: 24,
      borderRadius: '2px',
      backgroundColor: 'rgba(255, 182, 193, 0.5)',
      borderColor: 'transparent'
    };
  } else {
    // Default
    ringStyle = {
      width: 36,
      height: 36,
      backgroundColor: 'transparent',
      borderColor: 'rgba(255, 182, 193, 0.3)'
    };
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { cursor: none !important; }
        a, button, input, [role="button"] { cursor: none !important; }
      `}} />
      
      {/* Petal Trail Layer */}
      {petals.map(petal => (
        <motion.div
          key={petal.id}
          initial={{ opacity: 0.8, y: petal.y, x: petal.x, rotate: petal.rotation, scale: 0.5 }}
          animate={{ opacity: 0, y: petal.y - 80, x: petal.x + (Math.random() * 40 - 20), rotate: petal.rotation + 90, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9997,
            width: 12,
            height: 12,
            transformOrigin: 'center center',
          }}
        >
          <svg viewBox="0 0 24 24" fill="rgba(255,182,193,0.5)" opacity="0.8">
            <path d="M12 0C12 0 15 8 20 12C20 12 14 14 12 24C12 24 10 14 4 12C4 12 9 8 12 0Z" />
          </svg>
        </motion.div>
      ))}

      {/* Layer 2: Ring */}
      <div 
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          ...ringStyle,
          transition: 'width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s, border-radius 0.3s'
        }}
      />
      
      {/* Layer 1: Dot */}
      <div 
        ref={dotRef}
        className="custom-cursor-dot"
        style={{ opacity: cursorState === 'hover' ? 0 : 1, transition: 'opacity 0.2s' }}
      />
    </>
  );
}
