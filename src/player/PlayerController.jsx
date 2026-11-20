import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

/**
 * Generates a crisp CanvasTexture for the back of Joshua's hoodie ("JOSHUA").
 */
function createHoodieBackTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#192a56';
  ctx.fillRect(0, 0, 256, 256);

  // Neon cyan stripe
  ctx.fillStyle = '#00f5ff';
  ctx.fillRect(28, 72, 200, 6);
  ctx.fillRect(28, 162, 200, 6);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SRINATH', 128, 118);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Cute low-poly character wearing a midnight-blue hoodie with "JOSHUA" on the back,
 * glowing neon sneakers, bobbing limbs while running, and a glowing shadow ring.
 */
function JoshuaCharacter({ isMovingRef, isFloatingRef }) {
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyGroupRef = useRef();

  const hoodieBackTex = useMemo(() => createHoodieBackTexture(), []);

  useEffect(() => {
    return () => hoodieBackTex.dispose();
  }, [hoodieBackTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const moving = isMovingRef.current;
    const floating = isFloatingRef.current;

    // Simple procedural run / swim cycle
    const swing = floating
      ? Math.sin(t * 4) * 0.45
      : moving
      ? Math.sin(t * 12) * 0.65
      : 0;

    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;

    if (bodyGroupRef.current) {
      bodyGroupRef.current.position.y = floating
        ? Math.sin(t * 3) * 0.08
        : moving
        ? Math.abs(Math.sin(t * 12)) * 0.06
        : Math.sin(t * 2.5) * 0.02;
    }
  });

  return (
    <group ref={bodyGroupRef}>
      {/* Head */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#f5cba7" roughness={0.6} />
      </mesh>

      {/* Hair cap */}
      <mesh position={[0, 0.88, -0.02]} castShadow>
        <boxGeometry args={[0.45, 0.16, 0.45]} />
        <meshStandardMaterial color="#141824" roughness={0.8} />
      </mesh>

      {/* Eyes (facing +Z in local character space) */}
      <mesh position={[-0.1, 0.74, 0.215]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color="#0b1026" />
      </mesh>
      <mesh position={[0.1, 0.74, 0.215]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color="#0b1026" />
      </mesh>

      {/* Hoodie Torso with "JOSHUA" on the back (-Z face) */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.52, 0.62, 0.34]} />
        <meshStandardMaterial attach="material-0" color="#192a56" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#192a56" roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#192a56" roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#192a56" roughness={0.6} />
        <meshStandardMaterial attach="material-4" color="#192a56" roughness={0.6} />
        {/* Back face (-Z is index 5) */}
        <meshStandardMaterial attach="material-5" map={hoodieBackTex} roughness={0.5} />
      </mesh>

      {/* Hoodie hood collar */}
      <mesh position={[0, 0.54, -0.1]}>
        <boxGeometry args={[0.46, 0.14, 0.22]} />
        <meshStandardMaterial color="#273c75" roughness={0.6} />
      </mesh>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.35, 0.42, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.46, 0.16]} />
          <meshStandardMaterial color="#192a56" roughness={0.6} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.35, 0.42, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.46, 0.16]} />
          <meshStandardMaterial color="#192a56" roughness={0.6} />
        </mesh>
      </group>

      {/* Legs + Neon Cyan Sneakers */}
      <group ref={leftLegRef} position={[-0.14, -0.1, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <boxGeometry args={[0.18, 0.46, 0.2]} />
          <meshStandardMaterial color="#0f1526" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.48, 0.04]}>
          <boxGeometry args={[0.2, 0.1, 0.28]} />
          <meshStandardMaterial
            color={CONFIG.colors.cyan}
            emissive={CONFIG.colors.cyan}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.14, -0.1, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <boxGeometry args={[0.18, 0.46, 0.2]} />
          <meshStandardMaterial color="#0f1526" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.48, 0.04]}>
          <boxGeometry args={[0.2, 0.1, 0.28]} />
          <meshStandardMaterial
            color={CONFIG.colors.cyan}
            emissive={CONFIG.colors.cyan}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Glowing shadow ring under the player */}
      <mesh position={[0, -0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.48, 24]} />
        <meshBasicMaterial color={CONFIG.colors.cyan} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/**
 * Instanced footstep dust trail that puffs behind the player while moving.
 */
function FootstepDust({ playerBodyRef, isMovingRef }) {
  const count = 24;
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const puffs = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(0, -50, 0),
        life: 0,
      })),
    []
  );
  const cursorRef = useRef(0);
  const spawnTimer = useRef(0);

  useFrame((_, dt) => {
    if (!meshRef.current || !playerBodyRef.current) return;

    if (isMovingRef.current) {
      spawnTimer.current += dt;
      if (spawnTimer.current > 0.09) {
        spawnTimer.current = 0;
        const t = playerBodyRef.current.translation();
        const p = puffs[cursorRef.current % count];
        p.pos.set(
          t.x + (Math.random() - 0.5) * 0.3,
          t.y - 0.52,
          t.z + (Math.random() - 0.5) * 0.3
        );
        p.life = 1.0;
        cursorRef.current++;
      }
    }

    for (let i = 0; i < count; i++) {
      const p = puffs[i];
      if (p.life > 0) {
        p.life = Math.max(0, p.life - dt * 1.6);
        p.pos.y += dt * 0.35;
        dummy.position.copy(p.pos);
        dummy.scale.setScalar(p.life * 0.22);
      } else {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0.001);
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={CONFIG.colors.cyan} transparent opacity={0.45} />
    </instancedMesh>
  );
}

/**
 * PlayerController handles:
 * - Rapier RigidBody movement (WASD / Arrows / Mobile Joystick, Shift sprint, Space jump)
 * - Zero-gravity air-swimming when inside Zone 3 (Zero-Gravity Zone)
 * - Smooth third-person follow camera with mouse/touch orbit and raycast wall collision
 * - Active zone tracking & fast-travel teleportation
 */
export function PlayerController() {
  const bodyRef = useRef();
  const visualRef = useRef();
  const isMovingRef = useRef(false);
  const isFloatingRef = useRef(false);

  const { camera, gl, scene } = useThree();

  // Keyboard state stored in a ref so useFrame reads it at 60fps with zero re-renders
  const keys = useRef({});
  const jumpQueued = useRef(false);

  // Camera orbit angles (yaw = horizontal, pitch = vertical)
  const camYaw = useRef(0);
  const camPitch = useRef(0.32);
  const camDist = useRef(7.2);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Reusable vectors to avoid per-frame garbage collection
  const tmpCamTarget = useMemo(() => new THREE.Vector3(), []);
  const tmpCamIdeal = useMemo(() => new THREE.Vector3(), []);
  const tmpRayDir = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hudSyncTimer = useRef(0);

  // ==================== INPUT LISTENERS ====================
  useEffect(() => {
    const onKeyDown = (e) => {
      const code = e.code;
      keys.current[code] = true;

      if (code === 'Space') {
        jumpQueued.current = true;
      }

      // Press E to trigger nearby interaction (or exit photo zoom)
      if (code === 'KeyE') {
        const state = useGameStore.getState();
        if (state.photoZoomTarget) {
          state.setPhotoZoomTarget(null);
          audio.playInteract();
        } else if (state.interactPrompt?.action) {
          state.interactPrompt.action();
        }
      }

      if (code === 'Escape') {
        const state = useGameStore.getState();
        if (state.photoZoomTarget) state.setPhotoZoomTarget(null);
      }
    };

    const onKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    // Mouse / Touch drag on canvas to orbit the third-person camera
    const dom = gl.domElement;
    const onPointerDown = (e) => {
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      camYaw.current -= dx * 0.0065;
      camPitch.current = THREE.MathUtils.clamp(camPitch.current + dy * 0.005, 0.08, 1.15);
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };
    const onWheel = (e) => {
      camDist.current = THREE.MathUtils.clamp(camDist.current + e.deltaY * 0.004, 4.2, 12.5);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  // ==================== MAIN PHYSICS & CAMERA LOOP ====================
  useFrame((_, dt) => {
    const body = bodyRef.current;
    if (!body) return;

    const state = useGameStore.getState();
    const clampedDt = Math.min(dt, 0.05);

    // 1. Handle Fast-Travel Teleport Requests
    if (state.teleportRequest) {
      const [tx, ty, tz] = state.teleportRequest.pos;
      body.setTranslation({ x: tx, y: ty, z: tz }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      state.clearTeleport();
    }

    const pos = body.translation();
    const vel = body.linvel();

    // Safety respawn if player falls off the floating island edge
    if (pos.y < -12) {
      body.setTranslation({ x: 0, y: 2.5, z: 16 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      state.showToast('Respawned on the midnight island!');
    }

    // 2. Check Zero-Gravity Zone (Zone 3 centered at [20, 0, 2], radius ~8.5)
    const zeroGCenter = CONFIG.zones[2].position;
    const distToZeroG = Math.hypot(pos.x - zeroGCenter[0], pos.z - zeroGCenter[2]);
    const insideZeroG = distToZeroG < 8.6;
    if (insideZeroG !== state.inZeroGZone) {
      state.setInZeroGZone(insideZeroG);
      if (insideZeroG && !state.zeroGGravityOn) {
        state.showToast(CONFIG.zeroGToast);
      }
    }

    const floating = insideZeroG && !state.zeroGGravityOn;
    isFloatingRef.current = floating;
    // Dynamically switch player gravity scale between 0 (floating) and 1 (normal)
    body.setGravityScale(floating ? 0.0 : 1.0, true);

    // 3. Movement Input (Keyboard + Mobile Virtual Joystick)
    let inputX = 0;
    let inputZ = 0;
    if (!state.photoZoomTarget && !state.wishCardOpen && state.hasEntered) {
      const k = keys.current;
      if (k.KeyW || k.ArrowUp) inputZ -= 1;
      if (k.KeyS || k.ArrowDown) inputZ += 1;
      if (k.KeyA || k.ArrowLeft) inputX -= 1;
      if (k.KeyD || k.ArrowRight) inputX += 1;

      // Add mobile joystick input
      if (Math.abs(state.mobileInput.moveX) > 0.08 || Math.abs(state.mobileInput.moveY) > 0.08) {
        inputX = state.mobileInput.moveX;
        inputZ = state.mobileInput.moveY;
      }
    }

    const inputLen = Math.hypot(inputX, inputZ);
    const isSprinting = Boolean(keys.current.ShiftLeft || keys.current.ShiftRight);
    const moveSpeed = floating ? 7.2 : isSprinting ? 10.5 : 6.8;

    let vx = vel.x * 0.82;
    let vz = vel.z * 0.82;
    let vy = vel.y;

    if (inputLen > 0.05) {
      isMovingRef.current = true;
      const nx = inputX / Math.max(inputLen, 1);
      const nz = inputZ / Math.max(inputLen, 1);

      // Rotate movement relative to camera yaw so "W" always moves forward
      const sinY = Math.sin(camYaw.current);
      const cosY = Math.cos(camYaw.current);
      const worldX = nx * cosY + nz * sinY;
      const worldZ = -nx * sinY + nz * cosY;

      vx = THREE.MathUtils.lerp(vel.x, worldX * moveSpeed, 10 * clampedDt);
      vz = THREE.MathUtils.lerp(vel.z, worldZ * moveSpeed, 10 * clampedDt);

      // Rotate character smoothly toward movement direction
      if (visualRef.current) {
        const targetAngle = Math.atan2(worldX, worldZ);
        let diff = targetAngle - visualRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        visualRef.current.rotation.y += diff * 12 * clampedDt;
      }
    } else {
      isMovingRef.current = false;
    }

    // Jump or Zero-G Vertical Swim
    const wantJump = jumpQueued.current || state.mobileInput.jump;
    if (floating) {
      if (wantJump || keys.current.Space) {
        vy = THREE.MathUtils.lerp(vy, 4.8, 6 * clampedDt);
      } else if (keys.current.ShiftLeft || keys.current.ControlLeft) {
        vy = THREE.MathUtils.lerp(vy, -3.8, 6 * clampedDt);
      } else {
        // Gentle buoyant hover around y = 3.2 when floating
        const hoverPull = (2.8 - pos.y) * 0.45;
        vy = THREE.MathUtils.lerp(vy, hoverPull, 2.5 * clampedDt);
      }
      // Keep player inside vertical ceiling
      if (pos.y > 10.5) vy = Math.min(vy, -1);
      jumpQueued.current = false;
    } else if (wantJump) {
      // Ground check: allow jump when near the island surface or resting on a prop
      if (Math.abs(vel.y) < 0.35 && pos.y < 6.5) {
        vy = 8.4;
        audio.playJump();
      }
      jumpQueued.current = false;
    }

    body.setLinvel({ x: vx, y: vy, z: vz }, true);

    // 4. Third-Person Follow Camera (with Photo Zoom Override & Collision Avoidance)
    if (state.photoZoomTarget) {
      const [px, py, pz] = state.photoZoomTarget.position;
      const [lx, ly, lz] = state.photoZoomTarget.lookAt;
      tmpCamIdeal.set(px, py, pz);
      tmpCamTarget.set(lx, ly, lz);
      camera.position.lerp(tmpCamIdeal, 6 * clampedDt);
      camera.lookAt(tmpCamTarget);
    } else {
      tmpCamTarget.set(pos.x, pos.y + 1.05, pos.z);

      const horiz = camDist.current * Math.cos(camPitch.current);
      const vert = camDist.current * Math.sin(camPitch.current);
      tmpCamIdeal.set(
        tmpCamTarget.x + Math.sin(camYaw.current) * horiz,
        tmpCamTarget.y + vert,
        tmpCamTarget.z + Math.cos(camYaw.current) * horiz
      );

      // Camera collision check: raycast from player head toward ideal camera position
      tmpRayDir.subVectors(tmpCamIdeal, tmpCamTarget);
      const maxDist = tmpRayDir.length();
      if (maxDist > 0.1) {
        tmpRayDir.normalize();
        raycaster.set(tmpCamTarget, tmpRayDir);
        raycaster.far = maxDist;
        const hits = raycaster.intersectObjects(scene.children, true);
        for (let i = 0; i < hits.length; i++) {
          const hit = hits[i];
          // Ignore the player itself and transparent/beacon meshes
          if (
            hit.object.userData?.isCameraCollider &&
            hit.distance < maxDist - 0.35
          ) {
            tmpCamIdeal.copy(tmpCamTarget).addScaledVector(tmpRayDir, Math.max(1.8, hit.distance - 0.35));
            break;
          }
        }
      }

      // Apply optional Easter Egg screen shake
      if (state.screenShake > 0) {
        tmpCamIdeal.x += (Math.random() - 0.5) * state.screenShake;
        tmpCamIdeal.y += (Math.random() - 0.5) * state.screenShake;
      }

      camera.position.lerp(tmpCamIdeal, 9 * clampedDt);
      camera.lookAt(tmpCamTarget);
    }

    // 5. Sync Player Position & Active Zone to Zustand (~12Hz for smooth minimap without overhead)
    hudSyncTimer.current += clampedDt;
    if (hudSyncTimer.current > 0.08) {
      hudSyncTimer.current = 0;
      state.setPlayerTransform([pos.x, pos.y, pos.z], camYaw.current);

      let nearestZone = CONFIG.zones[0].id;
      let nearestDist = Infinity;
      for (const z of CONFIG.zones) {
        const d = Math.hypot(pos.x - z.position[0], pos.z - z.position[2]);
        if (d < nearestDist) {
          nearestDist = d;
          nearestZone = z.id;
        }
      }
      if (nearestZone !== state.activeZone) {
        state.setActiveZone(nearestZone);
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        position={[0, 1.8, 18]}
        colliders={false}
        enabledRotations={[false, false, false]}
        linearDamping={0.4}
        name="player"
      >
        <CapsuleCollider args={[0.38, 0.32]} position={[0, 0.1, 0]} />
        <group ref={visualRef}>
          <JoshuaCharacter isMovingRef={isMovingRef} isFloatingRef={isFloatingRef} />
        </group>
      </RigidBody>

      <FootstepDust playerBodyRef={bodyRef} isMovingRef={isMovingRef} />
    </>
  );
}
