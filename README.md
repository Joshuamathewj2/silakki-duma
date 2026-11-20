# 🌌 SRINATH'S MIDNIGHT WORLD

A fully explorable 3D open-world belated birthday mini-game built for **Srinath** (17 Nov), from **Joshua**.

Built with **Vite + React + Three.js (`@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `@react-three/postprocessing`) + Zustand** — mobile-first, 60fps, and zero-config deployable on Vercel.

---

## 🎮 Controls

- **Desktop**: `WASD` / Arrow keys to move • `Shift` to sprint • `Space` to jump / float in Zero-G • `Mouse drag` to orbit camera • `E` to interact
- **Mobile**: On-screen virtual joystick (left) • Jump & Interact buttons (right) • Drag screen to rotate camera
- **Fast Travel**: Click the **🌀 Warp** button in the top-right HUD (or click any glowing portal pad on the island)
- **Easter Egg**: Type **`broski`** anywhere on your keyboard for a mega confetti explosion + screen shake! 🎉

---

## 🗺️ The 5 Explorable Zones

1. **The Missed Midnight (Spawn)**: Giant neon clock tower frozen at `12:00 AM • 17 NOV`. Walk up and watch it glitch through `18, 19, 20 NOV` with Joshua's apology dialogue.
2. **Exam Hall Ruins**: Giant stacked Anna University semester books, a cracked Casio calculator, floating question papers, and a chalkboard. Kick and shove the Rapier-simulated props around for funny exam jokes!
3. **Zero-Gravity Zone**: Step inside the glowing cyan ring to float and swim through the air alongside 3D extruded letters spelling **`HAPPY BELATED BIRTHDAY SRINATH`**, balloons, gift boxes, and stars. Toggle **GRAVITY: ON / OFF** to make everything crash and bounce!
4. **Memory Gallery**: Floating Polaroid frames displaying `public/us.jpg` (preserving exact aspect ratio) + 2 extra customizable photo slots + orbiting memory cards. Walk up and press **`E`** to zoom into the photo.
5. **The Cake Altar (Finale)**: Collect all **5 glowing Birthday Stars** hidden across the island to unlock the altar, revealing a huge glowing birthday cake and the waving **SRINATH** NPC. Press **`E`** to blow out the candles, trigger 3D fireworks, unfold the final birthday letter, and open the `"Wish him back at 12 AM"` countdown to Joshua's birthday!

---

## 🚀 Run Locally

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed:

```bash
npm i
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛠️ Swap Photos, Message & Dates

### 1. Replace the Main Photo
Overwrite `public/us.jpg` with your real photo (any aspect ratio works — the Polaroid frame automatically adapts without stretching!). It is also used as the Open Graph preview image when you share the link on WhatsApp/Instagram.

### 2. Add More Photos & Edit Text
Open [`src/config.js`](src/config.js) to edit:
- `galleryFrames`: Add paths like `'/memory2.jpg'` and `'/memory3.jpg'` (after placing them in `public/`) to fill the 2 extra frames in Zone 4.
- `finalMessage`: Edit the birthday letter heading, body paragraphs, and signature.
- `senderBirthday`: Set Joshua's birthday (`month`, `day`, `label`, `funnyNote`) for the 12 AM countdown timer.
- `examJokes`, `memoryCards`, and `clockDialogue`.

---

## ▲ Deploy on Vercel (Zero Config)

1. Push this project to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel automatically detects **Vite** (`npm run build` → `dist`).
4. Click **Deploy** and share the link with Srinath!

---

## 📁 Folder Structure

```text
├── index.html                    # Open Graph meta tags, fonts & React root
├── public/us.jpg                 # Main photo (replace with yours!)
└── src/
    ├── config.js                 # All editable text, photos, dates & zone coords
    ├── store/useGameStore.js     # Zustand game state
    ├── world/
    │   ├── World.jsx             # R3F Canvas, Rapier Physics, AdaptiveDpr & Bloom
    │   ├── IslandTerrain.jsx     # Low-poly midnight island, paths, beacons & stars
    │   ├── BirthdayStars.jsx     # 5 collectible stars
    │   └── FastTravelPortals.jsx # Glowing zone warp pads
    ├── player/
    │   └── PlayerController.jsx  # Joshua hoodie character, movement, Zero-G & camera
    ├── zones/
    │   ├── Zone1MidnightTower.jsx
    │   ├── Zone2ExamRuins.jsx
    │   ├── Zone3ZeroGravity.jsx
    │   ├── Zone4MemoryGallery.jsx
    │   └── Zone5CakeAltar.jsx
    ├── ui/
    │   ├── IntroScreen.jsx
    │   ├── GameHUD.jsx
    │   ├── MobileControls.jsx
    │   ├── WishModal.jsx
    │   └── BroskiConfetti.jsx
    └── utils/
        ├── audio.js              # Procedural Web Audio lo-fi loop & SFX
        └── device.js             # Low-end phone auto-detection
```
