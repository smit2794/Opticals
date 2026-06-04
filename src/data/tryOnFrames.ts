// src/data/tryOnFrames.ts
// 8 unique try-on frames — each has fully independent 3D geometry parameters.
// Frames are rendered via Three.js (GlassesGeometry.ts) in real-time on the face.

export interface LensColor {
  r: number; g: number; b: number;
  a: number; // 0=invisible, 1=opaque
}

export interface FrameColor {
  r: number; g: number; b: number;
}

export interface TryOnFrame {
  id:          string;
  name:        string;
  style:       string;
  frameShape:  string;       // matches case in GlassesGeometry.ts
  overlayImage: string;      // 2D preview image in the carousel card
  deepARScale: { x: number; y: number; z: number }; // legacy, kept for compatibility
  lensColor:   LensColor;    // unique per frame
  frameColor:  FrameColor;   // unique per frame
  description: string;
}

const TRY_ON_FRAMES: TryOnFrame[] = [

  // ── 1. Wayfarer (NEW — from reference image) ───────────────────────────────
  // Wide trapezoidal, thick navy, peach-pink lenses
  {
    id:          'wayfarer',
    name:        'Wayfarer',
    style:       'Bold & Streetwear',
    frameShape:  'wayfarer',
    overlayImage: '/frames/frame_wayfarer.png',
    deepARScale: { x: 1.18, y: 0.86, z: 0.94 },
    lensColor:   { r: 1.00, g: 0.72, b: 0.55, a: 0.32 }, // warm peach-pink
    frameColor:  { r: 0.07, g: 0.10, b: 0.30 },           // deep navy blue
    description: 'Iconic thick-frame wayfarer in deep navy with warm peach lenses.',
  },

  // ── 2. Round (from reference image) ────────────────────────────────────────
  // Perfect circles, thin navy metal, sky-blue tinted lenses
  {
    id:          'round',
    name:        'Round',
    style:       'Vintage & Artsy',
    frameShape:  'round',
    overlayImage: '/frames/frame_round.png',
    deepARScale: { x: 0.90, y: 1.18, z: 0.90 },
    lensColor:   { r: 0.52, g: 0.82, b: 1.00, a: 0.28 }, // sky-blue tint
    frameColor:  { r: 0.05, g: 0.08, b: 0.32 },           // deep navy metal
    description: 'Classic John Lennon round frames in navy with sky-blue tinted lenses.',
  },

  // ── 3. Cat-Eye ─────────────────────────────────────────────────────────────
  // Upswept corners, thick gloss black, dark smoke lenses
  {
    id:          'cateye',
    name:        'Cat-Eye',
    style:       'Bold & Dramatic',
    frameShape:  'cat-eye',
    overlayImage: '/frames/frame_cateye.png',
    deepARScale: { x: 1.42, y: 0.70, z: 0.88 },
    lensColor:   { r: 0.12, g: 0.12, b: 0.12, a: 0.20 }, // dark smoke
    frameColor:  { r: 0.03, g: 0.03, b: 0.03 },           // gloss black
    description: 'Dramatic upswept cat-eye in gloss black with dark smoke lenses.',
  },

  // ── 4. Aviator ─────────────────────────────────────────────────────────────
  // Teardrop shape, thin gold metal, olive-green tinted lenses
  {
    id:          'aviator',
    name:        'Aviator',
    style:       'Cool & Iconic',
    frameShape:  'aviator',
    overlayImage: '/frames/frame_aviator.png',
    deepARScale: { x: 1.22, y: 1.10, z: 0.82 },
    lensColor:   { r: 0.38, g: 0.52, b: 0.28, a: 0.42 }, // military olive-green
    frameColor:  { r: 0.85, g: 0.70, b: 0.20 },           // warm gold metal
    description: 'Iconic gold aviator with double-bridge and olive-green tinted lenses.',
  },

  // ── 5. Browline ─────────────────────────────────────────────────────────────
  // Full thick brow top, thin silver wire bottom, warm grey lenses
  {
    id:          'browline',
    name:        'Browline',
    style:       'Retro & Sophisticated',
    frameShape:  'browline',
    overlayImage: '/frames/frame_browline.png',
    deepARScale: { x: 1.06, y: 1.02, z: 1.04 },
    lensColor:   { r: 0.82, g: 0.80, b: 0.76, a: 0.15 }, // warm grey
    frameColor:  { r: 0.10, g: 0.08, b: 0.07 },           // warm dark brown-black
    description: 'Classic clubmaster browline with thick brow and silver wire rim.',
  },

  // ── 6. Hexagonal ────────────────────────────────────────────────────────────
  // 6-sided, thin rose-gold, blush-peach tint
  {
    id:          'hexagonal',
    name:        'Hexagonal',
    style:       'Geometric & Modern',
    frameShape:  'hexagonal',
    overlayImage: '/frames/frame_hexagonal.png',
    deepARScale: { x: 0.98, y: 0.94, z: 1.08 },
    lensColor:   { r: 1.00, g: 0.82, b: 0.76, a: 0.18 }, // blush peach
    frameColor:  { r: 0.80, g: 0.52, b: 0.46 },           // rose gold
    description: 'Modern hexagonal frame in rose-gold with a soft blush-peach tint.',
  },

  // ── 7. Oval ─────────────────────────────────────────────────────────────────
  // Wide ellipse, thick tortoiseshell brown, warm amber tint
  {
    id:          'oval',
    name:        'Oval',
    style:       'Warm & Timeless',
    frameShape:  'oval',
    overlayImage: '/frames/frame_oval.png',
    deepARScale: { x: 1.16, y: 0.96, z: 1.00 },
    lensColor:   { r: 1.00, g: 0.72, b: 0.28, a: 0.30 }, // warm amber
    frameColor:  { r: 0.52, g: 0.26, b: 0.06 },           // rich tortoiseshell brown
    description: 'Wide tortoiseshell oval with warm amber tinted lenses.',
  },

  // ── 8. D-Frame / Square ──────────────────────────────────────────────────────
  // Flat-top rectangle, thick charcoal-black, crystal-clear lenses
  {
    id:          'dframe',
    name:        'D-Frame',
    style:       'Strong & Classic',
    frameShape:  'square',
    overlayImage: '/frames/frame_dframe.png',
    deepARScale: { x: 1.12, y: 0.88, z: 0.95 },
    lensColor:   { r: 0.95, g: 0.95, b: 0.95, a: 0.06 }, // crystal clear
    frameColor:  { r: 0.07, g: 0.07, b: 0.09 },           // matte charcoal-black
    description: 'Bold charcoal D-frame with perfectly clear flat-top lenses.',
  },

];

export default TRY_ON_FRAMES;
