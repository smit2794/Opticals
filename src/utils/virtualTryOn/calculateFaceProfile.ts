import type { Landmark } from '../hooks/useFrameTracking';

export interface FaceProfile {
  eyeDistance: number;         // Normalized iris midpoint separation
  eyeWidth: number;            // Normalized average eye width
  noseBridgeWidth: number;     // Normalized nose bridge width
  noseBridgeHeight: number;    // Normalized vertical bridge depth
  noseBridgeAngle: number;     // Nose bridge slope angle
  templeWidth: number;         // Normalized temple-to-temple span
  faceWidth: number;           // Normalized jaw-to-jaw cheek width
  faceHeight: number;          // Normalized forehead-to-chin height
  faceDepth: number;           // Estimated face profile depth
  estimatedPD: number;         // Pupillary Distance in mm (usually 55-75mm)
  faceShape: 'oval' | 'round' | 'square' | 'rectangle' | 'heart' | 'diamond';
  templeArmLength: number;     // Target temple arm scale factor
}


// Distance helper in 3D
function dist3D(p1: Landmark, p2: Landmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Scans the 478 face landmarks to extract custom facial dimensions and classify face shape.
 */
export function calculateFaceProfile(landmarks: Landmark[]): FaceProfile | null {
  if (!landmarks || landmarks.length < 478) return null;

  // Key landmark mappings:
  // Iris centers: Left 468, Right 473
  const leftIris = landmarks[468];
  const rightIris = landmarks[473];

  // Eye corners:
  // Left eye corners: outer 33, inner 133
  // Right eye corners: inner 362, outer 263
  const leftEyeOuter = landmarks[33];
  const leftEyeInner = landmarks[133];
  const rightEyeInner = landmarks[362];
  const rightEyeOuter = landmarks[263];

  // Temples and boundaries
  const leftTemple = landmarks[234];
  const rightTemple = landmarks[454];
  
  // Jaw and checks
  const leftJaw = landmarks[58];
  const rightJaw = landmarks[288];
  
  // Heights
  const forehead = landmarks[10];
  const chin = landmarks[152];
  
  // Nose bridge
  const noseBridge = landmarks[168];
  const noseTip = landmarks[4];
  const noseLeft = landmarks[116];
  const noseRight = landmarks[345];

  if (
    !leftIris || !rightIris || 
    !leftEyeOuter || !leftEyeInner || !rightEyeInner || !rightEyeOuter ||
    !leftTemple || !rightTemple || !leftJaw || !rightJaw ||
    !forehead || !chin || !noseBridge || !noseTip || !noseLeft || !noseRight
  ) {
    return null;
  }

  // 1. Calculate basic normalized parameters
  const eyeDistance = dist3D(leftIris, rightIris);
  const leftEyeWidth = dist3D(leftEyeOuter, leftEyeInner);
  const rightEyeWidth = dist3D(rightEyeOuter, rightEyeInner);
  const eyeWidth = (leftEyeWidth + rightEyeWidth) / 2;

  const templeWidth = dist3D(leftTemple, rightTemple);
  const faceWidth = dist3D(leftJaw, rightJaw);
  const faceHeight = dist3D(forehead, chin);

  const noseBridgeWidth = dist3D(noseLeft, noseRight);
  const noseBridgeHeight = dist3D(noseBridge, noseTip);

  // Depth estimation: relative Z offset from nose bridge to the temple midpoint plane
  const templeMidZ = (leftTemple.z + rightTemple.z) / 2;
  const faceDepth = Math.abs(noseBridge.z - templeMidZ);

  // 2. Pupillary Distance (PD) in millimeters
  // Self-Calibrating Math: average human eye corner-to-corner width is 30mm.
  // We use this physical baseline to derive the pixel-to-millimeter scale factor.
  const pixelToMmScale = 30.0 / eyeWidth;
  let estimatedPD = eyeDistance * pixelToMmScale;
  
  // Clamp to realistic adult human boundaries (55mm to 75mm) to prevent anomalies
  estimatedPD = Math.max(55, Math.min(75, Math.round(estimatedPD * 10) / 10));

  // 3. Nose Slope Angle
  const noseBridgeAngle = Math.atan2(
    Math.abs(noseTip.z - noseBridge.z),
    Math.abs(noseTip.y - noseBridge.y)
  );

  // 4. Face Shape Classification (using ratios)
  const aspectWtoH = templeWidth / faceHeight;
  const jawToTempleRatio = faceWidth / templeWidth;
  const cheekToTempleRatio = dist3D(landmarks[127], landmarks[356]) / templeWidth;

  let faceShape: FaceProfile['faceShape'] = 'oval';

  if (aspectWtoH > 0.94) {
    // Wide/short face profile
    if (jawToTempleRatio > 0.88) {
      faceShape = 'square';
    } else {
      faceShape = 'round';
    }
  } else {
    // Tall/narrow face profile
    if (cheekToTempleRatio > 1.06) {
      faceShape = 'diamond';
    } else if (jawToTempleRatio < 0.74) {
      faceShape = 'heart';
    } else if (jawToTempleRatio > 0.84) {
      faceShape = 'rectangle';
    } else {
      faceShape = 'oval';
    }
  }

  // 5. Ear Position & Temple Arm Reach
  // We estimate this by scaling the relative depth of the face.
  // A deeper head requires longer temple arms on the 3D model.
  const templeArmLength = faceDepth * 12.0; // Scaled relative factor for Three.js geometry

  return {
    eyeDistance,
    eyeWidth,
    noseBridgeWidth,
    noseBridgeHeight,
    noseBridgeAngle,
    templeWidth,
    faceWidth,
    faceHeight,
    faceDepth,
    estimatedPD,
    faceShape,
    templeArmLength
  };
}

export interface FitAnalysis {
  userTempleWidthMm: number;
  userNoseBridgeWidthMm: number;
  frameWidthMm: number;
  widthMatchPercent: number;
  bridgeMatchPercent: number;
  fitScore: 'Excellent' | 'Good' | 'Average';
}

/**
 * Calculates physical frame fit metrics by using PD as a scale ruler.
 */
export function calculateFitAnalysis(
  profile: FaceProfile,
  frame: { lensWidth: number; bridgeWidth: number }
): FitAnalysis {
  // Use PD as the physical millimeter baseline ruler
  const scaleMm = profile.estimatedPD / (profile.eyeDistance || 0.05);
  const userTempleWidthMm = profile.templeWidth * scaleMm;
  
  // Upper nose bridge width estimation (average upper nose slope width is about 75% of bridge outer width)
  const userNoseBridgeWidthMm = profile.noseBridgeWidth * scaleMm * 0.75;

  // Frame width in mm: 2 * lensWidth + bridgeWidth
  const frameWidthMm = 2 * frame.lensWidth + frame.bridgeWidth;

  const widthDiff = Math.abs(frameWidthMm - userTempleWidthMm);
  const widthMatchPercent = Math.max(50, Math.min(100, Math.round(100 - (widthDiff / userTempleWidthMm) * 100)));

  const bridgeDiff = Math.abs(frame.bridgeWidth - userNoseBridgeWidthMm);
  const bridgeMatchPercent = Math.max(50, Math.min(100, Math.round(100 - (bridgeDiff / userNoseBridgeWidthMm) * 100)));

  // Calculate overall Fit Score based on width and bridge compatibility
  let fitScore: FitAnalysis['fitScore'] = 'Average';
  if (widthMatchPercent >= 94 && bridgeMatchPercent >= 92) {
    fitScore = 'Excellent';
  } else if (widthMatchPercent >= 88 && bridgeMatchPercent >= 85) {
    fitScore = 'Good';
  }

  return {
    userTempleWidthMm: Math.round(userTempleWidthMm * 10) / 10,
    userNoseBridgeWidthMm: Math.round(userNoseBridgeWidthMm * 10) / 10,
    frameWidthMm,
    widthMatchPercent,
    bridgeMatchPercent,
    fitScore,
  };
}
