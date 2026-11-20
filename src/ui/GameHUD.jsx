import React, { useMemo, useState } from 'react';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Compact 2D Minimap + Compass Arrow pointing to the next uncollected star
 * (or to The Cake Altar once all 5 stars are collected).
 */
function MinimapCompass() {
  const playerPos = useGameStore((s) => s.playerPos);
  const collectedStars = useGameStore((s) => s.collectedStars);

  // Target the nearest uncollected star, or the Cake Altar once unlocked
  const target = useMemo(() => {
    const remaining = CONFIG.stars.filter((s) => !collectedStars.includes(s.id));
    if (remaining.length === 0) {
      return {
        label: 'Cake Altar 🎂',
        pos: CONFIG.zones[4].position,
      };
    }
    let best = remaining[0];
    let bestDist = Infinity;
    for (const st of remaining) {
      const d = Math.hypot(playerPos[0] - st.position[0], playerPos[2] - st.position[2]);
      if (d < bestDist) {
        bestDist = d;
        best = st;
      }
    }
    return { label: best.zoneHint, pos: best.position };
  }, [playerPos, collectedStars]);

  const dx = target.pos[0] - playerPos[0];
  const dz = target.pos[2] - playerPos[2];
  const distMeters = Math.round(Math.hypot(dx, dz));
  const angleDeg = (Math.atan2(dx, -dz) * 180) / Math.PI;

  // Map world coordinates (-32..32) into minimap SVG (0..100)
  const toMap = (x, z) => [50 + (x / 34) * 44, 50 + (z / 34) * 44];
  const [px, pz] = toMap(playerPos[0], playerPos[2]);

  return (
    <div className="minimap-box" title={`Compass: ${target.label}`}>
      <svg viewBox="0 0 100 100" className="minimap-svg">
        {/* Island Circle */}
        <circle cx="50" cy="50" r="44" fill="rgba(10,16,40,0.85)" stroke="rgba(0,245,255,0.45)" strokeWidth="2" />

        {/* 5 Zone Markers */}
        {CONFIG.zones.map((z) => {
          const [zx, zz] = toMap(z.position[0], z.position[2]);
          return <circle key={z.id} cx={zx} cy={zz} r="4" fill={z.color} opacity="0.8" />;
        })}

        {/* Remaining Stars */}
        {CONFIG.stars
          .filter((s) => !collectedStars.includes(s.id))
          .map((s) => {
            const [sx, sz] = toMap(s.position[0], s.position[2]);
            return <circle key={s.id} cx={sx} cy={sz} r="3" fill="#ffd166" />;
          })}

        {/* Player Dot */}
        <circle cx={px} cy={pz} r="4.2" fill="#ffffff" stroke="#00f5ff" strokeWidth="2" />
      </svg>

      <div className="compass-row">
        <span className="compass-arrow" style={{ transform: `rotate(${angleDeg}deg)` }}>
          ▲
        </span>
        <span className="compass-dist">{distMeters}m</span>
      </div>
    </div>
  );
}

/**
 * Main HUD Overlay:
 * - Quest bar & star counter (e.g. "⭐ 3/5")
 * - Audio toggle & Fast-Travel menu
 * - Minimap / Compass
 * - Zero-G gravity toggle button (when inside Zone 3)
 * - Dialogue box, Interact prompt, Toast & Photo Zoom exit bar
 */
export function GameHUD() {
  const hasEntered = useGameStore((s) => s.hasEntered);
  const collectedStars = useGameStore((s) => s.collectedStars);
  const totalStars = useGameStore((s) => s.totalStars);
  const activeZone = useGameStore((s) => s.activeZone);
  const audioMuted = useGameStore((s) => s.audioMuted);
  const setAudioMuted = useGameStore((s) => s.setAudioMuted);
  const inZeroGZone = useGameStore((s) => s.inZeroGZone);
  const zeroGGravityOn = useGameStore((s) => s.zeroGGravityOn);
  const toggleZeroGGravity = useGameStore((s) => s.toggleZeroGGravity);
  const interactPrompt = useGameStore((s) => s.interactPrompt);
  const dialogue = useGameStore((s) => s.dialogue);
  const toast = useGameStore((s) => s.toast);
  const photoZoomTarget = useGameStore((s) => s.photoZoomTarget);
  const setPhotoZoomTarget = useGameStore((s) => s.setPhotoZoomTarget);
  const warpFlash = useGameStore((s) => s.warpFlash);

  const [warpMenuOpen, setWarpMenuOpen] = useState(false);

  if (!hasEntered) return null;

  const zoneObj = CONFIG.zones.find((z) => z.id === activeZone) || CONFIG.zones[0];
  const unlocked = collectedStars.length >= totalStars;

  const handleToggleAudio = () => {
    const isPlaying = audio.toggleMute();
    setAudioMuted(!isPlaying);
  };

  const handleGravityToggle = () => {
    const nextOn = !zeroGGravityOn;
    toggleZeroGGravity();
    audio.playGravitySwitch(nextOn);
    useGameStore
      .getState()
      .showToast(nextOn ? 'Gravity ON! Everything crashed down!' : CONFIG.zeroGToast);
  };

  const handleWarp = (zone) => {
    audio.playWarp();
    useGameStore.getState().requestTeleport(zone.spawnOffset);
    useGameStore.getState().showToast(`Warped to ${zone.name}!`);
    setWarpMenuOpen(false);
  };

  return (
    <>
      {/* Glowing Warp Flash Curtain */}
      <div className={`warp-flash ${warpFlash ? 'active' : ''}`} />

      {/* Top HUD Bar */}
      <header className="hud-top">
        {/* Quest + Star Counter */}
        <div className="quest-pill">
          <div className="quest-top-row">
            <span className="star-counter">
              ⭐ {collectedStars.length}/{totalStars}
            </span>
            <span className="zone-chip">{zoneObj.name}</span>
          </div>
          <p className="quest-text">
            {unlocked
              ? '🎂 All stars found! Head to The Cake Altar!'
              : 'Quest: Collect 5 stars → unlock the cake'}
          </p>
        </div>

        {/* Right Controls: Warp + Sound + Minimap */}
        <div className="hud-right">
          <div className="hud-buttons">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setWarpMenuOpen((o) => !o)}
              title="Fast Travel Portals"
            >
              🌀 <span className="btn-text">Warp</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handleToggleAudio}
              title="Toggle Music"
            >
              {audioMuted ? '🔇' : '🔊'} <span className="btn-text">{audioMuted ? 'Muted' : 'Lo-Fi'}</span>
            </button>
          </div>
          <MinimapCompass />
        </div>
      </header>

      {/* Fast-Travel Dropdown */}
      {warpMenuOpen && (
        <div className="warp-menu">
          <p className="warp-menu-title">Fast-Travel Portals</p>
          {CONFIG.zones.map((z) => (
            <button key={z.id} type="button" className="warp-item" onClick={() => handleWarp(z)}>
              <span className="warp-dot" style={{ background: z.color }} />
              {z.name}
            </button>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div key={toast.id} className="toast-banner">
          {toast.text}
        </div>
      )}

      {/* Dialogue Box (e.g. Zone 1 Clock Tower) */}
      {dialogue && (
        <div className="dialogue-box">
          <span className="dialogue-speaker">{dialogue.speaker}</span>
          <p className="dialogue-text">“{dialogue.text}”</p>
        </div>
      )}

      {/* Zone 3 Zero-Gravity Toggle Button */}
      {inZeroGZone && (
        <div className="zerog-bar">
          <button
            type="button"
            className={`btn-pill ${zeroGGravityOn ? 'btn-pill--pink' : 'btn-pill--cyan'}`}
            onClick={handleGravityToggle}
          >
            {zeroGGravityOn ? '⬇️ GRAVITY: ON' : '🛸 GRAVITY: OFF (Space to float)'}
          </button>
        </div>
      )}

      {/* Nearby Interact Prompt */}
      {interactPrompt && !photoZoomTarget && (
        <div className="interact-bar">
          <button
            type="button"
            className="btn-primary"
            onClick={() => interactPrompt.action && interactPrompt.action()}
          >
            {interactPrompt.label}
          </button>
        </div>
      )}

      {/* Photo Zoom Exit Overlay (Zone 4) */}
      {photoZoomTarget && (
        <div className="photo-zoom-bar">
          <span className="photo-zoom-caption">{photoZoomTarget.caption}</span>
          <button
            type="button"
            className="btn-pill btn-pill--cyan"
            onClick={() => {
              audio.playInteract();
              setPhotoZoomTarget(null);
            }}
          >
            ← Back to World [E]
          </button>
        </div>
      )}
    </>
  );
}
