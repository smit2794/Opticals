import { useState, useCallback, useRef } from 'react';
import { calculateEyeMidpointPosition } from '../utils/calculatePosition';
import type { Landmark } from '../utils/calculatePosition';
import { calculateRotation } from '../utils/calculateRotation';
import { calculateScale } from '../utils/calculateScale';

export interface TrackingState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isTracking: boolean;
  lensSpacingX: number;     // Dynamic horizontal spacing of lenses
  bridgeYOffset: number;    // Dynamic vertical bridge offset
  lensHeightScale: number;  // Dynamic vertical scale factor for the lens/rims
}

// Distance helper in 3D
function dist3D(p1: Landmark, p2: Landmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Custom hook to process face mesh landmarks and calculate smoothed 3D transforms.
 */
export function useFrameTracking() {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    isTracking: false,
    lensSpacingX: 0.36,
    bridgeYOffset: 0.0,
    lensHeightScale: 1.0,
  });

  // Track previous values in refs to perform interpolation
  const prevPositionRef = useRef<[number, number, number]>([0, 0, 0]);
  const prevRotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const prevScaleRef = useRef<[number, number, number]>([1, 1, 1]);
  
  // Refs for tracking dynamic parameters
  const prevLensSpacingRef = useRef<number>(0.36);
  const prevBridgeYRef = useRef<number>(0.0);
  const prevLensHeightScaleRef = useRef<number>(1.0);

  const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
  };

  const processLandmarks = useCallback((
    multiFaceLandmarks: Landmark[][],
    viewport: { width: number; height: number }
  ) => {
    if (!multiFaceLandmarks || multiFaceLandmarks.length === 0) {
      setTrackingState(prev => {
        if (prev.isTracking) {
          return { ...prev, isTracking: false };
        }
        return prev;
      });
      return;
    }

    const landmarks = multiFaceLandmarks[0];
    
    // Core landmark indices:
    // Nose Bridge (168)
    // Left Temple (234)
    // Right Temple (454)
    // Nose Tip (4)
    // Forehead (10)
    // Chin (152)
    // Left Iris (468)
    // Right Iris (473)
    const noseBridge = landmarks[168];
    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];
    const noseTip = landmarks[4];
    const forehead = landmarks[10];
    const chin = landmarks[152];
    
    // Asymmetry and pupil anchors
    // Fallback to eye corners if iris is unavailable
    const leftIris = landmarks[468] || {
      x: (landmarks[33].x + landmarks[133].x) / 2,
      y: (landmarks[33].y + landmarks[133].y) / 2,
      z: (landmarks[33].z + landmarks[133].z) / 2,
    };
    const rightIris = landmarks[473] || {
      x: (landmarks[362].x + landmarks[263].x) / 2,
      y: (landmarks[362].y + landmarks[263].y) / 2,
      z: (landmarks[362].z + landmarks[263].z) / 2,
    };

    if (!leftIris || !rightIris || !noseBridge || !leftTemple || !rightTemple || !noseTip || !forehead || !chin) {
      setTrackingState(prev => {
        if (prev.isTracking) {
          return { ...prev, isTracking: false };
        }
        return prev;
      });
      return;
    }

    // 1. Calculate raw transformation matrices in 3D
    // Position is anchored to the eye midpoint
    const rawPos = calculateEyeMidpointPosition(leftIris, rightIris, viewport, 1.25);
    const rawRot = calculateRotation(leftTemple, rightTemple, noseBridge, noseTip, leftIris, rightIris);
    const rawScale = calculateScale(leftTemple, rightTemple, viewport, 0.98);

    // 2. Adaptive temporal smoothing (velocity-sensitive lerp factor)
    const posDiff = Math.sqrt(
      Math.pow(rawPos[0] - prevPositionRef.current[0], 2) +
      Math.pow(rawPos[1] - prevPositionRef.current[1], 2) +
      Math.pow(rawPos[2] - prevPositionRef.current[2], 2)
    );
    const rotDiff = Math.sqrt(
      Math.pow(rawRot[0] - prevRotationRef.current[0], 2) +
      Math.pow(rawRot[1] - prevRotationRef.current[1], 2) +
      Math.pow(rawRot[2] - prevRotationRef.current[2], 2)
    );
    const scaleDiff = Math.abs(rawScale[0] - prevScaleRef.current[0]);

    // Adaptive factors: range from heavy smoothing on static face to responsive on movement
    const adaptivePosLerp = Math.min(0.65, Math.max(0.04, posDiff * 4.5));
    const adaptiveRotLerp = Math.min(0.60, Math.max(0.04, rotDiff * 3.5));
    const adaptiveScaleLerp = Math.min(0.50, Math.max(0.03, scaleDiff * 5.0));

    const smoothedPos: [number, number, number] = [
      lerp(prevPositionRef.current[0], rawPos[0], adaptivePosLerp),
      lerp(prevPositionRef.current[1], rawPos[1], adaptivePosLerp),
      lerp(prevPositionRef.current[2], rawPos[2], adaptivePosLerp)
    ];

    const smoothedRot: [number, number, number] = [
      lerp(prevRotationRef.current[0], rawRot[0], adaptiveRotLerp),
      lerp(prevRotationRef.current[1], rawRot[1], adaptiveRotLerp),
      lerp(prevRotationRef.current[2], rawRot[2], adaptiveRotLerp)
    ];

    const smoothedScale: [number, number, number] = [
      lerp(prevScaleRef.current[0], rawScale[0], adaptiveScaleLerp),
      lerp(prevScaleRef.current[1], rawScale[1], adaptiveScaleLerp),
      lerp(prevScaleRef.current[2], rawScale[2], adaptiveScaleLerp)
    ];

    // 3. Dynamic Fitting Corrections (Pupil Distance, Nose Bridge Y, Lens Height)
    const eyeDistance3D = dist3D(leftIris, rightIris);
    const templeWidth3D = dist3D(leftTemple, rightTemple);
    
    // Lens Spacing X
    const rawLensSpacing = Math.max(0.28, Math.min(0.42, (eyeDistance3D / (templeWidth3D || 1.0)) * 0.64));
    
    // Vertical Fitting Bridge Y Offset
    const eyeMidpointY = (leftIris.y + rightIris.y) / 2;
    const yNoseThree = -(noseBridge.y - 0.5) * viewport.height;
    const yEyeThree = -(eyeMidpointY - 0.5) * viewport.height;
    const rawBridgeY = Math.max(-0.15, Math.min(0.05, (yNoseThree - yEyeThree) / (smoothedScale[1] || 1.0)));

    // Lens Height Scale
    const faceHeight3D = dist3D(forehead, chin);
    const rawLensHeightScale = Math.max(0.9, Math.min(1.1, (faceHeight3D / (templeWidth3D || 1.0)) * 0.85));

    // Smooth fitting variables to prevent geometric jumping
    const smoothedLensSpacing = lerp(prevLensSpacingRef.current, rawLensSpacing, 0.1);
    const smoothedBridgeY = lerp(prevBridgeYRef.current, rawBridgeY, 0.1);
    const smoothedLensHeightScale = lerp(prevLensHeightScaleRef.current, rawLensHeightScale, 0.1);

    // 4. Save current smoothed values for next loop iteration
    prevPositionRef.current = smoothedPos;
    prevRotationRef.current = smoothedRot;
    prevScaleRef.current = smoothedScale;
    prevLensSpacingRef.current = smoothedLensSpacing;
    prevBridgeYRef.current = smoothedBridgeY;
    prevLensHeightScaleRef.current = smoothedLensHeightScale;

    setTrackingState({
      position: smoothedPos,
      rotation: smoothedRot,
      scale: smoothedScale,
      isTracking: true,
      lensSpacingX: smoothedLensSpacing,
      bridgeYOffset: smoothedBridgeY,
      lensHeightScale: smoothedLensHeightScale,
    });
  }, []);

  return { trackingState, processLandmarks };
}
export type { Landmark };
