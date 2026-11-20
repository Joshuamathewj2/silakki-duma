import React, { useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore.js';

/**
 * Mobile Touch Controls:
 * - Left: Virtual analog joystick for smooth 360° movement
 * - Right: Jump / Float button + Interact button
 * Shown automatically on touch/mobile screens.
 */
export function MobileControls() {
  const hasEntered = useGameStore((s) => s.hasEntered);
  const isMobile = useGameStore((s) => s.isMobile);
  const interactPrompt = useGameStore((s) => s.interactPrompt);
  const setMobileMove = useGameStore((s) => s.setMobileMove);
  const setMobileJump = useGameStore((s) => s.setMobileJump);

  const baseRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const maxRadius = 40;

  if (!hasEntered || !isMobile) return null;

  const updateStick = (clientX, clientY) => {
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy });
    setMobileMove(dx / maxRadius, dy / maxRadius);
  };

  const resetStick = () => {
    setKnob({ x: 0, y: 0 });
    setMobileMove(0, 0);
  };

  return (
    <div className="mobile-controls">
      {/* Left Virtual Joystick */}
      <div
        ref={baseRef}
        className="joystick-base"
        onTouchStart={(e) => {
          e.stopPropagation();
          updateStick(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          updateStick(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          resetStick();
        }}
      >
        <div
          className="joystick-knob"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      {/* Right Action Buttons */}
      <div className="mobile-actions">
        {interactPrompt && (
          <button
            type="button"
            className="mobile-btn mobile-btn--interact"
            onTouchStart={(e) => {
              e.stopPropagation();
              interactPrompt.action && interactPrompt.action();
            }}
          >
            E
          </button>
        )}
        <button
          type="button"
          className="mobile-btn mobile-btn--jump"
          onTouchStart={(e) => {
            e.stopPropagation();
            setMobileJump(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setMobileJump(false);
          }}
        >
          ⬆
        </button>
      </div>
    </div>
  );
}
