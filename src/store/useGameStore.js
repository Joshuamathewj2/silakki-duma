import { create } from 'zustand';
import { getPerformanceProfile } from '../utils/device.js';

const perf = getPerformanceProfile();

/**
 * Global game state managed by Zustand.
 * Keeps React UI (HUD, modals, mobile joystick) and R3F 3D components
 * cleanly synchronized without unnecessary full-tree re-renders.
 */
export const useGameStore = create((set, get) => ({
  // App lifecycle
  hasEntered: false,
  lowQuality: perf.isLowEnd,
  isMobile: perf.isMobile,
  audioMuted: true,

  // Player & World state
  playerPos: [0, 1.5, 18],
  playerYaw: 0,
  activeZone: 'midnight',
  collectedStars: [], // Array of star IDs
  totalStars: 5,

  // Zero-Gravity Zone state
  inZeroGZone: false,
  zeroGGravityOn: false, // Toggle inside Zone 3

  // Interactions & UI overlays
  interactPrompt: null, // { label: string, action: () => void }
  dialogue: null, // { speaker: string, text: string }
  toast: null, // { text: string, id: number }
  photoZoomTarget: null, // { position: [x,y,z], lookAt: [x,y,z], caption: string } | null
  candlesBlown: false,
  wishCardOpen: false,
  countdownOpen: false,
  warpFlash: false,
  teleportRequest: null, // { pos: [x,y,z], id: number }
  screenShake: 0,

  // Mobile virtual controls state (mutated smoothly for 60fps reading in useFrame)
  mobileInput: {
    moveX: 0,
    moveY: 0,
    jump: false,
    sprint: false,
  },

  // ==================== ACTIONS ====================
  enterWorld: () => set({ hasEntered: true }),
  setAudioMuted: (muted) => set({ audioMuted: muted }),
  setLowQuality: (lowQuality) => set({ lowQuality }),

  setPlayerTransform: (pos, yaw) => set({ playerPos: pos, playerYaw: yaw }),
  setActiveZone: (zoneId) => set({ activeZone: zoneId }),

  collectStar: (starId) => {
    const current = get().collectedStars;
    if (current.includes(starId)) return false;
    const next = [...current, starId];
    set({ collectedStars: next });
    return true;
  },

  setInZeroGZone: (inZone) => set({ inZeroGZone: inZone }),
  toggleZeroGGravity: () => set((s) => ({ zeroGGravityOn: !s.zeroGGravityOn })),

  setInteractPrompt: (prompt) => set({ interactPrompt: prompt }),

  showDialogue: (speaker, text, durationMs = 4500) => {
    set({ dialogue: { speaker, text } });
    if (durationMs > 0) {
      window.clearTimeout(window.__dialogueTimer);
      window.__dialogueTimer = window.setTimeout(() => {
        set({ dialogue: null });
      }, durationMs);
    }
  },
  clearDialogue: () => set({ dialogue: null }),

  showToast: (text, durationMs = 3000) => {
    const id = Date.now() + Math.random();
    set({ toast: { text, id } });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, durationMs);
  },

  setPhotoZoomTarget: (target) => set({ photoZoomTarget: target }),

  blowCandles: () => set({ candlesBlown: true }),
  setWishCardOpen: (open) => set({ wishCardOpen: open }),
  setCountdownOpen: (open) => set({ countdownOpen: open }),

  requestTeleport: (pos) => {
    set({ warpFlash: true, teleportRequest: { pos, id: Date.now() } });
    window.setTimeout(() => set({ warpFlash: false }), 550);
  },
  clearTeleport: () => set({ teleportRequest: null }),

  triggerScreenShake: (amount = 0.6) => {
    set({ screenShake: amount });
    window.setTimeout(() => set({ screenShake: 0 }), 750);
  },

  setMobileMove: (moveX, moveY) =>
    set((s) => ({ mobileInput: { ...s.mobileInput, moveX, moveY } })),
  setMobileJump: (jump) =>
    set((s) => ({ mobileInput: { ...s.mobileInput, jump } })),
}));
