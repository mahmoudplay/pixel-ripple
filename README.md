# ✦ Pixel Ripple

![Version](https://img.shields.io/badge/version-1.0.0-white?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-white?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS-white?style=flat-square)
![Canvas API](https://img.shields.io/badge/Canvas-API-white?style=flat-square)

> **A zero-dependency, canvas-based interactive animation that rasterizes any text string into a grid of luminous pixel blocks — then lets your cursor tear through them like a magnetic field.**

Move your mouse over the letters and watch each block scatter away with organic, spring-loaded physics before snapping back into formation. The effect draws on cosine-envelope distance falloff, per-frame Euler integration, and a hand-crafted 8×12 bitmap font to produce something that feels genuinely alive.

---

## ✦ Key Features

- **Dynamic text rasterization** — Any A–Z string is converted at runtime into a precise grid of pixel blocks using a hand-crafted 8×12 bitmap font. No canvas font rendering, no DOM text — every "pixel" is an independent physics object.

- **Distance-based ripple mathematics** — Cursor influence is calculated using a cosine² envelope over a configurable radius. The result is a smooth, non-linear falloff: blocks at the epicentre scatter violently while those at the edge barely stir.

- **Coupled scale & displacement** — Block scale and scatter distance are mathematically linked. A higher `data-max-scale` doesn't just inflate blocks in place — it also pushes them further apart, preventing overlap and producing an explosive, organic burst.

- **Spring-physics snap-back** — Every block is an independent spring-mass system. On each frame, a spring force pulls it toward its target position, damped by a friction coefficient. The result is fluid, momentum-driven motion with natural overshoot and settle.

- **Colour tinting** — Independently configurable active and idle RGB colours. Blocks smoothly lerp between their dim resting tint and their fully-lit active colour as the cursor passes over them.

- **CRT aesthetic** — Optional scanline overlay, per-block glow halo, and a soft ambient radial gradient recreate the look of a high-contrast monochrome monitor.

- **Fully responsive** — The canvas and block grid rebuild automatically on window resize, always staying perfectly centred.

- **CDN-ready, framework-agnostic** — A single `<script>` tag and a `data-pixel-ripple` attribute on a `<canvas>` element is all it takes. No build step, no npm, no framework.

- **Extensible glyph registry** — Register custom characters at runtime with `PixelRipple.registerGlyph()` using any 12-row × 8-col binary bitmap.

---

## ✦ Installation / Quick Start

### Option A — Local file

1. Download `pixel-ripple.js` and place it next to your HTML file.
2. Add a `<canvas>` with the `data-pixel-ripple` attribute.
3. Include the script. That's it.

```html
<canvas data-pixel-ripple data-text="HELLO"></canvas>
<script src="src/pixel-ripple.js"></script>
```

### Option B — CDN (jsDelivr / unpkg)

Once published to npm, you can load it directly:

```html
<script src="https://cdn.jsdelivr.net/gh/mahmoudplay/pixel-ripple@master/src/pixel-ripple.js"></script>
```

### Option C — ES Module / CommonJS

```js
// CommonJS
const PixelRipple = require('src/pixel-ripple.js');

// Or just import and let auto-boot handle it
import 'src/pixel-ripple.js';
```

Auto-boot scans for `[data-pixel-ripple]` on `DOMContentLoaded` and initialises every matching canvas automatically.

---

## ✦ JavaScript API

For cases where you need programmatic control beyond HTML attributes.

### `PixelRipple.init(canvasEl)`

Initialises (or re-initialises) a single canvas element. Returns a `PixelRippleInstance`.

```js
const instance = PixelRipple.init(document.getElementById('my-canvas'));
```

### `PixelRipple.initAll()`

Scans the document for every `<canvas data-pixel-ripple>` and initialises them all. Called automatically on page load.

```js
const instances = PixelRipple.initAll();
```

### `instance.reload()`

Re-reads all `data-*` attributes from the canvas element and rebuilds the block grid. Use this after dynamically changing attributes in JavaScript.

```js
canvas.dataset.text = 'NEW';
canvas.dataset.maxScale = '3';
instance.reload();
```

### `instance.destroy()`

Cancels the animation loop and removes all event listeners. Safe to call before removing the canvas from the DOM.

```js
instance.destroy();
```

### `PixelRipple.registerGlyph(char, bitmap)`

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

## ✦ Configuration Reference

All configuration is applied directly on the `<canvas>` element via `data-*` attributes. Every attribute is **optional** — sensible defaults are applied automatically.

### Layout

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-text` | `string` | `"MP"` | The text string to render. Supports A–Z and spaces. |
| `data-block` | `number` | `18` | Side length of each pixel block in px. |
| `data-gap` | `number` | `4` | Gap between adjacent blocks in px. |
| `data-letter-gap` | `number` | `2` | Space between letters, measured in cells. |

### Ripple Physics

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-ripple-radius` | `number` | `160` | Radius of cursor influence in px. Blocks outside this distance are unaffected. |
| `data-max-disp` | `number` | `28` | Base scatter displacement in px at the epicentre (before scale multiplication). |
| `data-max-scale` | `number` | `1.9` | Peak block scale at the cursor centre. Also multiplies displacement — higher values produce a more explosive burst. |
| `data-spring-k` | `number` | `0.18` | Spring stiffness. Higher = snappier return. Range: `0.01`–`0.8`. |
| `data-damp` | `number` | `0.62` | Velocity damping per frame. Lower = more oscillation. Range: `0.1`–`0.99`. |
| `data-lerp-scale` | `number` | `3` | Multiplier for scale lerp speed. |
| `data-lerp-br` | `number` | `2.5` | Multiplier for brightness lerp speed. |

### Brightness

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-idle-br` | `number` | `0.10` | Resting block brightness on a `0`–`1` scale. `0` = fully black, `1` = fully lit. |
| `data-idle-br-var` | `number` | `0.06` | Per-block random brightness variation at rest. Creates subtle texture. |

### Colour

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-color-r` | `integer` | `255` | Red channel of the **active** (lit) block colour. |
| `data-color-g` | `integer` | `255` | Green channel of the active block colour. |
| `data-color-b` | `integer` | `255` | Blue channel of the active block colour. |
| `data-idle-color-r` | `integer` | *(same as active)* | Red channel of the **idle** (resting) block colour. |
| `data-idle-color-g` | `integer` | *(same as active)* | Green channel of the idle block colour. |
| `data-idle-color-b` | `integer` | *(same as active)* | Blue channel of the idle block colour. |

### Glow & Atmosphere

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-scanlines` | `boolean` | `true` | When `true`, renders sharp horizontal translucent micro-scanlines across the canvas to mimic vintage terminal monitors. |
| `data-glow-radius` | `number` | `220` | Radius of the soft ambient radial gradient drawn behind the text. |
| `data-glow-alpha` | `number` | `0.12` | Opacity of the ambient glow at its centre. |
| `data-block-glow-blur` | `number` | `10` | `shadowBlur` value for per-block glow halos when a block is lit. |

---

## ✦ Complete Usage Example

The following is a fully self-contained, copy-pasteable HTML file. Place `pixel-ripple.js` in the same directory and open in any modern browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixel Ripple</title>
  <style>
    /* ── Reset ───────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      cursor: crosshair;
    }

    canvas { display: block; width: 100vw; height: 100vh; }

    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,0,0,.10) 3px, rgba(0,0,0,.10) 4px
      );
      pointer-events: none;
      z-index: 5;
    }

    /* ── Subtle interaction hint at the bottom ───────── */
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

    <!--
    ╔═══════════════════════════════════════════════════════════╗
    ║  pixel-ripple.js — configuration via data-* attributes    ║
    ║                                                           ║
    ║  The data-pixel-ripple attribute is the auto-init         ║
    ║  trigger. Every other attribute is optional.              ║
    ╚═══════════════════════════════════════════════════════════╝

    PIXEL RIPPLE CONFIGURATION GUIDE:
    - data-scanlines: Enable classic CRT scanline overlay (true/false)
    - data-text: The string to convert into pixel glyphs (A-Z)
    - data-block: Block side length in px
    - data-gap: Gap between blocks in px
    - data-letter-gap: Space between letters in cells
    - data-ripple-radius: Cursor influence radius in px
    - data-max-disp: Base scatter displacement in px
    - data-max-scale: Peak block scale factor at epicenter
    - data-spring-k: Spring stiffness coefficient
    - data-damp: Velocity damping per frame (brakes)
    - data-idle-br: Resting brightness multiplier (0 to 1)
    - data-idle-br-var: Per-block organic brightness variation
    - data-color-*: RGB components when fully lit (Active)
    - data-idle-color-*: RGB components in resting state (Idle)
    - data-glow-radius: Radial background gradient radius in px
    - data-glow-alpha: Background glow center opacity
    - data-block-glow-blur: Per-block shadowBlur intensity when lit
    -->

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

    <!-- Load the library — auto-initialises [data-pixel-ripple] canvases -->
    <script src="https://cdn.jsdelivr.net/gh/mahmoudplay/pixel-ripple@master/src/pixel-ripple.js"></script>

</body>
</html>
```

### Preset Variations

Swap in these `data-*` combinations to get dramatically different feels without touching any JavaScript:

**Cyan neon burst**
```html
data-text="NEON"
data-color-r="0"   data-color-g="255" data-color-b="238"
data-idle-color-r="0" data-idle-color-g="20" data-idle-color-b="18"
data-max-scale="2.2" data-ripple-radius="180" data-spring-k="0.14" data-damp="0.58"
```

**Molten fire**
```html
data-text="FIRE"
data-color-r="255" data-color-g="102" data-color-b="0"
data-idle-color-r="40" data-idle-color-g="8" data-idle-color-b="0"
data-max-scale="1.6" data-ripple-radius="140" data-spring-k="0.22" data-damp="0.65"
```

**Ghost — slow, ethereal drift**
```html
data-text="GHOST"
data-color-r="170" data-color-g="187" data-color-b="255"
data-idle-color-r="8" data-idle-color-g="8" data-idle-color-b="16"
data-max-scale="2.5" data-max-disp="40" data-ripple-radius="200"
data-spring-k="0.10" data-damp="0.72"
```

---

## ✦ How It Works

### 1 — Text rasterization

Each character in `data-text` is looked up in the built-in glyph registry — a map of uppercase letters to 12-row × 8-column binary bitmaps. Every `1` cell becomes an independent block object with a world-space origin position (`ox`, `oy`), computed by centering the full string on the canvas.

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

This ensures that increasing `data-max-scale` produces a genuinely larger explosion rather than just bigger-but-stationary blocks.

### 4 — Spring physics

Each frame, a spring force proportional to the displacement from target is added to the block's velocity, which is then multiplied by the damping factor:

```
vx = (vx + (targetX − x) × springK) × damp
x  += vx × dt
```

`dt` is normalised to 60 fps so the simulation runs at the same speed regardless of display refresh rate.

---

## ✦ Browser Support

Works in any browser with `<canvas>` and ES6+ support.

| Browser | Supported |
|---|---|
| Chrome 80+ | ✓ |
| Firefox 75+ | ✓ |
| Safari 13.1+ | ✓ |
| Edge 80+ | ✓ |
| Mobile (touch) | ✓ |

---

## Authors

- [@mahmoudplay](https://www.github.com/mahmoudplay)