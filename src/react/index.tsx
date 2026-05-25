import { useEffect, useRef, useCallback, type CSSProperties } from "react";

// ─── Types & Data Structures ──────────────────────────────────────────────────
type GlyphRow = (0 | 1)[];      // Represents a single horizontal row of pixels in a letter
type Glyph = GlyphRow[];         // A collection of rows forming an entire 8x12 character grid
type GlyphMap = Record<string, Glyph>; // A dictionary mapping characters to their pixel grids

interface Block {
  ox: number;      // Original/Anchor X coordinate (where the pixel naturally rests)
  oy: number;      // Original/Anchor Y coordinate
  x: number;       // Current dynamic X coordinate during animation
  y: number;       // Current dynamic Y coordinate during animation
  vx: number;      // Current velocity vector along the X axis
  vy: number;      // Current velocity vector along the Y axis
  sc: number;      // Dynamic scale factor of the block (1 = default size)
  br: number;      // Dynamic brightness coefficient [0.0 to 1.0]
  baseBr: number;  // Personalized baseline idle brightness assigned to this specific block
  seed: number;    // A unique randomized angle used to calculate organic displacement paths
}

interface RippleState {
  blocks: Block[];     // List of active pixel blocks rendering on screen
  mouseX: number;      // Current X position of cursor (defaults to -9999 when off-screen)
  mouseY: number;      // Current Y position of cursor
  lastTime: number;    // High-resolution timestamp from the previous animation frame
  raf: number | null;  // Keeps track of the active requestAnimationFrame ID for cancellation
  W?: number;          // Evaluated canvas width in pixels
  H?: number;          // Evaluated canvas height in pixels
}

export interface RippleConfig {
  block: number;          // Width and height of a single individual pixel block
  gap: number;            // Distance separation between grid elements within a single letter
  letterGap: number;      // Spacing multi-factor explicitly applied between text characters
  rippleRadius: number;   // Radial zone of influence around the cursor cursor
  maxDisp: number;        // Maximum physical pixel displacement pushing blocks away from cursor
  maxScale: number;       // Peak scale size multiplier when a block is fully stimulated
  springK: number;        // Spring stiffness constant governing physics elasticity
  damp: number;           // Velocity dampening factor mimicking kinetic friction
  idleBr: number;         // Baseline ambient brightness for inactive blocks
  idleBrVar: number;      // Maximum random variation added to baseline brightness
  glowRadius: number;     // Inner radius of the canvas-wide ambient radial background glow
  glowAlpha: number;      // Opacity multiplier of the ambient radial background glow
  blockGlowBlur: number;  // Canvas shadow blur depth applied to active, illuminated blocks
  colorR: number;         // Active state Red channel [0..255]
  colorG: number;         // Active state Green channel [0..255]
  colorB: number;         // Active state Blue channel [0..255]
  idleColorR: number;     // Idle state Red channel [0..255]
  idleColorG: number;     // Idle state Green channel [0..255]
  idleColorB: number;     // Idle state Blue channel [0..255]
  text: string;           // Target string to build and render inside the canvas grid
  scanlines: boolean;     // Toggle overlaying a retro CRT monitor scanline texture
  lerpScale: number;      // Multiplier determining the transformation rate of scale adjustments
  lerpBr: number;         // Multiplier determining the transformation rate of color brightness adjustments
}

// ─── Built-in pixel-font glyphs (8×12 binary bitmaps) ────────────────────────
const GLYPHS: GlyphMap = {
  A: [[0,0,1,1,1,1,0,0],[0,1,1,0,0,1,1,0],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1]],
  B: [[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,1,1,0],[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,1,1,1,1,1,0],[1,1,1,1,1,1,0,0]],
  C: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,0,0,0,0,0],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
  D: [[1,1,1,1,1,0,0,0],[1,1,1,1,1,1,0,0],[1,1,0,0,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,1,1,1],[1,1,0,0,1,1,1,0],[1,1,1,1,1,1,0,0],[1,1,1,1,1,0,0,0]],
  E: [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
  F: [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
  G: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,1,1,1,1],[1,1,0,0,1,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,1,0,0,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
  H: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1]],
  I: [[1,1,1,1,1,1,1,1],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
  J: [[0,0,0,0,1,1,1,1],[0,0,0,0,0,0,1,1],[0,0,0,0,0,0,1,1],[0,0,0,0,0,0,1,1],[0,0,0,0,0,0,1,1],[0,0,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
  K: [[1,1,0,0,0,1,1,0],[1,1,0,0,1,1,0,0],[1,1,0,1,1,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,0,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,0,1,1,0,0,0],[1,1,0,0,1,1,0,0],[1,1,0,0,0,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[0,0,0,0,0,0,0,0]],
  L: [[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
  M: [[1,1,0,0,0,0,1,1],[1,1,1,0,0,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,1,1,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1]],
  N: [[1,1,0,0,0,0,1,1],[1,1,1,0,0,0,1,1],[1,1,1,1,0,0,1,1],[1,1,0,1,1,0,1,1],[1,1,0,0,1,1,1,1],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1]],
  O: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0]],
  P: [[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,1,1,1],[1,1,1,1,1,1,1,0],[1,1,1,1,1,1,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0]],
  Q: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,1,0,0,1,1],[1,1,0,0,1,0,1,1],[1,1,0,0,0,1,1,1],[0,1,1,1,1,1,1,1],[0,0,1,1,1,1,0,1],[0,0,0,0,0,0,0,0]],
  R: [[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,1,1,0],[1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,0],[1,1,0,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,0,0,0,0,0,0,0]],
  S: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[0,1,1,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,0,0,0,1,1,1,0],[0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
  T: [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0]],
  U: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
  V: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,0,0,1,1,0],[0,1,1,0,0,1,1,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0]],
  W: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,1,1,0,1,1],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[1,1,1,0,0,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,0,0,0,0,0,0,0]],
  X: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,0,0,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,0,0,1,1,0],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,0,0,0,0,0,0,0]],
  Y: [[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1],[0,1,1,0,0,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0]],
  Z: [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,1,1,0],[0,0,0,0,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,1,1,0,0,0,0],[0,1,1,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
};

// ─── Build blocks from text ───────────────────────────────────────────────────
/**
 * Processes a string and maps it into positioned particles centered inside the canvas.
 * @param cfg Current configuration holding sizes, text values, and gaps.
 * @param cx Middle X coordinate of the canvas.
 * @param cy Middle Y coordinate of the canvas.
 * @returns Array of Block items ready to be animated.
 */
function buildBlocks(cfg: RippleConfig, cx: number, cy: number): Block[] {
  const CELL        = cfg.block + cfg.gap; // Total square step dimension (size + margin)
  const ROWS        = 12;                  // Constant pixel height of built-in glyphs
  const COLS        = 8;                   // Constant pixel width of built-in glyphs
  const chars       = cfg.text.toUpperCase().split("");
  const nChars      = chars.length;
  const letterW     = COLS * CELL;         // Total pixel width occupied by one letter
  const letterGapPx = CELL * cfg.letterGap; // Inter-character gap in actual pixels
  
  // Calculate total bounding box dimensions to correctly center the text string
  const totalW      = letterW * nChars + letterGapPx * (nChars - 1);
  const totalH      = ROWS * CELL;
  
  // Top-left anchoring positions for layout rendering
  const startX      = cx - totalW / 2;
  const startY      = cy - totalH / 2;
  const blocks: Block[] = [];

  chars.forEach((char, ci) => {
    const bitmap = GLYPHS[char];
    if (!bitmap) return; // Skip unrecognized or unsupported typography symbols
    
    const offsetX = ci * (letterW + letterGapPx); // Progressive horizontal translation per letter
    
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!bitmap[r]?.[c]) continue; // Skip rendering if the font binary bit is 0
        
        // Compute base rest positions shifting tracking focus to the block's visual center
        const ox = startX + offsetX + c * CELL + cfg.block / 2;
        const oy = startY + r * CELL + cfg.block / 2;
        
        // Inject small random differences into idle brightness to give a subtle organic shimmer
        const baseBr = cfg.idleBr + (Math.random() * 2 - 1) * cfg.idleBrVar;
        
        blocks.push({
          ox, oy,
          x: ox, y: oy,
          vx: 0, vy: 0,
          sc: 1, br: baseBr, baseBr,
          seed: Math.random() * Math.PI * 2, // Unique wave starting point for rotational turbulence
        });
      }
    }
  });

  return blocks;
}

// ─── usePixelRipple hook ──────────────────────────────────────────────────────
/**
 * Custom React Hook that hooks setup logic, event listeners, resize debouncers,
 * and handles the core 2D canvas execution render loop context.
 */
export function usePixelRipple(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cfg: RippleConfig
): void {
  // Store structural interactive parameters without triggering React re-renders on update loops
  const stateRef = useRef<RippleState>({
    blocks: [],
    mouseX: -9999, // Safely hidden outside accessible window bounds initially
    mouseY: -9999,
    lastTime: 0,
    raf: null,
  });

  /**
   * Refreshes resolution boundaries based on parent layout rules,
   * keeping internal sizes identical to offset attributes to preserve pixel clarity.
   */
  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 600;
    const H = canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 300;
    stateRef.current.W = W;
    stateRef.current.H = H;
    stateRef.current.blocks = buildBlocks(cfg, W / 2, H / 2); // Recenter layout structures
  }, [canvasRef, cfg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state = stateRef.current;

    rebuild();

    // ─── Input Event Handlers ──────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left; // Account for scrolling and margins
      state.mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = (): void => { state.mouseX = -9999; state.mouseY = -9999; };
    
    const onTouchMove = (e: TouchEvent): void => {
      if (e.cancelable) e.preventDefault(); // Stop native scrolling interactions on gesture drag
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      state.mouseX = touch.clientX - rect.left;
      state.mouseY = touch.clientY - rect.top;
    };
    const onTouchEnd = (): void => { state.mouseX = -9999; state.mouseY = -9999; };

    // Register active layout listeners
    canvas.addEventListener("mousemove",  onMouseMove,  { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave, { passive: true });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false }); // Must not be passive to allow preventDefault()
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: true });

    // Debounce windows resize triggers to protect hardware compute performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = (): void => { clearTimeout(resizeTimer); resizeTimer = setTimeout(rebuild, 120); };
    window.addEventListener("resize", onResize);

    let destroyed = false; // Lifecycle flag to prevent async execution after unmounting

    // ─── Main Animation Loop ──────────────────────────────────────────────────
    function loop(ts: number): void {
      if (destroyed) return;
      if (!ctx) return;
      state.raf = requestAnimationFrame(loop);

      // Frame rate independent delta time calculation (normalized around ~60FPS = 1.0)
      if (!state.lastTime) state.lastTime = ts;
      const dt = Math.min((ts - state.lastTime) / 16.67, 3); // Max bound cap at 3 to avoid extreme jumps
      state.lastTime = ts;
      
      const { W, H, blocks, mouseX, mouseY } = state;
      if (!W || !H || !blocks.length) return;

      // Wipe previous frame vectors cleanly
      ctx.clearRect(0, 0, W, H);

      // Render ambient radial background glow centered in the canvas layout
      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, cfg.glowRadius);
      grd.addColorStop(0, `rgba(${cfg.colorR},${cfg.colorG},${cfg.colorB},${cfg.glowAlpha})`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const R  = cfg.rippleRadius;
      const R2 = R * R; // Square radius optimization to bypass expensive Math.sqrt calls where possible

      for (const b of blocks) {
        const mdx = b.ox - mouseX;
        const mdy = b.oy - mouseY;
        const md2 = mdx * mdx + mdy * mdy; // Squared Euclidean distance formula
        
        // Default target values when resting in idle states
        let tX = b.ox, tY = b.oy, tSc = 1, tBr = b.baseBr;

        // Execute mathematical calculation models if the block is inside the ripple influence radius
        if (md2 < R2) {
          const md   = Math.sqrt(md2);
          const norm = md / R; // Normalize distance vector range [0.0 to 1.0]
          
          // Cosine envelope creates a smooth bell-curve falloff distribution pattern
          const env  = Math.pow(Math.cos(norm * Math.PI * 0.5), 2);
          
          // Introduce slight twisting displacement deviations using the block's unique noise seed
          const ang  = Math.atan2(mdy, mdx) + Math.sin(b.seed) * 0.4;
          
          tSc = 1 + (cfg.maxScale - 1) * env; // Expand blocks up to max scale
          const disp = cfg.maxDisp * tSc * env; // Scale distance displacement using envelope weight
          
          tX  = b.ox + Math.cos(ang) * disp; // Apply directional force mutations
          tY  = b.oy + Math.sin(ang) * disp;
          tBr = b.baseBr + (1 - b.baseBr) * env; // Brighten blocks up towards 1.0 peak
        }

        // ─── Hookean Spring Physics Simulation ─────────────────────────────────
        // F = -k * x (Force proportional to structural extension displacement)
        const fx = (tX - b.x) * cfg.springK;
        const fy = (tY - b.y) * cfg.springK;
        
        // Integrate forces into velocity, then damp momentum to simulate drag resistance
        b.vx = (b.vx + fx) * cfg.damp;
        b.vy = (b.vy + fy) * cfg.damp;
        
        // Step spatial coordinate positions across delta time steps
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // ─── Safe Frame-Rate Independent Exponential Lerp ──────────────────────
        // Keeps transitions matching flawlessly across distinct screen refresh rates (e.g., 60Hz, 144Hz)
        const amtScale = 1 - Math.pow(1 - Math.min(cfg.lerpScale * 0.1, 0.99), dt);
        const amtBr    = 1 - Math.pow(1 - Math.min(cfg.lerpBr * 0.1, 0.99), dt);

        b.sc += (tSc - b.sc) * amtScale;
        b.br += (tBr - b.br) * amtBr;

        // Compute sizing adjustments outwards from center offsets
        const half = (cfg.block * b.sc) / 2;
        const t    = Math.max(0, Math.min(1, b.br)); // Strictly clip range within safe color bounds [0..1]

        // Smoothly blend rgb channels based on linear dynamic scale configurations
        const rr = Math.round(cfg.idleColorR + (cfg.colorR - cfg.idleColorR) * t);
        const rg = Math.round(cfg.idleColorG + (cfg.colorG - cfg.idleColorG) * t);
        const rb = Math.round(cfg.idleColorB + (cfg.colorB - cfg.idleColorB) * t);

        // ─── Shadows and Lighting Effects ──────────────────────────────────────
        if (b.br > 0.4) {
          const ga = (b.br - 0.4) / 0.6; // Scale light alpha properties cleanly
          ctx.shadowColor = `rgba(${cfg.colorR},${cfg.colorG},${cfg.colorB},${ga * 0.6})`;
          ctx.shadowBlur  = cfg.blockGlowBlur * b.sc;
        } else {
          ctx.shadowBlur = 0; // Turn off engine drop shadows on dimmed blocks to optimize frame rate
        }

        ctx.fillStyle = `rgb(${rr},${rg},${rb})`;
        ctx.fillRect(b.x - half, b.y - half, cfg.block * b.sc, cfg.block * b.sc);
      }

      ctx.shadowBlur = 0; // Clean context state flags

      // Overlay retro CRT-style alternating horizontal monitor scanlines if enabled
      if (cfg.scanlines) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
        ctx.restore();
      }
    }

    state.raf = requestAnimationFrame(loop);

    // ─── Cleanup on Hook Destroy/Unmount ───────────────────────────────────────
    return () => {
      destroyed = true;
      if (state.raf !== null) cancelAnimationFrame(state.raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove",  onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove",  onTouchMove as EventListener);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [cfg, canvasRef, rebuild]);
}

// ─── Default config ───────────────────────────────────────────────────────────
export const DEFAULT_CONFIG: RippleConfig = {
  block: 18, gap: 4, letterGap: 2,
  rippleRadius: 160, maxDisp: 28, maxScale: 1.9,
  springK: 0.18, damp: 0.62,
  idleBr: 0.10, idleBrVar: 0.06,
  glowRadius: 220, glowAlpha: 0.12, blockGlowBlur: 10,
  colorR: 255, colorG: 255, colorB: 255,
  idleColorR: 255, idleColorG: 255, idleColorB: 255,
  text: "HELLO",
  scanlines: true,
  lerpScale: 3, lerpBr: 2.5,
};

// ─── PixelRipple component ────────────────────────────────────────────────────
export interface PixelRippleProps {
  config?: Partial<RippleConfig>;
  style?: CSSProperties;
  className?: string;
}

export function PixelRipple({ config = {}, style = {}, className = "" }: PixelRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const merged: RippleConfig = { ...DEFAULT_CONFIG, ...config }; // Deep composite configuration assembly
  usePixelRipple(canvasRef, merged);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}