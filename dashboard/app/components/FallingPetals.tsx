'use client';

import { useEffect, useRef } from 'react';

export default function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function createPetal() {
      if (!container) return;
      const petal = document.createElement('div');
      petal.classList.add('petal');

      const size = Math.random() * 15 + 10;     // 10–25px
      const left = Math.random() * 100;          // 0–100vw
      const duration = Math.random() * 5 + 5;   // 5–10s
      const delay = Math.random() * 2;           // 0–2s

      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.left = `${left}vw`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;

      container.appendChild(petal);
      setTimeout(() => petal.remove(), (duration + delay) * 1000);
    }

    // Seed an initial burst
    for (let i = 0; i < 15; i++) {
      setTimeout(createPetal, Math.random() * 2000);
    }
    const interval = setInterval(createPetal, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
