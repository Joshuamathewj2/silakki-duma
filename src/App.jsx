import React from 'react';
import { World } from './world/World.jsx';
import { IntroScreen } from './ui/IntroScreen.jsx';
import { GameHUD } from './ui/GameHUD.jsx';
import { MobileControls } from './ui/MobileControls.jsx';
import { WishModal } from './ui/WishModal.jsx';
import { BroskiConfetti } from './ui/BroskiConfetti.jsx';

export default function App() {
  return (
    <main className="app-root">
      {/* 3D Explorable Open World (R3F + Rapier + Bloom) */}
      <World />

      {/* 2D Game Layer & Overlays */}
      <IntroScreen />
      <GameHUD />
      <MobileControls />
      <WishModal />
      <BroskiConfetti />
    </main>
  );
}
