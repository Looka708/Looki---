'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060508, 0.001); // Dark Noir void color

    // CAMERA SETUP (Perspective)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance
    containerRef.current.appendChild(renderer.domElement);

    // PARTICLES SETUP
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Additional attributes for custom movement
    const phases = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const baseColor = new THREE.Color(0xFFB6C1); // Sakura 300
    const goldColor = new THREE.Color(0xFFD700); // Rare gold

    for (let i = 0; i < particleCount; i++) {
        // Random spherical distribution, but spread over a wide and tall box
        positions[i * 3] = (Math.random() - 0.5) * 800; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1200; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 600 - 100; // z (depth)

        const isGold = Math.random() < 0.02; // 1 in 50 is gold
        const color = isGold ? goldColor : baseColor;
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Random sizes
        sizes[i] = Math.random() * 2 + 0.5;

        // Custom animation values
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    // Custom shader material for soft glowing particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollY: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        attribute float speed;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        uniform float scrollY;
        uniform vec2 mouse;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          // Drift upward slowly + scroll velocity effect
          pos.y += time * 10.0 * speed + scrollY * speed * 2.0;
          
          // Wrap around Y
          pos.y = mod(pos.y + 600.0, 1200.0) - 600.0;
          
          // Horizontal sway
          pos.x += sin(time * speed * 2.0 + phase) * 10.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Distance falloff for alpha
          vAlpha = smoothstep(-500.0, 100.0, pos.z) * 0.5;
          if (vAlpha < 0.0) vAlpha = 0.0;
          
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;
          
          // Soft circular gradient
          float alpha = (0.5 - ll) * 2.0 * vAlpha;
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // MOUSE & SCROLL TRACKING
    let targetScrollY = 0;
    
    const onScroll = () => {
      targetScrollY = window.scrollY;
    };
    
    // Convert mouse pixels to normalized device coordinates
    const onMouseMove = (e: MouseEvent) => {
       material.uniforms.mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
       material.uniforms.mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // RESIZE
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      material.uniforms.time.value = time;
      
      // Smooth scroll lerping for the particles
      material.uniforms.scrollY.value += (targetScrollY - material.uniforms.scrollY.value) * 0.1;
      
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none' /* ensure it doesn't block interactions */
      }}
    />
  );
}
