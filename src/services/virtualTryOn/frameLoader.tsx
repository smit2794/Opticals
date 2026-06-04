import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProceduralGlasses } from '../components/ProceduralGlasses';

interface FrameLoaderProps {
  frameId: string;
  shape: 'aviator' | 'round' | 'rectangle' | 'cateye' | 'wayfarer' | 'rimless';
  colorHex: string;
  lensSpacingX?: number;
  bridgeYOffset?: number;
  lensHeightScale?: number;
}

export const FrameLoader: React.FC<FrameLoaderProps> = ({
  frameId,
  shape,
  colorHex,
  lensSpacingX = 0.36,
  bridgeYOffset = 0.0,
  lensHeightScale = 1.0,
}) => {
  const [gltf, setGltf] = useState<any>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [_loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);

    const loader = new GLTFLoader();
    const modelUrl = `/assets/models/frames/${frameId}.glb`;

    loader.load(
      modelUrl,
      (loadedGltf) => {
        if (active) {
          // Traverse and configure luxury PBR materials
          loadedGltf.scene.traverse((node: any) => {
            if (node.isMesh) {
              const name = node.name.toLowerCase();
              if (name.includes('lens') || name.includes('glass')) {
                // Glass properties
                node.material = new THREE.MeshPhysicalMaterial({
                  color: new THREE.Color('#E2E8F0'),
                  metalness: 0.1,
                  roughness: 0.05,
                  transparent: true,
                  opacity: 0.25,
                  transmission: 0.9,
                  ior: 1.5,
                });
              } else if (name.includes('frame') || name.includes('rim') || name.includes('temple')) {
                // Apply color tone and frame properties
                const hex = colorHex.toLowerCase();
                const isMetallic = hex === '#d4af37' || hex === '#c0c0c0' || hex === '#5a5a5a';
                const isTranslucent = hex === '#e2e8f0' || hex === '#93c5fd' || hex === '#fbcfe8';

                if (isMetallic) {
                  node.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(colorHex),
                    metalness: 0.9,
                    roughness: 0.12,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                  });
                } else if (isTranslucent) {
                  node.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(colorHex),
                    metalness: 0.05,
                    roughness: 0.08,
                    transparent: true,
                    opacity: 0.65,
                    transmission: 0.7,
                    ior: 1.45,
                  });
                } else {
                  node.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(colorHex),
                    metalness: 0.1,
                    roughness: 0.06,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                  });
                }
              }
            }
          });
          setGltf(loadedGltf);
          setLoading(false);
        }
      },
      undefined,
      (err: any) => {
        if (active) {
          console.warn(`Real product model for ${frameId} not found at ${modelUrl}. Using procedural fallback:`, err?.message || err);
          setLoadError(true);
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [frameId, colorHex]);

  if (loadError || !gltf) {
    // If not loaded or failed, render the high-fidelity procedural model as a fallback
    return (
      <ProceduralGlasses
        shape={shape}
        colorHex={colorHex}
        lensSpacingX={lensSpacingX}
        bridgeYOffset={bridgeYOffset}
        lensHeightScale={lensHeightScale}
      />
    );
  }

  return (
    <group scale={[1, lensHeightScale, 1]} position={[0, bridgeYOffset, 0.08]}>
      {/* Real product 3D GLB Model primitive */}
      <primitive object={gltf.scene} />
    </group>
  );
};
