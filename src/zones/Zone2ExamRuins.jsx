import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Float } from '@react-three/drei';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

function createTextCanvasTexture(bg, border, title, subtitle, cracked = false) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 340;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 340);

  ctx.strokeStyle = border;
  ctx.lineWidth = 12;
  ctx.strokeRect(12, 12, 488, 316);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 130, 440);

  if (subtitle) {
    ctx.fillStyle = border;
    ctx.font = '600 28px "Poppins", sans-serif';
    ctx.fillText(subtitle, 256, 215, 440);
  }

  // Optional cracked screen lines for the calculator
  if (cracked) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 40);
    ctx.lineTo(240, 145);
    ctx.lineTo(205, 255);
    ctx.moveTo(240, 145);
    ctx.lineTo(360, 190);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Interactive Rapier-driven Exam Book or Cracked Calculator.
 * Player can run into it to shove/kick it across the ruins, triggering funny exam jokes!
 */
function KickableExamProp({ position, size, bg, border, title, subtitle, jokeIndex, cracked = false }) {
  const lastPopup = useRef(0);
  const texture = useMemo(
    () => createTextCanvasTexture(bg, border, title, subtitle, cracked),
    [bg, border, title, subtitle, cracked]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  const handleCollision = (payload) => {
    if (payload.other?.rigidBodyObject?.name !== 'player') return;
    const now = Date.now();
    if (now - lastPopup.current < 1600) return;
    lastPopup.current = now;

    const joke = CONFIG.examJokes[jokeIndex % CONFIG.examJokes.length];
    audio.playInteract();
    useGameStore.getState().showToast(`📚 ${joke}`, 2600);
  };

  return (
    <RigidBody
      position={position}
      colliders="cuboid"
      mass={1.2}
      restitution={0.55}
      friction={0.45}
      onCollisionEnter={handleCollision}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial attach="material-0" color="#ece7dc" />
        <meshStandardMaterial attach="material-1" color="#ece7dc" />
        <meshStandardMaterial attach="material-2" map={texture} />
        <meshStandardMaterial attach="material-3" map={texture} />
        <meshStandardMaterial attach="material-4" color="#ece7dc" />
        <meshStandardMaterial attach="material-5" color="#ece7dc" />
      </mesh>
    </RigidBody>
  );
}

/**
 * Floating exam question papers drifting gently above the Exam Hall Ruins.
 */
function FloatingPapers({ center }) {
  const groupRef = useRef();
  const papers = useMemo(
    () => [
      [-2.5, 4.2, -1.8, 0.2],
      [2.8, 5.0, 1.5, -0.3],
      [0.4, 4.8, -3.2, 0.4],
      [-3.2, 3.8, 2.4, -0.15],
      [3.1, 4.3, -2.1, 0.25],
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef} position={center}>
      {papers.map(([x, y, z, rot], i) => (
        <Float key={i} speed={1.6} floatIntensity={0.8} rotationIntensity={0.5}>
          <mesh position={[x, y, z]} rotation={[rot, i, rot]}>
            <planeGeometry args={[1.1, 1.45]} />
            <meshStandardMaterial
              color="#f8f9ff"
              emissive="#ffffff"
              emissiveIntensity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/**
 * Zone 2: "Exam Hall Ruins" (The Guilty Zone)
 * Features a giant chalkboard, floating question papers, and Rapier-simulated
 * giant semester books + cracked calculator that Joshua can kick around.
 */
export function Zone2ExamRuins() {
  const center = CONFIG.zones[1].position; // [-20, 0, 2]

  const chalkTexture = useMemo(
    () =>
      createTextCanvasTexture(
        '#142e24',
        '#ffd166',
        'Semester exams ate my brain',
        'ANNA UNIV • PATTERN 2026'
      ),
    []
  );

  useEffect(() => () => chalkTexture.dispose(), [chalkTexture]);

  return (
    <group name="zone-2-exams">
      {/* Giant Chalkboard Stand */}
      <RigidBody type="fixed" colliders="cuboid" position={[center[0] - 4.2, 2.5, center[2] - 2.8]} rotation={[0, 0.65, 0]}>
        <mesh castShadow receiveShadow userData={{ isCameraCollider: true }}>
          <boxGeometry args={[5.4, 3.4, 0.25]} />
          <meshStandardMaterial color="#3d2817" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <planeGeometry args={[5.0, 3.0]} />
          <meshBasicMaterial map={chalkTexture} />
        </mesh>
      </RigidBody>

      {/* Stacked Giant Books (Kickable with Rapier Physics!) */}
      <KickableExamProp
        position={[center[0] + 0.5, 0.7, center[2] - 0.5]}
        size={[2.6, 0.75, 1.9]}
        bg="#1b3a6b"
        border="#ffd166"
        title="ANNA UNIV"
        subtitle="SEMESTER NOTES"
        jokeIndex={0}
      />
      <KickableExamProp
        position={[center[0] + 0.6, 1.55, center[2] - 0.4]}
        size={[2.3, 0.7, 1.75]}
        bg="#581845"
        border="#00f5ff"
        title="MATHS III"
        subtitle="PART B 16 MARKS"
        jokeIndex={1}
      />
      <KickableExamProp
        position={[center[0] + 0.4, 2.35, center[2] - 0.5]}
        size={[2.0, 0.65, 1.6]}
        bg="#0f3d3e"
        border="#ff2e93"
        title="DATA STRUCT"
        subtitle="UNIT 3 MISSING"
        jokeIndex={2}
      />
      <KickableExamProp
        position={[center[0] - 2.2, 0.6, center[2] + 2.4]}
        size={[2.2, 0.65, 1.65]}
        bg="#2d1b69"
        border="#ffd166"
        title="QB BANK"
        subtitle="ALL IMPORTANT"
        jokeIndex={3}
      />

      {/* Giant Cracked Scientific Calculator (Kickable!) */}
      <KickableExamProp
        position={[center[0] + 3.2, 0.5, center[2] + 2.2]}
        size={[1.6, 0.45, 2.4]}
        bg="#1f273d"
        border="#ff2e93"
        title="17/11 ERR"
        subtitle="fx-991ES CRACKED"
        jokeIndex={4}
        cracked
      />

      {/* Floating Question Papers */}
      <FloatingPapers center={center} />
    </group>
  );
}
