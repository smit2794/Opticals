import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { TrackingState } from '../hooks/useFrameTracking';
import { FrameLoader } from '../services/frameLoader';

interface GlassesRendererProps {
  trackingState: TrackingState;
  frameId: string;
  shape: 'aviator' | 'round' | 'rectangle' | 'cateye' | 'wayfarer' | 'rimless';
  colorHex: string;
}

// 3D Scene Controller that manages camera sync and smooth mesh movement
const GlassesScene: React.FC<GlassesRendererProps> = ({ trackingState, frameId, shape, colorHex }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth the movement in the Three.js loop to ensure fluid transitions at 60 FPS
  useFrame(() => {
    if (!groupRef.current) return;

    if (trackingState.isTracking) {
      groupRef.current.visible = true;

      // 1. Interpolate position (Lerp)
      const targetPos = trackingState.position;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPos[0], 0.48);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPos[1], 0.48);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPos[2], 0.48);

      // 2. Interpolate scale (Lerp)
      const targetScale = trackingState.scale;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale[0], 0.48);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale[1], 0.48);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale[2], 0.48);

      // 3. Interpolate rotation using Quaternions for seamless 3D tilting (Slerp)
      const targetEuler = new THREE.Euler(
        trackingState.rotation[0],
        trackingState.rotation[1],
        trackingState.rotation[2],
        'XYZ'
      );
      const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
      groupRef.current.quaternion.slerp(targetQuat, 0.48);
    } else {
      // Hide the glasses if face is not actively tracked
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      {/* GLTF Frame loader with high-quality procedural fallback */}
      <FrameLoader
        frameId={frameId}
        shape={shape}
        colorHex={colorHex}
        lensSpacingX={trackingState.lensSpacingX}
        bridgeYOffset={trackingState.bridgeYOffset}
        lensHeightScale={trackingState.lensHeightScale}
      />
    </group>
  );
};

// Viewport-aware component to feed current viewport dimensions to tracking calculations
interface ViewportListenerProps {
  onViewportChange: (viewport: { width: number; height: number }) => void;
}

const ViewportListener: React.FC<ViewportListenerProps> = ({ onViewportChange }) => {
  const { viewport } = useThree();
  
  useEffect(() => {
    onViewportChange({ width: viewport.width, height: viewport.height });
  }, [viewport.width, viewport.height, onViewportChange]);

  return null;
};

interface GlassesRendererContainerProps extends GlassesRendererProps {
  onViewportChange: (viewport: { width: number; height: number }) => void;
}

export const GlassesRenderer: React.FC<GlassesRendererContainerProps> = ({
  trackingState,
  frameId,
  shape,
  colorHex,
  onViewportChange,
}) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* 
        preserveDrawingBuffer: true is CRITICAL.
        Without this, canvas.toDataURL() or video recording will return empty black images
        because the browser clears the WebGL back buffer by default after rendering.
      */}
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
        
        {/* Advanced luxury environment lights */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 4]} intensity={1.6} castShadow />
        <directionalLight position={[-5, 5, -2]} intensity={0.4} />
        <pointLight position={[0, 0, 3]} intensity={0.8} color="#FFFFFF" />

        <GlassesScene
          trackingState={trackingState}
          frameId={frameId}
          shape={shape}
          colorHex={colorHex}
        />
        
        <ViewportListener onViewportChange={onViewportChange} />
      </Canvas>
    </div>
  );
};
