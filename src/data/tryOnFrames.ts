// src/data/tryOnFrames.ts
// 3 custom try-on frames matching the reference images

export interface TryOnFrame {
  id: string;
  name: string;
  style: string;
  frameShape: string;
  // URL served from public/frames/ folder (available in both dev & prod)
  overlayImage: string;
  // DeepAR scale transform to morph the base 3D aviator model
  deepARScale: { x: number; y: number; z: number };
  // 3D Frame color (RGB)
  frameColor: { r: number; g: number; b: number };
  // 3D Lens color (RGB)
  lensColor: { r: number; g: number; b: number };
  // Lens tint opacity for 3D mode
  lensOpacity: number;
  description: string;
}

const TRY_ON_FRAMES: TryOnFrame[] = [
  {
    id: 'cateye',
    name: 'Cat-Eye',
    style: 'Bold & Dramatic',
    frameShape: 'cat-eye',
    overlayImage: '/frames/frame_cateye.png',
    deepARScale: { x: 1.40, y: 0.72, z: 0.90 },
    frameColor: { r: 0.1, g: 0.1, b: 0.1 }, // Black
    lensColor: { r: 1.0, g: 0.8, b: 0.8 }, // Light pink tint
    lensOpacity: 0.15,
    description: 'Upswept cat-eye frames for a bold, dramatic look',
  },
  {
    id: 'dframe',
    name: 'D-Frame',
    style: 'Strong & Classic',
    frameShape: 'square',
    overlayImage: '/frames/frame_dframe.png',
    deepARScale: { x: 1.10, y: 0.90, z: 0.92 },
    frameColor: { r: 0.25, g: 0.15, b: 0.05 }, // Brownish/Tortoise
    lensColor: { r: 1.0, g: 1.0, b: 0.8 }, // Yellowish tint
    lensOpacity: 0.15,
    description: 'Bold D-shaped square frames with a strong classic look',
  },
  {
    id: 'browline',
    name: 'Browline',
    style: 'Retro & Sophisticated',
    frameShape: 'browline',
    overlayImage: '/frames/frame_browline.png',
    deepARScale: { x: 1.05, y: 1.05, z: 1.05 },
    frameColor: { r: 0.1, g: 0.1, b: 0.15 }, // Dark navy/black
    lensColor: { r: 0.9, g: 0.9, b: 0.9 }, // Clear/greyish
    lensOpacity: 0.08,
    description: 'Classic clubmaster browline with half-rim design',
  },
  {
    id: 'round',
    name: 'Round',
    style: 'Vintage & Classic',
    frameShape: 'round',
    overlayImage: '/frames/frame_round.png',
    deepARScale: { x: 0.95, y: 1.05, z: 1.0 },
    frameColor: { r: 0.5, g: 0.5, b: 0.5 }, // Silver metal
    lensColor: { r: 0.6, g: 0.8, b: 1.0 }, // Light blue tint
    lensOpacity: 0.25,
    description: 'Classic vintage round frames with light blue tint',
  },
];

export default TRY_ON_FRAMES;
