import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Easter Egg: Typing "broski" anywhere triggers a mega confetti explosion
 * across the screen + camera screen shake + celebratory chime!
 */
export function BroskiConfetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId = null;
    let buffer = '';
    const secret = 'broski';
    const colors = ['#00f5ff', '#ff2e93', '#ffd166', '#ffffff', '#7b61ff'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24;
        p.vx *= 0.99;
        p.rot += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > canvas.height + 30) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        ctx.restore();
      }

      if (particles.length > 0) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const burst = () => {
      const count = window.innerWidth < 768 ? 140 : 250;
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.45;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 4 + Math.random() * 14;
        particles.push({
          x: cx + (Math.random() - 0.5) * 180,
          y: cy + (Math.random() - 0.5) * 90,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 6,
          size: 6 + Math.random() * 7,
          color: colors[i % colors.length],
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          life: 1,
          decay: 0.006 + Math.random() * 0.007,
        });
      }
      if (!rafId) animate();
    };

    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-secret.length);
      if (buffer === secret) {
        buffer = '';
        burst();
        audio.playCelebration();
        useGameStore.getState().triggerScreenShake(0.55);
        useGameStore.getState().showToast('BROSKI MODE ACTIVATED 🎉🔥', 3400);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
