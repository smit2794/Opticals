import type { Landmark } from './calculatePosition';

/**
 * Calculates the scale vector for the glasses based on face width (distance between temples).
 * 
 * @param leftTemple Landmark for left temple (234).
 * @param rightTemple Landmark for right temple (454).
 * @param viewport The current viewport dimensions in Three.js units.
 * @param baseScale Calibration scale factor for glasses fit.
 */
export function calculateScale(
  leftTemple: Landmark,
  rightTemple: Landmark,
  viewport: { width: number; height: number },
  baseScale: number = 0.95
): [number, number, number] {
  // Convert temple coordinates to viewport scale
  const dx = (leftTemple.x - rightTemple.x) * viewport.width;
  const dy = (leftTemple.y - rightTemple.y) * viewport.height;
  const dz = (leftTemple.z - rightTemple.z) * viewport.width;

  // Calculate Euclidean distance in 3D space
  const faceWidth3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Return scale. Assuming a base 3D glasses model has a width of approximately 1.0 unit.
  const scaleVal = faceWidth3D * baseScale;
  
  return [scaleVal, scaleVal, scaleVal];
}
