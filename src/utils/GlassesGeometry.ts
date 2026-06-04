// src/utils/GlassesGeometry.ts
// Generates unique Three.js 3D glasses geometry for every frame shape.
// All frames use lens centres at x = ±0.65, y = 0.
// Scale the returned Group by (ipdPixels / 1.3) in the render loop.

import * as THREE from 'three';
import type { TryOnFrame } from '../data/tryOnFrames';

// ─── Helpers ───────────────────────────────────────────────────────────────

function toColor(r: number, g: number, b: number) {
  return new THREE.Color(r, g, b);
}

function frameMaterial(fc: { r: number; g: number; b: number }, shininess = 120) {
  return new THREE.MeshPhongMaterial({
    color: toColor(fc.r, fc.g, fc.b),
    shininess,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });
}

function lensMaterial(lc: { r: number; g: number; b: number; a: number }) {
  return new THREE.MeshPhongMaterial({
    color: toColor(lc.r, lc.g, lc.b),
    transparent: true,
    opacity: lc.a,
    side: THREE.DoubleSide,
    shininess: 200,
    specular: new THREE.Color(1, 1, 1),
  });
}

const EXTRUDE_OPTS = (depth: number, bevel = 0.008): THREE.ExtrudeGeometryOptions => ({
  depth,
  bevelEnabled: true,
  bevelThickness: bevel,
  bevelSize: bevel,
  bevelSegments: 3,
});

function mirrorMesh(mesh: THREE.Mesh): THREE.Mesh {
  const m = mesh.clone();
  m.scale.x = -1;
  m.rotation.z = -mesh.rotation.z * 2; // compensate for any rotation
  return m;
}

// Temple arm helper
function addTemples(
  group: THREE.Group,
  mat: THREE.Material,
  lensHalfW: number,
  ipdHalf: number,
  templeY: number,
  height: number,
  depth: number,
) {
  const len = 0.70;
  const tGeo = new THREE.BoxGeometry(len, height, depth);
  const lT = new THREE.Mesh(tGeo, mat);
  lT.position.set(-(ipdHalf + lensHalfW + len / 2), templeY, 0);
  const rT = lT.clone();
  rT.position.x = +(ipdHalf + lensHalfW + len / 2);
  group.add(lT, rT);
}

// Bridge helper
function addBridge(
  group: THREE.Group,
  mat: THREE.Material,
  ipdHalf: number,
  lensHalfW: number,
  y: number,
  bW: number,
  bH: number,
  bD: number,
) {
  const gap = ipdHalf * 2 - lensHalfW * 2;
  const bGeo = new THREE.BoxGeometry(Math.max(gap, 0.08), bH, bD);
  const bMesh = new THREE.Mesh(bGeo, mat);
  bMesh.position.set(0, y, 0);
  group.add(bMesh);
}

// ─── Shape builders ────────────────────────────────────────────────────────

/** Rounded rectangle with optional taper (for wayfarer/square) */
function roundedRectShape(w: number, h: number, fw: number, taper = 0): THREE.Shape {
  const topW = w;
  const botW = w * (1 - taper);
  const r = 0.10 * w;

  const outer = new THREE.Shape();
  outer.moveTo(-botW / 2 + r, -h / 2);
  outer.lineTo(botW / 2 - r, -h / 2);
  outer.quadraticCurveTo(botW / 2, -h / 2, botW / 2, -h / 2 + r);
  outer.lineTo(topW / 2, h / 2 - r);
  outer.quadraticCurveTo(topW / 2, h / 2, topW / 2 - r, h / 2);
  outer.lineTo(-topW / 2 + r, h / 2);
  outer.quadraticCurveTo(-topW / 2, h / 2, -topW / 2, h / 2 - r);
  outer.lineTo(-botW / 2, -h / 2 + r);
  outer.quadraticCurveTo(-botW / 2, -h / 2, -botW / 2 + r, -h / 2);

  const iw = w - 2 * fw;
  const ih = h - 2 * fw;
  const itopW = iw;
  const ibotW = iw * (1 - taper);
  const ir = 0.10 * iw;

  const hole = new THREE.Path();
  hole.moveTo(-ibotW / 2 + ir, -ih / 2);
  hole.lineTo(ibotW / 2 - ir, -ih / 2);
  hole.quadraticCurveTo(ibotW / 2, -ih / 2, ibotW / 2, -ih / 2 + ir);
  hole.lineTo(itopW / 2, ih / 2 - ir);
  hole.quadraticCurveTo(itopW / 2, ih / 2, itopW / 2 - ir, ih / 2);
  hole.lineTo(-itopW / 2 + ir, ih / 2);
  hole.quadraticCurveTo(-itopW / 2, ih / 2, -itopW / 2, ih / 2 - ir);
  hole.lineTo(-ibotW / 2, -ih / 2 + ir);
  hole.quadraticCurveTo(-ibotW / 2, -ih / 2, -ibotW / 2 + ir, -ih / 2);
  outer.holes.push(hole);
  return outer;
}

function roundedRectInner(w: number, h: number, fw: number, taper = 0): THREE.Shape {
  const iw = w - 2 * fw - 0.004;
  const ih = h - 2 * fw - 0.004;
  const itopW = iw;
  const ibotW = iw * (1 - taper);
  const ir = 0.10 * iw;
  const shape = new THREE.Shape();
  shape.moveTo(-ibotW / 2 + ir, -ih / 2);
  shape.lineTo(ibotW / 2 - ir, -ih / 2);
  shape.quadraticCurveTo(ibotW / 2, -ih / 2, ibotW / 2, -ih / 2 + ir);
  shape.lineTo(itopW / 2, ih / 2 - ir);
  shape.quadraticCurveTo(itopW / 2, ih / 2, itopW / 2 - ir, ih / 2);
  shape.lineTo(-itopW / 2 + ir, ih / 2);
  shape.quadraticCurveTo(-itopW / 2, ih / 2, -itopW / 2, ih / 2 - ir);
  shape.lineTo(-ibotW / 2, -ih / 2 + ir);
  shape.quadraticCurveTo(-ibotW / 2, -ih / 2, -ibotW / 2 + ir, -ih / 2);
  return shape;
}

function circleRingShape(outerR: number, fw: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, outerR - fw, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function circleInner(outerR: number, fw: number): THREE.Shape {
  const r = outerR - fw - 0.003;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, r, 0, Math.PI * 2, false);
  return shape;
}

/** Cat-eye: outer corners swept UP */
function catEyeShape(w: number, h: number, fw: number): THREE.Shape {
  const r = 0.08 * w;
  const sweep = h * 0.25; // how much outer top corners rise

  const outer = new THREE.Shape();
  outer.moveTo(-w / 2 + r, -h / 2);           // bottom-left
  outer.lineTo(w / 2 - r, -h / 2);            // bottom-right
  outer.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  outer.lineTo(w / 2, h / 2 + sweep - r);     // right side (tall)
  outer.quadraticCurveTo(w / 2, h / 2 + sweep, w / 2 - r, h / 2 + sweep);
  outer.lineTo(-w / 2 + r, h / 2);            // top (left side lower)
  outer.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  outer.lineTo(-w / 2, -h / 2 + r);
  outer.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const iw = w - 2 * fw;
  const ih = h - 2 * fw;
  const ir = 0.08 * iw;
  const isweep = sweep * 0.8;

  const hole = new THREE.Path();
  hole.moveTo(-iw / 2 + ir, -ih / 2);
  hole.lineTo(iw / 2 - ir, -ih / 2);
  hole.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
  hole.lineTo(iw / 2, ih / 2 + isweep - ir);
  hole.quadraticCurveTo(iw / 2, ih / 2 + isweep, iw / 2 - ir, ih / 2 + isweep);
  hole.lineTo(-iw / 2 + ir, ih / 2);
  hole.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - ir);
  hole.lineTo(-iw / 2, -ih / 2 + ir);
  hole.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);
  outer.holes.push(hole);
  return outer;
}

function catEyeInner(w: number, h: number, fw: number): THREE.Shape {
  const iw = w - 2 * fw - 0.004;
  const ih = h - 2 * fw - 0.004;
  const ir = 0.08 * iw;
  const sweep = h * 0.25 * 0.8;
  const shape = new THREE.Shape();
  shape.moveTo(-iw / 2 + ir, -ih / 2);
  shape.lineTo(iw / 2 - ir, -ih / 2);
  shape.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
  shape.lineTo(iw / 2, ih / 2 + sweep - ir);
  shape.quadraticCurveTo(iw / 2, ih / 2 + sweep, iw / 2 - ir, ih / 2 + sweep);
  shape.lineTo(-iw / 2 + ir, ih / 2);
  shape.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - ir);
  shape.lineTo(-iw / 2, -ih / 2 + ir);
  shape.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);
  return shape;
}

/** Teardrop aviator: wider at top, curved to point at bottom */
function aviatorShape(w: number, h: number, fw: number): THREE.Shape {
  const outer = new THREE.Shape();
  outer.moveTo(0, -h / 2); // bottom tip
  outer.bezierCurveTo(
    w / 2, -h / 2,
    w / 2, -h / 4,
    w / 2, h / 4,
  );
  outer.bezierCurveTo(w / 2, h / 2, w / 4, h / 2, 0, h / 2);
  outer.bezierCurveTo(-w / 4, h / 2, -w / 2, h / 2, -w / 2, h / 4);
  outer.bezierCurveTo(-w / 2, -h / 4, -w / 2, -h / 2, 0, -h / 2);

  const iw = w - 2 * fw;
  const ih = h - 2 * fw;

  const hole = new THREE.Path();
  hole.moveTo(0, -ih / 2);
  hole.bezierCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 4, iw / 2, ih / 4);
  hole.bezierCurveTo(iw / 2, ih / 2, iw / 4, ih / 2, 0, ih / 2);
  hole.bezierCurveTo(-iw / 4, ih / 2, -iw / 2, ih / 2, -iw / 2, ih / 4);
  hole.bezierCurveTo(-iw / 2, -ih / 4, -iw / 2, -ih / 2, 0, -ih / 2);
  outer.holes.push(hole);
  return outer;
}

function aviatorInner(w: number, h: number, fw: number): THREE.Shape {
  const iw = w - 2 * fw - 0.004;
  const ih = h - 2 * fw - 0.004;
  const shape = new THREE.Shape();
  shape.moveTo(0, -ih / 2);
  shape.bezierCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 4, iw / 2, ih / 4);
  shape.bezierCurveTo(iw / 2, ih / 2, iw / 4, ih / 2, 0, ih / 2);
  shape.bezierCurveTo(-iw / 4, ih / 2, -iw / 2, ih / 2, -iw / 2, ih / 4);
  shape.bezierCurveTo(-iw / 2, -ih / 4, -iw / 2, -ih / 2, 0, -ih / 2);
  return shape;
}

/** Hexagonal shape */
function hexShape(r: number, fw: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const ir = r - fw;
  const hole = new THREE.Path();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = ir * Math.cos(angle);
    const y = ir * Math.sin(angle);
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}

function hexInner(r: number, fw: number): THREE.Shape {
  const ir = r - fw - 0.003;
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    if (i === 0) shape.moveTo(ir * Math.cos(a), ir * Math.sin(a));
    else shape.lineTo(ir * Math.cos(a), ir * Math.sin(a));
  }
  shape.closePath();
  return shape;
}

/** Oval: ellipse ring */
function ovalShape(rX: number, rY: number, fw: number): THREE.Shape {
  const segs = 64;
  const outer = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = (Math.PI * 2 * i) / segs;
    const x = rX * Math.cos(a);
    const y = rY * Math.sin(a);
    if (i === 0) outer.moveTo(x, y);
    else outer.lineTo(x, y);
  }
  const irX = rX - fw;
  const irY = rY - fw;
  const hole = new THREE.Path();
  for (let i = 0; i <= segs; i++) {
    const a = (Math.PI * 2 * i) / segs;
    const x = irX * Math.cos(a);
    const y = irY * Math.sin(a);
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  outer.holes.push(hole);
  return outer;
}

function ovalInner(rX: number, rY: number, fw: number): THREE.Shape {
  const segs = 64;
  const irX = rX - fw - 0.003;
  const irY = rY - fw - 0.003;
  const shape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = (Math.PI * 2 * i) / segs;
    if (i === 0) shape.moveTo(irX * Math.cos(a), irY * Math.sin(a));
    else shape.lineTo(irX * Math.cos(a), irY * Math.sin(a));
  }
  return shape;
}

// ─── Assembly helpers ──────────────────────────────────────────────────────

function addLensPair(
  group: THREE.Group,
  ipdHalf: number,
  frameShape: THREE.Shape,
  innerShape: THREE.Shape,
  fMat: THREE.Material,
  lMat: THREE.Material,
  extrudeOpts: THREE.ExtrudeGeometryOptions,
  offsetY = 0,
) {
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, extrudeOpts);
  const lensGeo = new THREE.ShapeGeometry(innerShape, 48);

  const leftFrame = new THREE.Mesh(frameGeo, fMat);
  leftFrame.position.set(-ipdHalf, offsetY, -extrudeOpts.depth! / 2);

  const rightFrame = new THREE.Mesh(frameGeo, fMat);
  rightFrame.position.set(+ipdHalf, offsetY, -extrudeOpts.depth! / 2);
  rightFrame.scale.x = -1; // mirror

  const leftLens = new THREE.Mesh(lensGeo, lMat);
  leftLens.position.set(-ipdHalf, offsetY, 0.002);

  const rightLens = new THREE.Mesh(lensGeo, lMat);
  rightLens.position.set(+ipdHalf, offsetY, 0.002);

  group.add(leftFrame, rightFrame, leftLens, rightLens);
}

// ─── Per-shape builders ────────────────────────────────────────────────────

// 1. WAYFARER ─────────────────────────────────────────────────────────────
// Wide trapezoidal, thick navy frame, peach-pink tinted lenses
function buildWayfarer(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const W = 0.56, H = 0.42, FT = 0.075, ED = 0.06;
  const TAPER = 0.06;

  const fMat = frameMaterial(frame.frameColor, 110);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = roundedRectShape(W, H, FT, TAPER);
  const iShape = roundedRectInner(W, H, FT, TAPER);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED));

  // Thick top bar
  const barGeo = new THREE.BoxGeometry(IPD - W * 0.6, FT * 0.9, ED * 0.9);
  const bar = new THREE.Mesh(barGeo, fMat);
  bar.position.set(0, H / 2 - FT * 0.3, 0);
  group.add(bar);

  addBridge(group, fMat, IPD / 2, W / 2, H * 0.1, 0.06, FT * 0.55, ED * 0.6);
  addTemples(group, fMat, W / 2, IPD / 2, H * 0.1, FT * 0.42, ED * 0.5);
  return group;
}

// 2. ROUND ────────────────────────────────────────────────────────────────
// Perfect circles, thin navy metal, sky-blue tint
function buildRound(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const R = 0.42, FT = 0.055, ED = 0.045;

  const fMat = frameMaterial(frame.frameColor, 150);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = circleRingShape(R, FT);
  const iShape = circleInner(R, FT);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED));

  // Thin wire bridge (cylinder-like box)
  const bGeo = new THREE.BoxGeometry(IPD - R * 2 + FT * 0.5, FT * 0.5, ED * 0.7);
  const b = new THREE.Mesh(bGeo, fMat);
  b.position.set(0, 0, 0);
  group.add(b);

  addTemples(group, fMat, R, IPD / 2, 0, FT * 0.35, ED * 0.6);
  return group;
}

// 3. CAT-EYE ──────────────────────────────────────────────────────────────
// Upswept outer corners, thick gloss black, dark smoke lenses
function buildCatEye(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const W = 0.54, H = 0.40, FT = 0.078, ED = 0.065;

  const fMat = frameMaterial(frame.frameColor, 90);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = catEyeShape(W, H, FT);
  const iShape = catEyeInner(W, H, FT);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED));

  addBridge(group, fMat, IPD / 2, W / 2, H * 0.05, 0.06, FT * 0.55, ED * 0.6);
  addTemples(group, fMat, W / 2, IPD / 2, H * 0.15, FT * 0.45, ED * 0.55);
  return group;
}

// 4. AVIATOR ──────────────────────────────────────────────────────────────
// Teardrop, thin gold wire, olive-green tint
function buildAviator(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const W = 0.52, H = 0.50, FT = 0.042, ED = 0.040;

  const fMat = frameMaterial(frame.frameColor, 200);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = aviatorShape(W, H, FT);
  const iShape = aviatorInner(W, H, FT);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED, 0.004));

  // Double bridge bar
  for (const y of [H * 0.15, H * 0.25]) {
    addBridge(group, fMat, IPD / 2, W / 2, y, 0.04, FT * 0.6, ED * 0.8);
  }
  addTemples(group, fMat, W / 2, IPD / 2, H * 0.15, FT * 0.38, ED * 0.7);
  return group;
}

// 5. BROWLINE ─────────────────────────────────────────────────────────────
// Full thick brow top, thin wire bottom — warm brown-black
function buildBrowline(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const W = 0.54, H = 0.44, FT_TOP = 0.10, FT_BOT = 0.028, ED = 0.055;

  const fMat = frameMaterial(frame.frameColor, 100);
  const wireMat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0.75, 0.75, 0.8),
    shininess: 250,
    specular: new THREE.Color(1, 1, 1),
  });
  const lMat = lensMaterial(frame.lensColor);

  // Top brow bar (thick)
  const browShape = roundedRectShape(W, FT_TOP * 1.2, FT_TOP * 1.2 * 0.15, 0);
  const browGeo = new THREE.ExtrudeGeometry(browShape, EXTRUDE_OPTS(ED));
  for (const sx of [-IPD / 2, IPD / 2]) {
    const m = new THREE.Mesh(browGeo, fMat);
    m.position.set(sx, H / 2 - FT_TOP * 0.6, -ED / 2);
    if (sx > 0) m.scale.x = -1;
    group.add(m);
  }

  // Bottom wire ring (thin)
  for (const sx of [-IPD / 2, IPD / 2]) {
    const halfW2 = W / 2 - 0.002;
    const halfH2 = H / 2 - FT_TOP * 0.5;
    // Semicircle bottom path
    const seg = 32;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= seg; i++) {
      const a = Math.PI + (Math.PI * i) / seg;
      pts.push(new THREE.Vector3(halfW2 * Math.cos(a), halfH2 * Math.sin(a), 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, FT_BOT * 0.5, 6, false);
    const tube = new THREE.Mesh(tubeGeo, wireMat);
    tube.position.set(sx, H * 0.05, 0);
    group.add(tube);
  }

  // Lens tint (lower half only)
  const lensShape = roundedRectInner(W, H - FT_TOP * 1.2, 0.005, 0);
  const lensGeo = new THREE.ShapeGeometry(lensShape, 48);
  for (const sx of [-IPD / 2, IPD / 2]) {
    const lm = new THREE.Mesh(lensGeo, lMat);
    lm.position.set(sx, -FT_TOP * 0.35, 0.003);
    group.add(lm);
  }

  addBridge(group, wireMat, IPD / 2, W / 2, H * 0.12, 0.05, FT_BOT * 1.2, ED * 0.5);
  addTemples(group, fMat, W / 2, IPD / 2, H * 0.2, FT_TOP * 0.35, ED * 0.6);
  return group;
}

// 6. HEXAGONAL ────────────────────────────────────────────────────────────
// 6-sided, thin rose-gold metal, blush-peach tint
function buildHexagonal(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const R = 0.42, FT = 0.042, ED = 0.038;

  const fMat = frameMaterial(frame.frameColor, 200);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = hexShape(R, FT);
  const iShape = hexInner(R, FT);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED, 0.004));

  const bGeo = new THREE.BoxGeometry(IPD - R * 2 + FT, FT * 0.55, ED * 0.8);
  group.add(Object.assign(new THREE.Mesh(bGeo, fMat), { position: new THREE.Vector3(0, 0, 0) }));
  addTemples(group, fMat, R, IPD / 2, 0, FT * 0.38, ED * 0.65);
  return group;
}

// 7. OVAL ─────────────────────────────────────────────────────────────────
// Wide ellipse, thick tortoiseshell, warm amber tint
function buildOval(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const RX = 0.50, RY = 0.38, FT = 0.072, ED = 0.062;

  const fMat = frameMaterial(frame.frameColor, 80);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = ovalShape(RX, RY, FT);
  const iShape = ovalInner(RX, RY, FT);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED));

  addBridge(group, fMat, IPD / 2, RX, RY * 0.2, 0.06, FT * 0.55, ED * 0.7);
  addTemples(group, fMat, RX, IPD / 2, RY * 0.1, FT * 0.40, ED * 0.6);
  return group;
}

// 8. SQUARE / D-FRAME ─────────────────────────────────────────────────────
// Flat-top rectangle, thick charcoal, clear lenses
function buildSquare(frame: TryOnFrame): THREE.Group {
  const group = new THREE.Group();
  const IPD = 1.30;
  const W = 0.56, H = 0.44, FT = 0.072, ED = 0.065;

  const fMat = frameMaterial(frame.frameColor, 100);
  const lMat = lensMaterial(frame.lensColor);

  const fShape = roundedRectShape(W, H, FT, 0);
  const iShape = roundedRectInner(W, H, FT, 0);
  addLensPair(group, IPD / 2, fShape, iShape, fMat, lMat, EXTRUDE_OPTS(ED));

  addBridge(group, fMat, IPD / 2, W / 2, H * 0.08, 0.06, FT * 0.6, ED * 0.8);
  addTemples(group, fMat, W / 2, IPD / 2, H * 0.08, FT * 0.42, ED * 0.6);
  return group;
}

// ─── Public factory ────────────────────────────────────────────────────────

export function createGlassesGroup(frame: TryOnFrame): THREE.Group {
  switch (frame.frameShape) {
    case 'wayfarer':  return buildWayfarer(frame);
    case 'round':     return buildRound(frame);
    case 'cat-eye':   return buildCatEye(frame);
    case 'aviator':   return buildAviator(frame);
    case 'browline':  return buildBrowline(frame);
    case 'hexagonal': return buildHexagonal(frame);
    case 'oval':      return buildOval(frame);
    case 'square':    return buildSquare(frame);
    default:          return buildRound(frame);
  }
}

/** IPD distance between the two lens centres in the geometry (constant 1.30). */
export const GEOMETRY_IPD = 1.30;
