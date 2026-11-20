import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import helvetikerFontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';

const FONT = new FontLoader().parse(helvetikerFontData);

/**
 * A single 3D extruded letter with Rapier soft physics.
 * Floats gently in zero gravity, reacts when the player bumps into it,
 * and crashes/bounces on the ground when gravity is toggled ON!
 */
function FloatingLetter({ char, initialPos, color, gravityOn, glow }) {
  const bodyRef = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  const geometry = useMemo(() => {
    const geo = new TextGeometry(char, {
      font: FONT,
      size: 0.72,
      depth: 0.24,
      curveSegments: 4,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, [char]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  // Apply upward float kick when switching gravity OFF -> everything lifts up!
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setGravityScale(gravityOn ? 1.2 : 0.0, true);
    if (!gravityOn) {
      body.applyImpulse(
        {
          x: (Math.random() - 0.5) * 0.8,
          y: 2.2 + Math.random() * 2.0,
          z: (Math.random() - 0.5) * 0.8,
        },
        true
      );
    }
  }, [gravityOn]);

  useFrame(({ clock }) => {
    const body = bodyRef.current;
    if (!body || gravityOn) return;

    // Soft containment spring keeps floating letters inside the Zero-G ring
    const t = clock.getElapsedTime();
    const p = body.translation();
    const cx = CONFIG.zones[2].position[0];
    const cz = CONFIG.zones[2].position[2];

    const dx = p.x - cx;
    const dz = p.z - cz;
    const dist = Math.hypot(dx, dz);

    let fx = Math.sin(t * 0.8 + phase) * 0.08;
    let fy = Math.cos(t * 0.7 + phase) * 0.08;
    let fz = Math.cos(t * 0.6 + phase) * 0.08;

    if (dist > 6.8) {
      fx -= (dx / dist) * 0.9;
      fz -= (dz / dist) * 0.9;
    }
    if (p.y > 7.8) fy -= 0.7;
    if (p.y < 1.2) fy += 0.6;

    body.applyImpulse({ x: fx * 0.04, y: fy * 0.04, z: fz * 0.04 }, true);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={initialPos}
      colliders="cuboid"
      gravityScale={gravityOn ? 1.2 : 0.0}
      restitution={0.68}
      friction={0.25}
      linearDamping={0.45}
      angularDamping={0.55}
    >
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow ? 0.8 : 0.35}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * Floating balloon, gift box, or glowing star prop inside the Zero-G Zone.
 */
function FloatingProp({ type, initialPos, color, gravityOn }) {
  const bodyRef = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setGravityScale(gravityOn ? 1.2 : 0.0, true);
    if (!gravityOn) {
      body.applyImpulse(
        {
          x: (Math.random() - 0.5) * 0.7,
          y: 1.8 + Math.random() * 1.8,
          z: (Math.random() - 0.5) * 0.7,
        },
        true
      );
    }
  }, [gravityOn]);

  useFrame(({ clock }) => {
    const body = bodyRef.current;
    if (!body || gravityOn) return;
    const t = clock.getElapsedTime();
    const p = body.translation();
    const cx = CONFIG.zones[2].position[0];
    const cz = CONFIG.zones[2].position[2];
    const dx = p.x - cx;
    const dz = p.z - cz;
    const dist = Math.hypot(dx, dz);

    let fx = Math.sin(t * 0.9 + phase) * 0.06;
    let fy = Math.cos(t * 0.8 + phase) * 0.06;
    let fz = Math.sin(t * 0.7 + phase) * 0.06;

    if (dist > 7.2) {
      fx -= (dx / dist) * 0.8;
      fz -= (dz / dist) * 0.8;
    }
    if (p.y > 8.2) fy -= 0.7;
    if (p.y < 1.1) fy += 0.6;

    body.applyImpulse({ x: fx * 0.035, y: fy * 0.035, z: fz * 0.035 }, true);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={initialPos}
      colliders={type === 'balloon' ? 'ball' : 'cuboid'}
      gravityScale={gravityOn ? 1.2 : 0.0}
      restitution={0.75}
      linearDamping={0.4}
      angularDamping={0.5}
    >
      {type === 'balloon' && (
        <group>
          <mesh castShadow scale={[0.92, 1.12, 0.92]}>
            <sphereGeometry args={[0.52, 14, 14]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.28}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.82, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {type === 'gift' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.78, 0.78, 0.78]} />
            <meshStandardMaterial color={color} roughness={0.35} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.82, 0.16, 0.82]} />
            <meshStandardMaterial color={CONFIG.colors.gold} emissive={CONFIG.colors.gold} emissiveIntensity={0.35} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.16, 0.82, 0.82]} />
            <meshStandardMaterial color={CONFIG.colors.gold} emissive={CONFIG.colors.gold} emissiveIntensity={0.35} />
          </mesh>
        </group>
      )}

      {type === 'star' && (
        <mesh>
          <octahedronGeometry args={[0.36, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.95}
            toneMapped={false}
          />
        </mesh>
      )}
    </RigidBody>
  );
}

/**
 * Zone 3: "Zero-Gravity Zone" (Main Attraction)
 * Glowing neon ring at [20, 0, 2]. Stepping inside turns off gravity for
 * the player, surrounded by 3D extruded birthday letters, balloons, gifts & stars.
 */
export function Zone3ZeroGravity() {
  const center = CONFIG.zones[2].position; // [20, 0, 2]
  const gravityOn = useGameStore((s) => s.zeroGGravityOn);
  const lowQuality = useGameStore((s) => s.lowQuality);
  const ringRef = useRef();

  // Precompute letter positions arranged in 4 floating rows
  const letters = useMemo(() => {
    const rowColors = [
      CONFIG.colors.cyan,
      CONFIG.colors.pink,
      CONFIG.colors.gold,
      CONFIG.colors.cyan,
    ];
    const items = [];
    CONFIG.zeroGWords.forEach((word, rowIdx) => {
      const chars = word.split('');
      const spacing = 0.88;
      const totalW = (chars.length - 1) * spacing;
      chars.forEach((ch, charIdx) => {
        items.push({
          key: `${rowIdx}-${charIdx}-${ch}`,
          char: ch,
          color: rowColors[rowIdx],
          glow: rowIdx === 3, // Extra glow on SRINATH
          initialPos: [
            center[0] - totalW / 2 + charIdx * spacing,
            6.2 - rowIdx * 1.25 + (Math.random() - 0.5) * 0.25,
            center[2] + (Math.random() - 0.5) * 2.4,
          ],
        });
      });
    });
    return items;
  }, [center]);

  // Precompute floating balloons, gifts, and decorative stars
  const props = useMemo(() => {
    const palette = [CONFIG.colors.pink, CONFIG.colors.cyan, CONFIG.colors.gold, '#9b5de5'];
    const arr = [];
    const balloonCount = lowQuality ? 4 : 7;
    const giftCount = lowQuality ? 3 : 5;
    const starCount = lowQuality ? 4 : 7;

    for (let i = 0; i < balloonCount; i++) {
      const a = (i / balloonCount) * Math.PI * 2;
      arr.push({
        key: `b-${i}`,
        type: 'balloon',
        color: palette[i % palette.length],
        initialPos: [center[0] + Math.cos(a) * 5.2, 2.8 + (i % 3) * 1.4, center[2] + Math.sin(a) * 5.2],
      });
    }
    for (let i = 0; i < giftCount; i++) {
      const a = (i / giftCount) * Math.PI * 2 + 0.5;
      arr.push({
        key: `g-${i}`,
        type: 'gift',
        color: palette[(i + 1) % palette.length],
        initialPos: [center[0] + Math.cos(a) * 4.2, 2.0 + (i % 2) * 1.8, center[2] + Math.sin(a) * 4.2],
      });
    }
    for (let i = 0; i < starCount; i++) {
      const a = (i / starCount) * Math.PI * 2 + 1.0;
      arr.push({
        key: `s-${i}`,
        type: 'star',
        color: i % 2 === 0 ? CONFIG.colors.gold : CONFIG.colors.cyan,
        initialPos: [center[0] + Math.cos(a) * 5.8, 3.6 + (i % 3) * 1.1, center[2] + Math.sin(a) * 5.8],
      });
    }
    return arr;
  }, [center, lowQuality]);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.45;
    }
  });

  return (
    <group name="zone-3-zerog">
      {/* Glowing Ground Ring Marking the Zero-Gravity Field */}
      <group position={[center[0], 0.06, center[2]]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.0, 8.45, 48]} />
          <meshBasicMaterial
            color={gravityOn ? CONFIG.colors.pink : CONFIG.colors.cyan}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Subtle translucent anti-gravity floor disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[8.0, 36]} />
          <meshBasicMaterial
            color={gravityOn ? CONFIG.colors.pink : CONFIG.colors.cyan}
            transparent
            opacity={0.07}
          />
        </mesh>
      </group>

      {/* Extra floor collider under Zero-G ring so bouncing letters stay crisp */}
      <RigidBody type="fixed" colliders={false} position={[center[0], -0.25, center[2]]}>
        <CuboidCollider args={[9, 0.25, 9]} />
      </RigidBody>

      {/* 3D Extruded Letters: HAPPY BELATED BIRTHDAY SRINATH */}
      {letters.map((l) => (
        <FloatingLetter
          key={l.key}
          char={l.char}
          initialPos={l.initialPos}
          color={l.color}
          glow={l.glow}
          gravityOn={gravityOn}
        />
      ))}

      {/* Floating Balloons, Gift Boxes & Stars */}
      {props.map((p) => (
        <FloatingProp
          key={p.key}
          type={p.type}
          initialPos={p.initialPos}
          color={p.color}
          gravityOn={gravityOn}
        />
      ))}
    </group>
  );
}
