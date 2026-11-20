import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { IslandTerrain } from './IslandTerrain.jsx';
import { BirthdayStars } from './BirthdayStars.jsx';
import { FastTravelPortals } from './FastTravelPortals.jsx';
import { PlayerController } from '../player/PlayerController.jsx';
import { Zone1MidnightTower } from '../zones/Zone1MidnightTower.jsx';
import { Zone2ExamRuins } from '../zones/Zone2ExamRuins.jsx';
import { Zone3ZeroGravity } from '../zones/Zone3ZeroGravity.jsx';
import { Zone4MemoryGallery } from '../zones/Zone4MemoryGallery.jsx';
import { Zone5CakeAltar } from '../zones/Zone5CakeAltar.jsx';

/**
 * Main 3D Canvas & Physics Universe for "Srinath's Midnight World".
 */
export function World() {
  const lowQuality = useGameStore((s) => s.lowQuality);

  return (
    <Canvas
      shadows={!lowQuality}
      dpr={lowQuality ? [0.75, 1] : [1, 1.75]}
      camera={{ fov: 56, near: 0.1, far: 180, position: [0, 6, 25] }}
      gl={{ antialias: !lowQuality, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Automatic DPR scaling keeps frame rate smooth on mobile */}
      <AdaptiveDpr pixelated />

      {/* Midnight deep space background & atmospheric fog */}
      <color attach="background" args={[CONFIG.colors.sky]} />
      <fog attach="fog" args={[CONFIG.colors.sky, 32, 95]} />

      {/* Global Midnight Lighting */}
      <ambientLight intensity={0.65} color="#a6bcff" />
      <directionalLight
        position={[18, 28, 16]}
        intensity={1.25}
        color="#e6f0ff"
        castShadow={!lowQuality}
        shadow-mapSize={lowQuality ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
      <pointLight position={[-18, 8, 2]} color={CONFIG.colors.pink} intensity={22} distance={38} />
      <pointLight position={[20, 9, 2]} color={CONFIG.colors.cyan} intensity={26} distance={40} />
      <pointLight position={[0, 10, -18]} color={CONFIG.colors.gold} intensity={20} distance={40} />

      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]} timeStep="vary">
          <IslandTerrain />
          <PlayerController />
          <BirthdayStars />
          <FastTravelPortals />

          {/* The 5 Explorable Zones */}
          <Zone1MidnightTower />
          <Zone2ExamRuins />
          <Zone3ZeroGravity />
          <Zone4MemoryGallery />
          <Zone5CakeAltar />
        </Physics>

        {/* Bloom Post-Processing (auto-disabled on low-end phones) */}
        {!lowQuality && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.75}
              luminanceThreshold={0.75}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
