import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Glowing warp pads placed near each zone. Stepping near one shows a
 * prompt to warp to the next zone in the loop with a neon flash!
 */
export function FastTravelPortals() {
  const ringsRef = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = t * 1.4 + i;
      }
    });
  });

  return (
    <group name="fast-travel-portals">
      {CONFIG.zones.map((zone, idx) => {
        const nextZone = CONFIG.zones[(idx + 1) % CONFIG.zones.length];
        // Offset pad slightly outside the zone center
        const padPos = [
          zone.position[0] * 0.72,
          0.08,
          zone.position[2] * 0.72,
        ];

        return (
          <group
            key={zone.id}
            position={padPos}
            onClick={() => {
              audio.playWarp();
              useGameStore.getState().requestTeleport(nextZone.spawnOffset);
              useGameStore.getState().showToast(`Warped to ${nextZone.name}!`);
            }}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.95, 1.05, 0.1, 16]} />
              <meshStandardMaterial
                color="#0d1636"
                emissive={zone.color}
                emissiveIntensity={0.45}
              />
            </mesh>
            <mesh
              ref={(el) => (ringsRef.current[idx] = el)}
              position={[0, 0.14, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[0.85, 0.05, 8, 24]} />
              <meshBasicMaterial color={zone.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
