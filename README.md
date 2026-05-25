# [✦ Pixel Ripple](https://www.npmjs.com/package/pixel-ripple)

![Version](https://img.shields.io/badge/version-1.0.0-white?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-white?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS-white?style=flat-square)
![React](https://img.shields.io/badge/built%20with-React-white?style=flat-square)
![Canvas API](https://img.shields.io/badge/Canvas-API-white?style=flat-square)

> **A zero-dependency, canvas-based interactive animation that rasterizes any text string into a grid of luminous pixel blocks — then lets your cursor tear through them like a magnetic field.**

Move your mouse over the letters and watch each block scatter away with organic, spring-loaded physics before snapping back into formation. The effect draws on cosine-envelope distance falloff, per-frame Euler integration, and a hand-crafted 8×12 bitmap font to produce something that feels genuinely alive.

Available as a **vanilla JS library** (single `<script>` tag, no build step) and as a **React component / hook** (TypeScript, npm-installable).

---

## ✦ Key Features

- **Dynamic text rasterization** — Any A–Z string is converted at runtime into a precise grid of pixel blocks using a hand-crafted 8×12 bitmap font. No canvas font rendering, no DOM text — every "pixel" is an independent physics object.

- **Distance-based ripple mathematics** — Cursor influence is calculated using a cosine² envelope over a configurable radius. The result is a smooth, non-linear falloff: blocks at the epicentre scatter violently while those at the edge barely stir.

- **Coupled scale & displacement** — Block scale and scatter distance are mathematically linked. A higher `maxScale` doesn't just inflate blocks in place — it also pushes them further apart, preventing overlap and producing an explosive, organic burst.

- **Spring-physics snap-back** — Every block is an independent spring-mass system. On each frame, a spring force pulls it toward its target position, damped by a friction coefficient. The result is fluid, momentum-driven motion with natural overshoot and settle.

- **Frame-rate independent simulation** — Delta-time (`dt`) is normalised to 60 fps so the physics and interpolation run identically on 30 Hz, 60 Hz, and 144 Hz displays.

- **Exponential interpolation** — Scale and brightness use a frame-rate safe `1 − (1 − α)^dt` formula instead of a naïve `lerp × dt`, preventing overshoot at high frame rates.

- **Colour tinting** — Independently configurable active and idle RGB colours. Blocks smoothly lerp between their dim resting tint and their fully-lit active colour as the cursor passes over them.

- **Organic idle variation** — Each block gets a randomised resting brightness offset (`idleBrVar`) so the text has subtle texture even without interaction.

- **CRT aesthetic** — Optional scanline overlay, per-block glow halo, and a soft ambient radial gradient recreate the look of a high-contrast monochrome monitor.

- **Touch support** — Full `touchmove` / `touchend` handling with `preventDefault` to prevent scroll conflict.

- **Fully responsive** — A debounced resize listener rebuilds the canvas dimensions and recentres the block grid on every window resize.

- **Extensible glyph registry** — Register custom characters at runtime using any 12-row × 8-col binary bitmap.

- **Framework-agnostic** — Use the vanilla JS build with a single `<script>` tag, or install the React package for component/hook-based integration.

---

## ✦ Installation

### Vanilla JS

**Option A — Local file**

Download `pixel-ripple.js`, place it next to your HTML file, and add a `<canvas>` with the `data-pixel-ripple` attribute:

```html
<canvas data-pixel-ripple data-text="HELLO"></canvas>
<script src="src/pixel-ripple.js"></script>
```

**Option B — CDN (jsDelivr)**

```html
<script src="https://cdn.jsdelivr.net/gh/mahmoudplay/pixel-ripple@master/src/pixel-ripple.js"></script>
```

**Option C — ES Module / CommonJS**

```js
// CommonJS
const PixelRipple = require('src/pixel-ripple.js');

// ES Module — auto-boot handles the rest
import 'src/pixel-ripple.js';
```

Auto-boot scans for `[data-pixel-ripple]` on `DOMContentLoaded` and initialises every matching canvas automatically.

---

### React

```bash
# npm
npm install pixel-ripple

# yarn
yarn add pixel-ripple

# pnpm
pnpm add pixel-ripple
```

> **Peer requirements:** React 18+ and a TypeScript-aware bundler (Vite, Next.js, CRA, etc.).

---

## ✦ Quick Start

### Vanilla JS

A fully self-contained, copy-pasteable HTML file. Place `pixel-ripple.js` in the same directory and open in any modern browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixel Ripple</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      cursor: crosshair;
    }
    canvas { display: block; width: 100vw; height: 100vh; }
    #hint {
      position: fixed;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.15);
      font: 10px/1 monospace;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 20;
    }
  </style>
</head>
<body>
  <canvas
    data-pixel-ripple
    data-scanlines="true"
    data-text="PIXEL"
    data-block="18"
    data-gap="4"
    data-letter-gap="2"
    data-ripple-radius="160"
    data-max-disp="28"
    data-max-scale="1.9"
    data-spring-k="0.18"
    data-damp="0.62"
    data-idle-br="0.10"
    data-idle-br-var="0.06"
    data-color-r="255"
    data-color-g="255"
    data-color-b="255"
    data-idle-color-r="26"
    data-idle-color-g="26"
    data-idle-color-b="26"
    data-glow-radius="220"
    data-glow-alpha="0.12"
    data-block-glow-blur="10"
  ></canvas>
  <p id="hint">hover over the letters</p>
  <script src="https://cdn.jsdelivr.net/gh/mahmoudplay/pixel-ripple@master/src/pixel-ripple.js"></script>
</body>
</html>
```

---

### React — `<PixelRipple />` component

```tsx
import { PixelRipple } from "pixel-ripple";

export default function App() {
  const rippleConfig = {
    scanlines: true,
    text: "PIXEL",
    block: 18,
    gap: 4,
    letterGap: 2,
    rippleRadius: 160,
    maxDisp: 10,
    maxScale: 1.8,
    springK: 0.18,
    damp: 0.62,
    idleBr: 0.10,
    idleBrVar: 0.06,
    colorR: 255,
    colorG: 255,
    colorB: 255,
    idleColorR: 26,
    idleColorG: 26,
    idleColorB: 26,
    glowRadius: 220,
    glowAlpha: 0.12,
    blockGlowBlur: 10,
  };

  return (
    <div style={styles.body}>
      <div style={styles.scanlinesOverlay} />

      <PixelRipple 
        config={rippleConfig} 
        style={styles.canvas} 
      />

      <p style={styles.hint}>hover over the letters</p>
    </div>
  );
}

const styles = {
  body: {
    backgroundColor: "#000",
    overflow: "hidden",
    width: "100vw",
    height: "100vh",
    cursor: "crosshair",
    position: "relative" as const,
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    display: "block",
    width: "100vw",
    height: "100vh",
  },
  scanlinesOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.10) 3px, rgba(0,0,0,.10) 4px)",
    pointerEvents: "none" as const,
    zIndex: 5,
  },
  hint: {
    position: "fixed" as const,
    bottom: "22px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255, 255, 255, 0.15)",
    font: "10px/1 monospace",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    pointerEvents: "none" as const,
    zIndex: 20,
    margin: 0,
  }
};
```

The component stretches to fill its parent via `width: 100%; height: 100%`. Wrap it in any sized container and it will adapt automatically.

---

### React — `usePixelRipple` hook

Use this when you need direct control over the `<canvas>` element — for example, to layer other 2D drawing on the same canvas or to integrate with an existing ref.

```tsx
import { useRef } from 'react';
import { usePixelRipple, DEFAULT_CONFIG, type RippleConfig } from 'pixel-ripple';

const config: RippleConfig = {
  ...DEFAULT_CONFIG,
  text: 'REACT',
  colorR: 255,
  colorG: 80,
  colorB: 0,
  idleColorR: 40,
  idleColorG: 10,
  idleColorB: 0,
};

export default function CustomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePixelRipple(canvasRef, config);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', background: '#000' }}
    />
  );
}
```

> **Note:** `usePixelRipple` is a fire-and-forget hook. It attaches all event listeners, starts the `requestAnimationFrame` loop, and returns a cleanup function automatically via `useEffect`. You do not need to manage the lifecycle manually.

---

## ✦ Preset Variations

Swap in these configurations for dramatically different feels without touching any physics code.

**Cyan neon burst**

Vanilla JS:
```html
data-text="NEON"
data-color-r="0"   data-color-g="255" data-color-b="238"
data-idle-color-r="0" data-idle-color-g="20" data-idle-color-b="18"
data-max-scale="2.2" data-ripple-radius="180" data-spring-k="0.14" data-damp="0.58"
```
React:
```tsx
config={{
  text: 'NEON',
  colorR: 0, colorG: 255, colorB: 238,
  idleColorR: 0, idleColorG: 20, idleColorB: 18,
  maxScale: 2.2, rippleRadius: 180, springK: 0.14, damp: 0.58,
}}
```

**Molten fire**

Vanilla JS:
```html
data-text="FIRE"
data-color-r="255" data-color-g="102" data-color-b="0"
data-idle-color-r="40" data-idle-color-g="8" data-idle-color-b="0"
data-max-scale="1.6" data-ripple-radius="140" data-spring-k="0.22" data-damp="0.65"
```
React:
```tsx
config={{
  text: 'FIRE',
  colorR: 255, colorG: 102, colorB: 0,
  idleColorR: 40, idleColorG: 8, idleColorB: 0,
  maxScale: 1.6, rippleRadius: 140, springK: 0.22, damp: 0.65,
}}
```

**Ghost — slow, ethereal drift**

Vanilla JS:
```html
data-text="GHOST"
data-color-r="170" data-color-g="187" data-color-b="255"
data-idle-color-r="8" data-idle-color-g="8" data-idle-color-b="16"
data-max-scale="2.5" data-max-disp="40" data-ripple-radius="200"
data-spring-k="0.10" data-damp="0.72"
```
React:
```tsx
config={{
  text: 'GHOST',
  colorR: 170, colorG: 187, colorB: 255,
  idleColorR: 8, idleColorG: 8, idleColorB: 16,
  maxScale: 2.5, maxDisp: 40, rippleRadius: 200,
  springK: 0.10, damp: 0.72,
}}
```

---

## ✦ Configuration Reference

All options are available in both APIs. In vanilla JS they are `data-*` attributes on the `<canvas>`; in React they are camelCase properties on the `RippleConfig` object. Every option is optional — sensible defaults are applied automatically.

### Layout

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-text` | `text` | `string` | `"HELLO"` | The text string to render. Supports A–Z and spaces. Characters without a glyph entry are silently skipped. |
| `data-block` | `block` | `number` | `18` | Side length of each pixel block in px. |
| `data-gap` | `gap` | `number` | `4` | Gap between adjacent blocks in px. Together with `block`, defines the cell size: `CELL = block + gap`. |
| `data-letter-gap` | `letterGap` | `number` | `2` | Space between letters, measured in cells. |

### Ripple Physics

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-ripple-radius` | `rippleRadius` | `number` | `160` | Radius of cursor influence in px. Blocks outside this distance are unaffected. |
| `data-max-disp` | `maxDisp` | `number` | `28` | Base scatter displacement in px at the epicentre (before scale multiplication). |
| `data-max-scale` | `maxScale` | `number` | `1.9` | Peak block scale at the cursor centre. Also multiplies displacement — higher values produce a more explosive burst. |
| `data-spring-k` | `springK` | `number` | `0.18` | Spring stiffness. Higher = snappier return. Range: `0.01`–`0.8`. |
| `data-damp` | `damp` | `number` | `0.62` | Velocity damping per frame. Lower = more oscillation. Range: `0.1`–`0.99`. |
| `data-lerp-scale` | `lerpScale` | `number` | `3` | Multiplier for scale lerp speed. |
| `data-lerp-br` | `lerpBr` | `number` | `2.5` | Multiplier for brightness lerp speed. |

### Brightness

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-idle-br` | `idleBr` | `number` | `0.10` | Resting block brightness on a `0`–`1` scale. |
| `data-idle-br-var` | `idleBrVar` | `number` | `0.06` | Per-block random brightness variation at rest. Creates subtle texture. |

### Active Colour

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-color-r` | `colorR` | `integer` | `255` | Red channel of the active (lit) block colour. |
| `data-color-g` | `colorG` | `integer` | `255` | Green channel of the active block colour. |
| `data-color-b` | `colorB` | `integer` | `255` | Blue channel of the active block colour. |

### Idle Colour

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-idle-color-r` | `idleColorR` | `integer` | *(same as active)* | Red channel of the idle (resting) block colour. |
| `data-idle-color-g` | `idleColorG` | `integer` | *(same as active)* | Green channel of the idle block colour. |
| `data-idle-color-b` | `idleColorB` | `integer` | *(same as active)* | Blue channel of the idle block colour. |

> **Colour interpolation:** The final block colour on any given frame is `idleColor + (color − idleColor) × clamp(br, 0, 1)`, where `br` is the block's current animated brightness value.

### Glow & Atmosphere

| Vanilla JS attribute | React property | Type | Default | Description |
|---|---|---|---|---|
| `data-scanlines` | `scanlines` | `boolean` | `true` | Renders sharp horizontal translucent micro-scanlines across the canvas to mimic vintage terminal monitors. |
| `data-glow-radius` | `glowRadius` | `number` | `220` | Radius of the soft ambient radial gradient drawn behind the text. |
| `data-glow-alpha` | `glowAlpha` | `number` | `0.12` | Opacity of the ambient glow at its centre. |
| `data-block-glow-blur` | `blockGlowBlur` | `number` | `10` | `shadowBlur` value for per-block glow halos when a block is lit. |

---

## ✦ JavaScript / TypeScript API

### Vanilla JS

**`PixelRipple.init(canvasEl)`**

Initialises (or re-initialises) a single canvas element. Returns a `PixelRippleInstance`.

```js
const instance = PixelRipple.init(document.getElementById('my-canvas'));
```

**`PixelRipple.initAll()`**

Scans the document for every `<canvas data-pixel-ripple>` and initialises them all. Called automatically on page load.

```js
const instances = PixelRipple.initAll();
```

**`instance.reload()`**

Re-reads all `data-*` attributes from the canvas element and rebuilds the block grid. Use this after dynamically changing attributes in JavaScript.

```js
canvas.dataset.text = 'NEW';
canvas.dataset.maxScale = '3';
instance.reload();
```

**`instance.destroy()`**

Cancels the animation loop and removes all event listeners. Safe to call before removing the canvas from the DOM.

```js
instance.destroy();
```

**`PixelRipple.registerGlyph(char, bitmap)`**

Registers a custom character globally. `bitmap` must be a 12-row × 8-column array of `0`/`1` values.

```js
PixelRipple.registerGlyph('!', [
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
]);
```

---

### React

**`RippleConfig`**

The full configuration interface, exported for use in TypeScript projects:

```ts
import type { RippleConfig } from 'pixel-ripple';
```

**`DEFAULT_CONFIG`**

The default configuration object, exported so you can spread it as a base:

```ts
import { DEFAULT_CONFIG } from 'pixel-ripple';

const myConfig: RippleConfig = {
  ...DEFAULT_CONFIG,
  text: 'WORLD',
  colorR: 255, colorG: 60, colorB: 120,
};
```

**`PixelRippleProps`**

Props accepted by the `<PixelRipple />` component:

```ts
interface PixelRippleProps {
  config?:    Partial<RippleConfig>; // merged with DEFAULT_CONFIG
  style?:     React.CSSProperties;
  className?: string;
}
```

**`usePixelRipple`**

```ts
function usePixelRipple(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cfg: RippleConfig
): void;
```

Attaches the full animation engine to the given canvas ref. Starts the `requestAnimationFrame` loop and all input listeners on mount; cancels everything and removes listeners on unmount.

---

## ✦ How It Works

### 1 — Text rasterization

Each character in the text string is looked up in the built-in glyph registry — a map of uppercase letters to 12-row × 8-column binary bitmaps. Every `1` cell becomes an independent block object with a world-space origin position (`ox`, `oy`), computed by centering the full string on the canvas.

### 2 — Ripple influence

On every animation frame, each block measures the squared distance from its **resting origin** to the current mouse position. If within `rippleRadius²`, a cos² envelope is evaluated:

```
env = cos²( distance / rippleRadius × π/2 )
```

This gives a value of `1` at the cursor centre and `0` at the edge — smoothly, without a hard cutoff. The envelope drives displacement, scale, and brightness simultaneously.

### 3 — Coupled scale and displacement

Scale and displacement are intentionally coupled:

```
tSc  = 1 + (maxScale − 1) × env
disp = maxDisp × tSc × env
```

This ensures that increasing `maxScale` produces a genuinely larger explosion rather than just bigger-but-stationary blocks.

### 4 — Spring physics

Each frame, a spring force proportional to the displacement from target is added to the block's velocity, which is then multiplied by the damping factor:

```
vx = (vx + (targetX − x) × springK) × damp
x  += vx × dt
```

`dt` is normalised to 60 fps so the simulation runs at the same speed regardless of display refresh rate. Values are clamped to `3` to prevent large jumps when the tab is backgrounded and foregrounded.

### 5 — Exponential interpolation

Scale and brightness use the frame-rate safe formulation:

```ts
const amt = 1 - Math.pow(1 - Math.min(lerpFactor * 0.1, 0.99), dt);
value += (target - value) * amt;
```

This is mathematically equivalent to repeated application of a fixed-rate lerp, ensuring the same visual speed at any frame rate without overshoot or NaN.

---

## ✦ Browser Support

Works in any browser with `<canvas>` and ES2017+ support.

| Browser | Supported |
|---|---|
| Chrome 80+ | ✓ |
| Firefox 75+ | ✓ |
| Safari 13.1+ | ✓ |
| Edge 80+ | ✓ |
| iOS Safari (touch) | ✓ |
| Android Chrome (touch) | ✓ |

---

## ✦ Made by

- [@mahmoudplay](https://www.github.com/mahmoudplay)
