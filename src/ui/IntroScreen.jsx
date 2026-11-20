import React, { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Intro Screen: "Preparing something for Srinath..." with loading bar,
 * followed by a "Press to Enter" button that unlocks Web Audio cleanly.
 */
export function IntroScreen() {
  const hasEntered = useGameStore((s) => s.hasEntered);
  const enterWorld = useGameStore((s) => s.enterWorld);
  const setAudioMuted = useGameStore((s) => s.setAudioMuted);

  const [progress, setProgress] = useState(12);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(52), 260);
    const t2 = window.setTimeout(() => setProgress(86), 620);
    const t3 = window.setTimeout(() => {
      setProgress(100);
      setReady(true);
    }, 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (hasEntered) return null;

  const handleEnter = () => {
    audio.unlockAndStart();
    setAudioMuted(false);
    audio.playInteract();
    enterWorld();
  };

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-card">
        <span className="pill-tag">17 NOV • BELATED 3D UNIVERSE</span>
        <h1 className="intro-title">{CONFIG.worldTitle}</h1>
        <p className="intro-sub">Preparing something for {CONFIG.recipientName}...</p>

        <div className="loader-track">
          <div className="loader-fill" style={{ width: `${progress}%` }} />
        </div>

        {!ready ? (
          <p className="intro-status">Spawning zero-gravity physics &amp; midnight island... {progress}%</p>
        ) : (
          <div className="intro-ready">
            <button type="button" className="btn-primary" onClick={handleEnter}>
              🚀 Press to Enter
            </button>
            <p className="intro-controls-hint">
              Desktop: <strong>WASD</strong> move • <strong>Space</strong> jump • <strong>Mouse drag</strong> orbit • <strong>E</strong> interact
              <br />
              Mobile: Virtual joystick + Jump/Interact buttons
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
