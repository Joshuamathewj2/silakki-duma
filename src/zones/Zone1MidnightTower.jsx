import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Zone 1: "The Missed Midnight" (Spawn Point)
 * A giant neon clock tower frozen at 12:00 AM, 17 NOV.
 * When Joshua walks close, the display glitches and fast-forwards
 * through 18 NOV -> 19 NOV -> 20 NOV and pops up the apology dialogue.
 */
export function Zone1MidnightTower() {
  const pos = CONFIG.zones[0].position; // [0, 0, 14]
  const [triggered, setTriggered] = useState(false);

  const screenState = useRef({
    time: '12:00 AM',
    date: '17 NOV',
    glitch: 0,
    redMode: false,
  });

  // Dynamic CanvasTexture for the glowing clock face
  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const context = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, ctx: context, texture: tex };
  }, []);

  const drawClock = () => {
    const { time, date, glitch, redMode } = screenState.current;
    ctx.fillStyle = '#040814';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0,245,255,0.05)';
    for (let y = 0; y < 256; y += 6) ctx.fillRect(0, y, 512, 2);

    const jx = glitch * (Math.random() - 0.5) * 18;
    const mainCol = redMode ? '#ff2e93' : '#00f5ff';
    const subCol = redMode ? '#ffd166' : '#ff2e93';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 82px "Space Grotesk", monospace';
    ctx.fillStyle = mainCol;
    ctx.fillText(time, 256 + jx, 102);

    ctx.font = 'bold 44px "Space Grotesk", monospace';
    ctx.fillStyle = subCol;
    ctx.fillText(date, 256 - jx * 0.5, 192);

    if (glitch > 0.25) {
      ctx.fillStyle = 'rgba(255,46,147,0.35)';
      ctx.fillRect(0, Math.random() * 230, 512, 12);
    }

    texture.needsUpdate = true;
  };

  useEffect(() => {
    drawClock();
    return () => texture.dispose();
  }, [texture]);

  const runGlitchSequence = () => {
    screenState.current.glitch = 1;
    screenState.current.redMode = true;
    audio.playInteract();

    const steps = [
      { time: '12:01 AM', date: '17 NOV', ms: 120 },
      { time: '04:20 AM', date: '18 NOV', ms: 340 },
      { time: '11:59 PM', date: '18 NOV', ms: 560 },
      { time: '09:15 AM', date: '19 NOV', ms: 780 },
      { time: 'TOO LATE', date: '20 NOV', ms: 1020 },
    ];

    steps.forEach((s, idx) => {
      window.setTimeout(() => {
        screenState.current.time = s.time;
        screenState.current.date = s.date;
        screenState.current.glitch = idx === steps.length - 1 ? 0 : 1;
        drawClock();
      }, s.ms);
    });

    window.setTimeout(() => {
      useGameStore.getState().showDialogue('Joshua', CONFIG.clockDialogue, 5200);
    }, 900);
  };

  useFrame(() => {
    if (screenState.current.glitch > 0.1) {
      drawClock();
    }

    if (!triggered) {
      const [px, , pz] = useGameStore.getState().playerPos;
      const dist = Math.hypot(px - pos[0], pz - pos[2]);
      if (dist < 7.2 && useGameStore.getState().hasEntered) {
        setTriggered(true);
        runGlitchSequence();
      }
    }
  });

  return (
    <group position={pos} name="zone-1-midnight">
      {/* Tower Pillar with Rapier Fixed Collider */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4.2, 0]} castShadow receiveShadow userData={{ isCameraCollider: true }}>
          <boxGeometry args={[2.6, 8.4, 2.2]} />
          <meshStandardMaterial color="#0e1635" roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>

      {/* Neon Corner Accent Strips */}
      {[-1.32, 1.32].map((x, i) => (
        <mesh key={i} position={[x, 4.2, 1.12]}>
          <boxGeometry args={[0.08, 8.2, 0.08]} />
          <meshBasicMaterial color={triggered ? CONFIG.colors.pink : CONFIG.colors.cyan} />
        </mesh>
      ))}

      {/* Glowing Clock Housing at Top */}
      <mesh position={[0, 7.2, 0]} castShadow>
        <boxGeometry args={[5.4, 2.8, 2.5]} />
        <meshStandardMaterial color="#090f26" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Clock Screen Front (+Z facing player spawn) */}
      <mesh position={[0, 7.2, 1.28]}>
        <planeGeometry args={[4.9, 2.35]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Clock Screen Back (-Z facing center of island) */}
      <mesh position={[0, 7.2, -1.28]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.9, 2.35]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Spire Crown */}
      <mesh position={[0, 9.6, 0]}>
        <coneGeometry args={[1.4, 2.1, 4]} />
        <meshStandardMaterial
          color="#16224d"
          emissive={CONFIG.colors.cyan}
          emissiveIntensity={0.45}
          flatShading
        />
      </mesh>
    </group>
  );
}
