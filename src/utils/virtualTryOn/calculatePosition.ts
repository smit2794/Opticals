export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates the 3D position of the glasses anchor (nose bridge) in Three.js space.
 * 
 * @param noseBridge The landmark corresponding to the bridge of the nose (168).
 * @param viewport The current viewport dimensions in Three.js units.
 * @param zScaleFactor Multiplier to scale the relative Z coordinate to match screen space.
 */
export function calculatePosition(
  noseBridge: Landmark,
  viewport: { width: number; height: number },
  zScaleFactor: number = 1.0
): [number, number, number] {
  // Convert from normalized [0, 1] coordinate space to Three.js [-width/2, width/2]
  const x = (noseBridge.x - 0.5) * viewport.width;
  const y = -(noseBridge.y - 0.5) * viewport.height;
  
  // MediaPipe Z is normalized and relative to face size (positive is away, negative is closer).
  // We scale this to position the glasses in the correct depth plane.
  const z = -noseBridge.z * viewport.width * zScaleFactor;

  return [x, y, z];
}

/**
 * Calculates the Three.js coordinate position of the Eye Center Midpoint.
 */
export function calculateEyeMidpointPosition(
  leftIris: Landmark,
  rightIris: Landmark,
  viewport: { width: number; height: number },
  zScaleFactor: number = 1.25
): [number, number, number] {
  const midX = (leftIris.x + rightIris.x) / 2;
  const midY = (leftIris.y + rightIris.y) / 2;
  const midZ = (leftIris.z + rightIris.z) / 2;

  const x = (midX - 0.5) * viewport.width;
  const y = -(midY - 0.5) * viewport.height;
  const z = -midZ * viewport.width * zScaleFactor;

  return [x, y, z];
}
