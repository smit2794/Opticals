import type { Landmark } from './calculatePosition';

/**
 * Calculates the Euler rotation angles (Pitch, Yaw, Roll) in radians.
 * 
 * @param leftTemple Landmark for left temple (234).
 * @param rightTemple Landmark for right temple (454).
 * @param noseBridge Landmark for bridge of the nose (168).
 * @param noseTip Landmark for nose tip (4).
 */
export function calculateRotation(
  leftTemple: Landmark,
  rightTemple: Landmark,
  noseBridge: Landmark,
  noseTip: Landmark,
  leftIris?: Landmark,
  rightIris?: Landmark
): [number, number, number] {
  // 1. Roll (Rotation around Z-axis - head tilt left/right)
  // We combine the eye tilt (75% weight) and the temple tilt (25% weight)
  // to compensate for facial asymmetry while sitting naturally.
  const templeRoll = -Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x);
  let roll = templeRoll;

  if (leftIris && rightIris) {
    const eyeRoll = -Math.atan2(rightIris.y - leftIris.y, rightIris.x - leftIris.x);
    roll = eyeRoll * 0.75 + templeRoll * 0.25;
  }

  // 2. Yaw (Rotation around Y-axis - head turn left/right)
  // Calculated using the horizontal ratio of the nose tip relative to the temples.
  // This is mathematically exact for a cylinder/sphere rotation projection and avoids noisy Z depth.
  const templeWidth = leftTemple.x - rightTemple.x;
  const noseRatio = templeWidth > 0 ? (noseTip.x - rightTemple.x) / templeWidth : 0.5;
  const yaw = Math.atan(2 * noseRatio - 1) * 1.15; // 1.15 is a calibration factor to match screen perspective

  // 3. Pitch (Rotation around X-axis - head nod up/down)
  // Calculated by the angle in the YZ plane between the nose bridge and the nose tip.
  // We subtract a calibration factor (base angle) representing the nose angle when looking straight.
  const basePitchOffset = -0.55; // Calibrated offset for straight-facing gaze
  const pitch = Math.atan2(noseTip.z - noseBridge.z, noseTip.y - noseBridge.y) - basePitchOffset;

  return [pitch, yaw, roll];
}
