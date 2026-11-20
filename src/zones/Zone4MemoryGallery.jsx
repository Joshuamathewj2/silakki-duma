import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Float } from '@react-three/drei';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

function createCardTexture(title, subtitle, accent) {
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 220;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b122b';
  ctx.fillRect(0, 0, 420, 220);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 404, 204);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 210, 88, 360);

  ctx.fillStyle = accent;
  ctx.font = '500 22px "Poppins", sans-serif';
  ctx.fillText(subtitle, 210, 146, 360);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPlaceholderFrameTexture(caption) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121b3b';
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.45)';
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, 464, 336);
  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 34px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 MEMORY SLOT', 256, 165);
  ctx.fillStyle = '#cbd5f5';
  ctx.font = '500 22px "Poppins", sans-serif';
  ctx.fillText(caption, 256, 225, 420);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * A 3D Polaroid frame that loads an image (or shows an editable slot placeholder)
 * while strictly preserving the loaded image's natural aspect ratio.
 */
function PolaroidFrame({ frame, position, rotationY = 0, scale = 1 }) {
  const [photoTex, setPhotoTex] = useState(null);
  const [aspect, setAspect] = useState(4 / 3);

  const fallbackTex = useMemo(() => createPlaceholderFrameTexture(frame.caption), [frame.caption]);

  useEffect(() => {
    if (!frame.src) return;
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      frame.src,
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        const img = tex.image;
        if (img && img.width && img.height) {
          setAspect(img.width / img.height);
        }
        setPhotoTex(tex);
      },
      undefined,
      () => {
        // Keep fallback texture on error
      }
    );
    return () => {
      active = false;
    };
  }, [frame.src]);

  useEffect(() => {
    return () => {
      fallbackTex.dispose();
      if (photoTex) photoTex.dispose();
    };
  }, [fallbackTex, photoTex]);

  // Fit photo inside 3.2 x 2.8 keeping exact aspect ratio (never stretches!)
  const { photoW, photoH, frameW, frameH, photoOffsetY } = useMemo(() => {
    const maxW = 3.2 * scale;
    const maxH = 2.8 * scale;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    const side = 0.22 * scale;
    const top = 0.22 * scale;
    const bottom = 0.72 * scale;
    return {
      photoW: w,
      photoH: h,
      frameW: w + side * 2,
      frameH: h + top + bottom,
      photoOffsetY: (bottom - top) / 2,
    };
  }, [aspect, scale]);

  const captionTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 110;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8f9ff';
    ctx.fillRect(0, 0, 512, 110);
    ctx.fillStyle = '#151c36';
    ctx.font = '600 28px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frame.caption, 256, 56, 470);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [frame.caption]);

  useEffect(() => () => captionTex.dispose(), [captionTex]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Pedestal Base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[frameW * 0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#101836" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Floating Polaroid Card */}
      <Float speed={1.5} floatIntensity={0.25} rotationIntensity={0.04}>
        <group position={[0, frameH / 2 + 1.0, 0]}>
          {/* White Polaroid backing */}
          <mesh castShadow userData={{ isCameraCollider: true }}>
            <boxGeometry args={[frameW, frameH, 0.14]} />
            <meshStandardMaterial color="#f8f9ff" roughness={0.5} />
          </mesh>

          {/* Photo Plane (Exact aspect ratio!) */}
          <mesh position={[0, photoOffsetY, 0.08]}>
            <planeGeometry args={[photoW, photoH]} />
            <meshBasicMaterial
              key={photoTex ? 'loaded' : 'fallback'}
              map={photoTex || fallbackTex}
              toneMapped={false}
            />
          </mesh>

          {/* Bottom Caption Strip */}
          <mesh position={[0, -frameH / 2 + 0.36 * scale, 0.08]}>
            <planeGeometry args={[photoW, 0.56 * scale]} />
            <meshBasicMaterial map={captionTex} />
          </mesh>

          {/* Soft Neon Glow Rim */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[frameW + 0.16, frameH + 0.16, 0.05]} />
            <meshBasicMaterial
              color={frame.isMain ? CONFIG.colors.gold : CONFIG.colors.cyan}
              transparent
              opacity={0.45}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

/**
 * Floating memory text cards hovering around the main polaroid.
 */
function FloatingMemoryCards({ center }) {
  const textures = useMemo(
    () => CONFIG.memoryCards.map((c) => createCardTexture(c.title, c.subtitle, c.color)),
    []
  );

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const offsets = [
    [-4.2, 4.9, 1.5, 0.45],
    [0, 5.6, -1.2, 0.2],
    [4.2, 4.9, 1.5, -0.45],
  ];

  return (
    <group position={center}>
      {CONFIG.memoryCards.map((card, i) => {
        const [x, y, z, rotY] = offsets[i % offsets.length];
        return (
          <Float key={i} speed={1.8} floatIntensity={0.45} rotationIntensity={0.08}>
            <mesh position={[x, y, z]} rotation={[0, rotY, 0]}>
              <planeGeometry args={[2.5, 1.3]} />
              <meshBasicMaterial map={textures[i]} side={THREE.DoubleSide} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

/**
 * Zone 4: "Memory Gallery"
 * Displays 4 Polaroid frames (img1.png, img2.png, img3.png, img4.png) in a curved
 * gallery arc. Walking near any frame lets the player press E to zoom into it!
 */
export function Zone4MemoryGallery() {
  const center = CONFIG.zones[3].position; // [-12, 0, -18]
  const activeFrameIdRef = useRef(null);

  // Curved gallery arc layout for the 4 Polaroid frames
  const framePlacements = useMemo(
    () => [
      { pos: [center[0] - 5.2, 0, center[2] + 2.4], rotY: 0.92, scale: 0.95 },
      { pos: [center[0] - 1.8, 0, center[2] - 0.6], rotY: 0.48, scale: 1.05 },
      { pos: [center[0] + 2.2, 0, center[2] - 1.2], rotY: 0.08, scale: 1.05 },
      { pos: [center[0] + 5.6, 0, center[2] + 0.8], rotY: -0.42, scale: 0.95 },
    ],
    [center]
  );

  useFrame(() => {
    const state = useGameStore.getState();
    const [px, , pz] = state.playerPos;

    // Find the closest frame within 4.6 units so player can zoom into any of the 4 photos
    let closestIdx = -1;
    let closestDist = 4.6;
    CONFIG.galleryFrames.forEach((f, idx) => {
      const p = framePlacements[idx];
      if (!p) return;
      const d = Math.hypot(px - p.pos[0], pz - p.pos[2]);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = idx;
      }
    });

    const nextId = closestIdx >= 0 ? CONFIG.galleryFrames[closestIdx].id : null;
    if (nextId !== activeFrameIdRef.current) {
      activeFrameIdRef.current = nextId;
      if (closestIdx >= 0) {
        const frame = CONFIG.galleryFrames[closestIdx];
        const placement = framePlacements[closestIdx];
        // Position camera cleanly in front of this frame along its normal vector
        const nx = Math.sin(placement.rotY);
        const nz = Math.cos(placement.rotY);
        state.setInteractPrompt({
          label: `Press [E] to Zoom: ${frame.caption}`,
          action: () => {
            audio.playInteract();
            useGameStore.getState().setPhotoZoomTarget({
              position: [
                placement.pos[0] + nx * 4.4,
                2.75,
                placement.pos[2] + nz * 4.4,
              ],
              lookAt: [placement.pos[0], 2.6, placement.pos[2]],
              caption: frame.caption,
            });
          },
        });
      } else if (state.interactPrompt?.label?.includes('Zoom')) {
        state.setInteractPrompt(null);
      }
    }
  });

  const frames = CONFIG.galleryFrames;

  return (
    <group name="zone-4-gallery">
      {frames.slice(0, 4).map((frame, idx) => {
        const placement = framePlacements[idx];
        return (
          <PolaroidFrame
            key={frame.id}
            frame={frame}
            position={placement.pos}
            rotationY={placement.rotY}
            scale={placement.scale}
          />
        );
      })}

      {/* Floating Text Cards ("12 AM wishes since day one", "Certified broski", "Ride or die") */}
      <FloatingMemoryCards center={center} />
    </group>
  );
}
