import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { Stars, Float } from '@react-three/drei';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';

/**
 * Instanced ambient glowing particles floating around the midnight island.
 * Using InstancedMesh keeps draw calls to 1 for smooth 60fps on mobile.
 */
function AmbientParticles({ count }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 34;
      arr.push({
        x: Math.cos(angle) * radius,
        y: 0.6 + Math.random() * 12,
        z: Math.sin(angle) * radius,
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        scale: 0.05 + Math.random() * 0.09,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * 0.6,
        p.y + Math.cos(t * p.speed * 0.9 + p.phase) * 0.5,
        p.z + Math.cos(t * p.speed + p.phase) * 0.6
      );
      const pulse = p.scale * (0.75 + Math.sin(t * 2.5 + p.phase) * 0.25);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={CONFIG.colors.cyan} transparent opacity={0.75} />
    </instancedMesh>
  );
}

/**
 * Glowing neon path strip connecting the central hub to each of the 5 zones.
 */
function GlowingPath({ from, to, color }) {
  const { mid, length, angle } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.hypot(dx, dz);
    return {
      mid: [(from[0] + to[0]) / 2, 0.03, (from[2] + to[2]) / 2],
      length: len,
      angle: Math.atan2(dx, dz),
    };
  }, [from, to]);

  return (
    <mesh position={mid} rotation={[-Math.PI / 2, 0, -angle]}>
      <planeGeometry args={[1.35, length]} />
      <meshBasicMaterial color={color} transparent opacity={0.22} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Smaller decorative floating islands slowly orbiting around the main planet.
 */
function OrbitingIslands() {
  const groupRef = useRef();
  const islands = useMemo(
    () => [
      { radius: 42, y: 6, angle: 0.3, scale: 3.2, color: '#00f5ff' },
      { radius: 48, y: -3, angle: 1.7, scale: 4.0, color: '#ff2e93' },
      { radius: 44, y: 9, angle: 3.1, scale: 2.8, color: '#ffd166' },
      { radius: 50, y: 2, angle: 4.6, scale: 3.6, color: '#7b61ff' },
      { radius: 40, y: -5, angle: 5.5, scale: 2.5, color: '#00f5ff' },
    ],
    []
  );

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {islands.map((isl, i) => (
        <Float key={i} speed={1.2} floatIntensity={1.2} rotationIntensity={0.1}>
          <group
            position={[
              Math.cos(isl.angle) * isl.radius,
              isl.y,
              Math.sin(isl.angle) * isl.radius,
            ]}
          >
            {/* Low-poly floating rock */}
            <mesh position={[0, -isl.scale * 0.45, 0]} rotation={[0, i, 0]}>
              <coneGeometry args={[isl.scale, isl.scale * 1.4, 6]} />
              <meshStandardMaterial color="#0e1635" flatShading roughness={0.8} />
            </mesh>
            {/* Glowing crystal cap */}
            <mesh position={[0, isl.scale * 0.3, 0]}>
              <cylinderGeometry args={[isl.scale * 0.92, isl.scale, 0.4, 6]} />
              <meshStandardMaterial
                color="#16224d"
                emissive={isl.color}
                emissiveIntensity={0.22}
                flatShading
              />
            </mesh>
            {/* Mini glowing crystal spire */}
            <mesh position={[0, isl.scale * 0.85, 0]}>
              <octahedronGeometry args={[isl.scale * 0.25, 0]} />
              <meshStandardMaterial
                color={isl.color}
                emissive={isl.color}
                emissiveIntensity={1.2}
                toneMapped={false}
              />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

/**
 * Subtle vertical glowing beacon pillar at each zone so the player can
 * spot all 5 destinations across the midnight island.
 */
function ZoneBeacons() {
  return (
    <group>
      {CONFIG.zones.map((z) => (
        <group key={z.id} position={[z.position[0], 0.05, z.position[2]]}>
          {/* Ground ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.6, 2.85, 32]} />
            <meshBasicMaterial color={z.color} transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
          {/* Tall faint skyward beacon */}
          <mesh position={[0, 11, 0]}>
            <cylinderGeometry args={[0.06, 0.22, 22, 8, 1, true]} />
            <meshBasicMaterial
              color={z.color}
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function IslandTerrain() {
  const lowQuality = useGameStore((s) => s.lowQuality);
  const particleCount = lowQuality ? 45 : 130;

  return (
    <group name="island-terrain">
      {/* Deep space starfield */}
      <Stars
        radius={85}
        depth={45}
        count={lowQuality ? 1200 : 3200}
        factor={3.6}
        saturation={0.4}
        fade
        speed={0.4}
      />

      {/* Soft distant nebula glow spheres */}
      <mesh position={[-45, 22, -55]}>
        <sphereGeometry args={[18, 16, 16]} />
        <meshBasicMaterial color="#ff2e93" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position={[50, 18, -45]}>
        <sphereGeometry args={[22, 16, 16]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Main Explorable Floating Island with Rapier Physics Collider */}
      <RigidBody type="fixed" colliders={false} name="main-island">
        {/* Flat walkable top surface at y = 0 */}
        <CylinderCollider args={[1.5, 31]} position={[0, -1.5, 0]} />

        {/* Visible top disk */}
        <mesh position={[0, -0.75, 0]} receiveShadow>
          <cylinderGeometry args={[31, 29.5, 1.5, 24]} />
          <meshStandardMaterial
            color={CONFIG.colors.islandTop}
            roughness={0.85}
            metalness={0.15}
            flatShading
          />
        </mesh>

        {/* Low-poly rocky underside */}
        <mesh position={[0, -8.5, 0]}>
          <coneGeometry args={[29.5, 14, 12]} />
          <meshStandardMaterial
            color={CONFIG.colors.islandBottom}
            roughness={0.9}
            flatShading
          />
        </mesh>
      </RigidBody>

      {/* Neon rim ring around the island perimeter */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[30.8, 0.14, 10, 64]} />
        <meshBasicMaterial color={CONFIG.colors.cyan} transparent opacity={0.65} />
      </mesh>

      {/* Central Crossroads Medallion */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.6, 32]} />
        <meshBasicMaterial color={CONFIG.colors.gold} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Glowing paths connecting center (0,0,0) to all 5 zones */}
      {CONFIG.zones.map((z) => (
        <GlowingPath key={z.id} from={[0, 0, 0]} to={z.position} color={z.color} />
      ))}

      {/* Zone Beacons */}
      <ZoneBeacons />

      {/* Orbiting Decorative Islands */}
      <OrbitingIslands />

      {/* Instanced Ambient Firefly Particles */}
      <AmbientParticles count={particleCount} />
    </group>
  );
}
