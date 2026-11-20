import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

function CollectibleStar({ star }) {
  const groupRef = useRef();
  const collected = useGameStore((s) => s.collectedStars.includes(star.id));

  useFrame(({ clock }) => {
    if (collected || !groupRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle hover and spin
    groupRef.current.rotation.y = t * 1.8;
    groupRef.current.rotation.x = Math.sin(t * 2) * 0.25;
    groupRef.current.position.y = star.position[1] + Math.sin(t * 2.6 + star.position[0]) * 0.28;

    // Distance check against player position
    const [px, py, pz] = useGameStore.getState().playerPos;
    const dist = Math.hypot(
      px - star.position[0],
      py - groupRef.current.position.y,
      pz - star.position[2]
    );

    if (dist < 2.15) {
      const store = useGameStore.getState();
      if (store.collectStar(star.id)) {
        audio.playCollect();
        const count = store.collectedStars.length;
        if (count >= CONFIG.stars.length) {
          audio.playCelebration();
          store.showToast('🎉 All 5 Stars collected! The Cake Altar is UNLOCKED!', 4500);
        } else {
          store.showToast(`⭐ Birthday Star ${count}/${CONFIG.stars.length} collected!`);
        }
      }
    }
  });

  if (collected) return null;

  return (
    <group ref={groupRef} position={star.position}>
      {/* Glowing Golden Star Core */}
      <mesh>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={CONFIG.colors.gold}
          emissive={CONFIG.colors.gold}
          emissiveIntensity={1.6}
          toneMapped={false}
          roughness={0.2}
        />
      </mesh>
      {/* Orbiting Cyan Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.85, 0.04, 8, 24]} />
        <meshBasicMaterial color={CONFIG.colors.cyan} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Renders all 5 hidden collectible Birthday Stars across the island.
 */
export function BirthdayStars() {
  return (
    <group name="birthday-stars">
      {CONFIG.stars.map((star) => (
        <CollectibleStar key={star.id} star={star} />
      ))}
    </group>
  );
}
