/*
██████╗ ██╗██╗  ██╗███████╗██╗         ██████╗ ██╗██████╗ ██████╗ ██╗     ███████╗
██╔══██╗██║╚██╗██╔╝██╔════╝██║         ██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝
██████╔╝██║ ╚███╔╝ █████╗  ██║  █████╗ ██████╔╝██║██████╔╝██████╔╝██║     █████╗  
██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║  ╚════╝ ██╔══██╗██║██╔═══╝ ██╔═══╝ ██║     ██╔══╝  
██║     ██║██╔╝ ██╗███████╗███████╗    ██║  ██║██║██║     ██║     ███████╗███████╗
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝     ╚══════╝╚══════╝

 * pixel-ripple.js — v1.0.0 (Fixed & Enhanced)
 * A zero-dependency canvas framework for pixel-font ripple effects.
 * Configure entirely via data-* attributes on the <canvas> element.
 * Made by mahmoudplay
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PixelRipple = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  /* ─── Built-in pixel-font glyphs ────────────────────────────────────────
     Each glyph is an 8×12 binary bitmap.
  ─────────────────────────────────────────────────────────────────────── */
  const GLYPHS = {
    'A': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,0,0,1,1,0],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
    ],
    'B': [
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,1,1,0],
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,0,0],
    ],
    'C': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'D': [
      [1,1,1,1,1,0,0,0],
      [1,1,1,1,1,1,0,0],
      [1,1,0,0,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,1,1,1,0],
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,0,0,0],
    ],
    'E': [
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'F': [
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'G': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,1,1,1,1],
      [1,1,0,0,1,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'H': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
    ],
    'I': [
      [1,1,1,1,1,1,1,1],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'J': [
      [0,0,0,0,1,1,1,1],
      [0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'K': [
      [1,1,0,0,0,1,1,0],
      [1,1,0,0,1,1,0,0],
      [1,1,0,1,1,0,0,0],
      [1,1,1,1,0,0,0,0],
      [1,1,1,0,0,0,0,0],
      [1,1,1,1,0,0,0,0],
      [1,1,0,1,1,0,0,0],
      [1,1,0,0,1,1,0,0],
      [1,1,0,0,0,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'L': [
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'M': [
      [1,1,0,0,0,0,1,1],
      [1,1,1,0,0,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
    ],
    'P': [
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
    ],
    'N': [
      [1,1,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1],
      [1,1,1,1,0,0,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,0,0,1,1,1,1],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
    ],
    'O': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
    ],
    'Q': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,1,0,0,1,1],
      [1,1,0,0,1,0,1,1],
      [1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1],
      [0,0,1,1,1,1,0,1],
      [0,0,0,0,0,0,0,0],
    ],
    'R': [
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,1,1,0],
      [1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0],
      [1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'S': [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [0,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'T': [
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'U': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'V': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,0,0,1,1,0],
      [0,1,1,0,0,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'W': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'X': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,0,0,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,1,0,0,1,1,0],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0],
    ],
    'Y': [
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,1,1,0,0,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    'Z': [
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,0,0,0,1,1,0],
      [0,0,0,0,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0],
    ],
  };

  /* ─── Config parser ──────────────────────────────────────────────────── */
  function parseConfig(el) {
    const d = el.dataset;
    return {
      // Layout
      block      : parseFloat(d.block       ?? 18),
      gap        : parseFloat(d.gap         ?? 4),
      letterGap  : parseFloat(d.letterGap   ?? 2),    // letter-gap in cells

      // Ripple physics
      rippleRadius: parseFloat(d.rippleRadius ?? 160),
      maxDisp     : parseFloat(d.maxDisp     ?? 28),
      maxScale    : parseFloat(d.maxScale    ?? 1.9),
      springK     : parseFloat(d.springK     ?? 0.18),
      damp        : parseFloat(d.damp        ?? 0.62),

      // Brightness
      idleBr     : parseFloat(d.idleBr      ?? 0.10),
      idleBrVar  : parseFloat(d.idleBrVar   ?? 0.06),

      // Glow
      glowRadius : parseFloat(d.glowRadius  ?? 220),
      glowAlpha  : parseFloat(d.glowAlpha   ?? 0.12),
      blockGlowBlur: parseFloat(d.blockGlowBlur ?? 10),

      // Color — active block colour when fully lit
      colorR     : parseInt(d.colorR ?? 255),
      colorG     : parseInt(d.colorG ?? 255),
      colorB     : parseInt(d.colorB ?? 255),

      // Idle colour tint (default same as active)
      idleColorR : parseInt(d.idleColorR ?? d.colorR ?? 255),
      idleColorG : parseInt(d.idleColorG ?? d.colorG ?? 255),
      idleColorB : parseInt(d.idleColorB ?? d.colorB ?? 255),

      // Text
      text       : (d.text ?? 'MP').toUpperCase(),

      // Scanlines overlay (boolean)
      scanlines  : (d.scanlines ?? 'true') !== 'false',

      // Lerp speed multipliers
      lerpScale  : parseFloat(d.lerpScale   ?? 3),
      lerpBr     : parseFloat(d.lerpBr      ?? 2.5),
    };
  }

  /* ─── Block builder ──────────────────────────────────────────────────── */
  function buildBlocks(cfg, cx, cy) {
    const CELL   = cfg.block + cfg.gap;
    const ROWS   = 12;
    const COLS   = 8;
    const text   = cfg.text.split('');
    const nChars = text.length;
    const letterW  = COLS * CELL;
    const letterGapPx = CELL * cfg.letterGap;
    const totalW = letterW * nChars + letterGapPx * (nChars - 1);
    const totalH = ROWS * CELL;
    const startX = cx - totalW / 2;
    const startY = cy - totalH / 2;

    const blocks = [];

    text.forEach((char, ci) => {
      const bitmap = GLYPHS[char];
      if (!bitmap) return;
      const offsetX = ci * (letterW + letterGapPx);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!bitmap[r][c]) continue;
          const ox = startX + offsetX + c * CELL + cfg.block / 2;
          const oy = startY + r * CELL + cfg.block / 2;
          const baseBr = cfg.idleBr + (Math.random() * 2 - 1) * cfg.idleBrVar;
          blocks.push({
            ox, oy,
            x: ox, y: oy,
            vx: 0, vy: 0,
            sc: 1, br: baseBr, baseBr,
            seed: Math.random() * Math.PI * 2,
          });
        }
      }
    });

    return blocks;
  }

  /* ─── Core class ─────────────────────────────────────────────────────── */
  class PixelRippleInstance {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.cfg    = parseConfig(canvas);
      this.blocks = [];
      this.mouseX = -9999;
      this.mouseY = -9999;
      this._lastTime = 0;
      this._resizeTimer = null;
      this._raf = null;
      this._isDestroyed = false; // Flag to prevent accidental callbacks after destruction

      this._bindEvents();
      this._resize();
      this._raf = requestAnimationFrame(ts => this._loop(ts));
    }

    /* Public API -------------------------------------------------------- */
    /** Reload configuration from data-* attributes and rebuild blocks. */
    reload() {
      this.cfg = parseConfig(this.canvas);
      this._resize();
    }

    /** Destroy — remove listeners and cancel animation safely. */
    destroy() {
      this._isDestroyed = true;
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      clearTimeout(this._resizeTimer);
      window.removeEventListener('resize', this._onResize);
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
      this.canvas.removeEventListener('touchmove', this._onTouchMove);
      this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }

    /** Register a custom glyph. bitmap must be a 12-row × 8-col 1/0 array. */
    static registerGlyph(char, bitmap) {
      GLYPHS[char.toUpperCase()] = bitmap;
    }

    /* Private ----------------------------------------------------------- */
    _bindEvents() {
      // Fix mouse coordinates by subtracting actual canvas offsets from screen bounds
      this._onMouseMove  = e => { 
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left; 
        this.mouseY = e.clientY - rect.top; 
      };
      
      this._onMouseLeave = () => { this.mouseX = -9999; this.mouseY = -9999; };
      
      // Fix touch coordinates for mobile compatibility
      this._onTouchMove  = e => {
        if (e.cancelable) e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
      };
      
      this._onTouchEnd   = () => { this.mouseX = -9999; this.mouseY = -9999; };
      
      this._onResize     = () => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this._resize(), 120);
      };

      this.canvas.addEventListener('mousemove',  this._onMouseMove,  { passive: true });
      this.canvas.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
      this.canvas.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
      this.canvas.addEventListener('touchend',   this._onTouchEnd,   { passive: true });
      window.addEventListener('resize', this._onResize);
    }

    _resize() {
      if (this._isDestroyed) return;
      const W = this.canvas.width  = this.canvas.offsetWidth  || window.innerWidth;
      const H = this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
      this.W = W; this.H = H;
      this.blocks = buildBlocks(this.cfg, W / 2, H / 2);
    }

    _loop(ts) {
      if (this._isDestroyed) return;
      
      // Queue the next animation frame and track the ID to prevent loops accumulation and memory leaks
      this._raf = requestAnimationFrame(t => this._loop(t));
      
      const dt  = Math.min((ts - this._lastTime) / 16.67, 3);
      this._lastTime = ts;

      const { ctx, W, H, cfg, blocks } = this;

      ctx.clearRect(0, 0, W, H);

      /* Ambient glow */
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, cfg.glowRadius);
      grd.addColorStop(0, `rgba(${cfg.colorR},${cfg.colorG},${cfg.colorB},${cfg.glowAlpha})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const R  = cfg.rippleRadius;
      const R2 = R * R;

      for (const b of blocks) {
        const mdx = b.ox - this.mouseX;
        const mdy = b.oy - this.mouseY;
        const md2 = mdx * mdx + mdy * mdy;

        let tX = b.ox, tY = b.oy, tSc = 1, tBr = b.baseBr;

        if (md2 < R2) {
          const md   = Math.sqrt(md2);
          const norm = md / R;
          const env  = Math.pow(Math.cos(norm * Math.PI * 0.5), 2);
          const ang  = Math.atan2(mdy, mdx) + Math.sin(b.seed) * 0.4;
          
          tSc = 1 + (cfg.maxScale - 1) * env;
          const disp = cfg.maxDisp * tSc * env;
          tX  = b.ox + Math.cos(ang) * disp;
          tY  = b.oy + Math.sin(ang) * disp;
          tBr = b.baseBr + (1 - b.baseBr) * env;
        }

        const fx = (tX - b.x) * cfg.springK;
        const fy = (tY - b.y) * cfg.springK;
        b.vx = (b.vx + fx) * cfg.damp;
        b.vy = (b.vy + fy) * cfg.damp;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const ls = 1 - Math.pow(0.1, dt * 0.25);
        b.sc += (tSc - b.sc) * ls * cfg.lerpScale;
        b.br += (tBr - b.br) * ls * cfg.lerpBr;

        /* Draw Block */
        const half = (cfg.block * b.sc) / 2;
        const t    = Math.max(0, Math.min(1, b.br)); // Clamp 0..1

        const rr = Math.round(cfg.idleColorR + (cfg.colorR - cfg.idleColorR) * t);
        const rg = Math.round(cfg.idleColorG + (cfg.colorG - cfg.idleColorG) * t);
        const rb = Math.round(cfg.idleColorB + (cfg.colorB - cfg.idleColorB) * t);

        if (b.br > 0.4) {
          const ga = (b.br - 0.4) / 0.6;
          ctx.shadowColor = `rgba(${cfg.colorR},${cfg.colorG},${cfg.colorB},${ga * 0.6})`;
          ctx.shadowBlur  = cfg.blockGlowBlur * b.sc;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgb(${rr},${rg},${rb})`;
        ctx.fillRect(b.x - half, b.y - half, cfg.block * b.sc, cfg.block * b.sc);
      }

      ctx.shadowBlur = 0;

      /* ─── Enhanced Feature: Procedural CRT Scanlines Overlay ─────────── */
      if (cfg.scanlines) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Overlay line opacity intensity
        // Draw 1px horizontal black translucent line every 2 vertical pixels
        for (let y = 0; y < H; y += 2) {
          ctx.fillRect(0, y, W, 1);
        }
        ctx.restore();
      }
    }
  }

  /* ─── Static factory ─────────────────────────────────────────────────── */
  const PixelRipple = {
    init(el) {
      if (el._pixelRipple) {
        el._pixelRipple.destroy(); // Fully destroy previous instance to avoid stacked recursive loops
      }
      const instance = new PixelRippleInstance(el);
      el._pixelRipple = instance;
      return instance;
    },

    initAll() {
      return Array.from(document.querySelectorAll('canvas[data-pixel-ripple]'))
        .map(el => PixelRipple.init(el));
    },

    registerGlyph(char, bitmap) {
      GLYPHS[char.toUpperCase()] = bitmap;
    },

    glyphs: GLYPHS,
    Instance: PixelRippleInstance,
  };

  /* ─── Auto-boot ──────────────────────────────────────────────────────── */
  function autoInit() {
    PixelRipple.initAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  return PixelRipple;
});