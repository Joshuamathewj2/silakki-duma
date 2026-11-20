import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Cute low-poly "SRINATH" NPC standing beside the Cake Altar, waving happily!
 */
function SrinathNPC({ position }) {
  const waveArmRef = useRef();
  const groupRef = useRef();

  const tagTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(10, 16, 40, 0.85)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 JOSHUA', 128, 34);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => tagTex.dispose(), [tagTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waveArmRef.current) {
      // Friendly wave animation
      waveArmRef.current.rotation.z = 2.4 + Math.sin(t * 7) * 0.45;
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, -0.5, 0]}>
      {/* Floating Name Tag */}
      <mesh position={[0, 2.05, 0]}>
        <planeGeometry args={[1.5, 0.38]} />
        <meshBasicMaterial map={tagTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Party Hat */}
      <mesh position={[0, 1.56, 0]}>
        <coneGeometry args={[0.2, 0.44, 8]} />
        <meshStandardMaterial color={CONFIG.colors.pink} emissive={CONFIG.colors.pink} emissiveIntensity={0.5} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#f5cba7" />
      </mesh>

      {/* Hoodie (Gold/Pink birthday edition) */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.52, 0.62, 0.34]} />
        <meshStandardMaterial color="#ff2e93" roughness={0.5} />
      </mesh>

      {/* Waving Right Arm */}
      <group ref={waveArmRef} position={[0.34, 0.85, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.15, 0.44, 0.15]} />
          <meshStandardMaterial color="#ff2e93" />
        </mesh>
      </group>

      {/* Left Arm */}
      <mesh position={[-0.34, 0.65, 0]}>
        <boxGeometry args={[0.15, 0.44, 0.15]} />
        <meshStandardMaterial color="#ff2e93" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.13, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#111830" />
      </mesh>
      <mesh position={[0.13, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#111830" />
      </mesh>
    </group>
  );
}

/**
 * 3D Additive-Blended Fireworks bursting overhead once candles are blown!
 */
function FinaleFireworks({ center, active }) {
  const burstCount = 3;
  const perBurst = 70;
  const total = burstCount * perBurst;
  const pointsRef = useRef();

  const { positions, colors, velocities, origins, ages } = useMemo(() => {
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const vel = new Float32Array(total * 3);
    const orig = [];
    const age = new Float32Array(burstCount);

    const palette = [
      new THREE.Color(CONFIG.colors.cyan),
      new THREE.Color(CONFIG.colors.pink),
      new THREE.Color(CONFIG.colors.gold),
    ];

    for (let b = 0; b < burstCount; b++) {
      age[b] = b * 0.65;
      orig.push(new THREE.Vector3(center[0] + (b - 1) * 4.5, 7.5 + b * 1.4, center[2] - 2));
      const c = palette[b % palette.length];
      for (let i = 0; i < perBurst; i++) {
        const idx = (b * perBurst + i) * 3;
        col[idx] = c.r;
        col[idx + 1] = c.g;
        col[idx + 2] = c.b;
      }
    }
    return { positions: pos, colors: col, velocities: vel, origins: orig, ages: age };
  }, [center, total]);

  const resetBurst = (b) => {
    origins[b].set(
      center[0] + (Math.random() - 0.5) * 11,
      6.5 + Math.random() * 4.5,
      center[2] + (Math.random() - 0.5) * 7
    );
    for (let i = 0; i < perBurst; i++) {
      const idx = (b * perBurst + i) * 3;
      positions[idx] = origins[b].x;
      positions[idx + 1] = origins[b].y;
      positions[idx + 2] = origins[b].z;

      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const speed = 2.4 + Math.random() * 4.0;
      velocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[idx + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[idx + 2] = Math.cos(phi) * speed;
    }
    audio.playFirework();
  };

  useFrame((_, dt) => {
    if (!active || !pointsRef.current) return;
    const clampedDt = Math.min(dt, 0.05);

    for (let b = 0; b < burstCount; b++) {
      ages[b] += clampedDt;
      if (ages[b] > 1.85) {
        ages[b] = 0;
        resetBurst(b);
      }

      for (let i = 0; i < perBurst; i++) {
        const idx = (b * perBurst + i) * 3;
        positions[idx] += velocities[idx] * clampedDt;
        positions[idx + 1] += velocities[idx + 1] * clampedDt;
        positions[idx + 2] += velocities[idx + 2] * clampedDt;
        velocities[idx] *= 0.97;
        velocities[idx + 1] = velocities[idx + 1] * 0.97 - 2.2 * clampedDt;
        velocities[idx + 2] *= 0.97;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={total} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={total} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Zone 5: "The Cake Altar" (Finale)
 * Unlocks once all 5 Birthday Stars are collected.
 * Reveals a giant glowing cake + waving Srinath NPC.
 * Press E to blow out the candles -> fireworks explode + birthday message card unfolds!
 */
export function Zone5CakeAltar() {
  const center = CONFIG.zones[4].position; // [12, 0, -18]
  const collectedCount = useGameStore((s) => s.collectedStars.length);
  const totalStars = useGameStore((s) => s.totalStars);
  const candlesBlown = useGameStore((s) => s.candlesBlown);

  const unlocked = collectedCount >= totalStars;
  const flamesRef = useRef([]);
  const wasNearRef = useRef(false);

  const lockTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 420;
    c.height = 160;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#090e24';
    ctx.fillRect(0, 0, 420, 160);
    ctx.strokeStyle = '#ff2e93';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 404, 144);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 34px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 CAKE ALTAR LOCKED', 210, 68);
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 24px "Poppins", sans-serif';
    ctx.fillText('Collect all 5 stars to unlock!', 210, 118);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => lockTex.dispose(), [lockTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const state = useGameStore.getState();

    // Flicker flames while lit
    if (unlocked && !candlesBlown) {
      flamesRef.current.forEach((f, i) => {
        if (!f) return;
        const s = 0.85 + Math.sin(t * 16 + i * 1.4) * 0.18;
        f.scale.set(s, 0.9 + Math.cos(t * 18 + i) * 0.2, s);
      });
    }

    // Proximity interact check
    const [px, , pz] = state.playerPos;
    const dist = Math.hypot(px - center[0], pz - center[2]);
    const isNear = dist < 5.6;

    if (isNear && unlocked && !wasNearRef.current) {
      wasNearRef.current = true;
      state.setInteractPrompt({
        label: candlesBlown
          ? 'Press [E] to Read Birthday Card'
          : 'Press [E] to Blow Out the Candles 🎂',
        action: () => {
          const st = useGameStore.getState();
          if (!st.candlesBlown) {
            st.blowCandles();
            audio.playBlow();
            window.setTimeout(() => {
              audio.playCelebration();
              useGameStore.getState().setWishCardOpen(true);
            }, 650);
          } else {
            st.setWishCardOpen(true);
          }
        },
      });
    } else if ((!isNear || !unlocked) && wasNearRef.current) {
      wasNearRef.current = false;
      if (
        state.interactPrompt?.label?.includes('Candles') ||
        state.interactPrompt?.label?.includes('Birthday Card')
      ) {
        state.setInteractPrompt(null);
      }
    }
  });

  return (
    <group name="zone-5-cake">
      {/* Altar Pedestal */}
      <RigidBody type="fixed" colliders={false} position={[center[0], 0.3, center[2]]}>
        <CylinderCollider args={[0.3, 3.7]} />
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[3.4, 3.8, 0.6, 24]} />
          <meshStandardMaterial color="#101836" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Locked Holographic Dome (until 5/5 stars collected) */}
      {!unlocked && (
        <group position={[center[0], 0.6, center[2]]}>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[2.8, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial
              color={CONFIG.colors.pink}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
          <mesh position={[0, 2.3, 2.6]} rotation={[0, -0.35, 0]}>
            <planeGeometry args={[3.4, 1.3]} />
            <meshBasicMaterial map={lockTex} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Unlocked Huge Glowing Cake + Waving Srinath NPC */}
      {unlocked && (
        <group position={[center[0], 0.6, center[2]]}>
          {/* Bottom Cake Tier */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[2.0, 2.1, 1.4, 24]} />
            <meshStandardMaterial
              color="#ff4d94"
              emissive="#590d2e"
              emissiveIntensity={0.45}
              roughness={0.38}
            />
          </mesh>

          {/* Gold Frosting Ring */}
          <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.02, 0.1, 10, 32]} />
            <meshStandardMaterial
              color={CONFIG.colors.gold}
              emissive={CONFIG.colors.gold}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Top Cake Tier */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[1.3, 1.38, 1.0, 24]} />
            <meshStandardMaterial
              color="#182b5c"
              emissive="#0a2b4c"
              emissiveIntensity={0.55}
              roughness={0.35}
            />
          </mesh>

          {/* 5 Candles */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            const cx = Math.cos(a) * 0.72;
            const cz = Math.sin(a) * 0.72;
            return (
              <group key={i} position={[cx, 2.85, cz]}>
                <mesh>
                  <cylinderGeometry args={[0.075, 0.075, 0.7, 10]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? CONFIG.colors.cyan : CONFIG.colors.gold}
                    emissive={i % 2 === 0 ? CONFIG.colors.cyan : CONFIG.colors.gold}
                    emissiveIntensity={0.35}
                  />
                </mesh>
                {!candlesBlown && (
                  <mesh
                    ref={(el) => (flamesRef.current[i] = el)}
                    position={[0, 0.5, 0]}
                  >
                    <coneGeometry args={[0.11, 0.34, 8]} />
                    <meshBasicMaterial color="#ffbe33" toneMapped={false} />
                  </mesh>
                )}
              </group>
            );
          })}

          {!candlesBlown && (
            <pointLight position={[0, 3.6, 0]} color="#ffb84d" intensity={18} distance={14} />
          )}

          {/* Waving Srinath NPC */}
          <SrinathNPC position={[3.3, 0, 1.4]} />
        </group>
      )}

      {/* Additive-Blended 3D Fireworks */}
      <FinaleFireworks center={center} active={unlocked && candlesBlown} />
    </group>
  );
}
