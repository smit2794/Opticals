import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ProceduralGlassesProps {
  shape: 'aviator' | 'round' | 'rectangle' | 'cateye' | 'wayfarer' | 'rimless';
  colorHex: string;
  lensSpacingX?: number;
  bridgeYOffset?: number;
  lensHeightScale?: number;
}

export const ProceduralGlasses: React.FC<ProceduralGlassesProps> = ({
  shape,
  colorHex,
  lensSpacingX = 0.36,
  bridgeYOffset = 0.0,
  lensHeightScale = 1.0,
}) => {
  // 1. Calculate PBR Material Properties based on Selected Color
  const frameMaterialProps = useMemo(() => {
    const hex = colorHex.toLowerCase();
    
    // Metallic frames (Gold, Silver, Gunmetal)
    if (hex === '#d4af37' || hex === '#c0c0c0' || hex === '#5a5a5a') {
      return {
        color: new THREE.Color(colorHex),
        metalness: 0.9,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      };
    }
    
    // Transparent Acetate frames (Slate/Transparent, Blue, Pink)
    if (hex === '#e2e8f0' || hex === '#93c5fd' || hex === '#fbcfe8') {
      return {
        color: new THREE.Color(colorHex),
        metalness: 0.05,
        roughness: 0.08,
        transparent: true,
        opacity: 0.65,
        transmission: 0.7,
        ior: 1.45,
      };
    }
    
    // Standard Polished Acetate frames (Black, Tortoise)
    return {
      color: new THREE.Color(colorHex),
      metalness: 0.1,
      roughness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    };
  }, [colorHex]);

  // Lens material props (translucent, reflective glass)
  const lensMaterialProps = useMemo(() => {
    return {
      color: new THREE.Color('#E2E8F0'),
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.25,
      transmission: 0.9,
      ior: 1.5,
    };
  }, []);

  // Standard nose pad material (semi-transparent silicone)
  const nosePadMaterialProps = useMemo(() => {
    return {
      color: new THREE.Color('#F1F5F9'),
      transparent: true,
      opacity: 0.7,
      roughness: 0.6,
    };
  }, []);

  // 2. Build Extrusion Shapes for Frames
  const rightRimGeometry = useMemo(() => {
    if (shape === 'round' || shape === 'rimless') return null;

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      curveSegments: 32,
    };

    const s = new THREE.Shape();

    if (shape === 'rectangle') {
      // Rounded rectangle shape
      const w = 0.32;
      const h = 0.22;
      const r = 0.06;

      // Outer boundary path
      s.moveTo(-w + r, h);
      s.lineTo(w - r, h);
      s.quadraticCurveTo(w, h, w, h - r);
      s.lineTo(w, -h + r);
      s.quadraticCurveTo(w, -h, w - r, -h);
      s.lineTo(-w + r, -h);
      s.quadraticCurveTo(-w, -h, -w, -h + r);
      s.lineTo(-w, h - r);
      s.quadraticCurveTo(-w, h, -w + r, h);

      // Inner boundary path (hole)
      const iw = w - 0.024;
      const ih = h - 0.024;
      const ir = r - 0.008;
      const hole = new THREE.Path();
      hole.moveTo(-iw + ir, ih);
      hole.lineTo(iw - ir, ih);
      hole.quadraticCurveTo(iw, ih, iw, ih - ir);
      hole.lineTo(iw, -ih + ir);
      hole.quadraticCurveTo(iw, -ih, iw - ir, -ih);
      hole.lineTo(-iw + ir, -ih);
      hole.quadraticCurveTo(-iw, -ih, -iw, -ih + ir);
      hole.lineTo(-iw, ih - ir);
      hole.quadraticCurveTo(-iw, ih, -iw + ir, ih);

      s.holes.push(hole);
    } else if (shape === 'wayfarer') {
      // Trapezoidal rounded shape, thicker at the top
      const w = 0.33;
      const h = 0.24;
      
      // Outer path (Wayfarer style: wider at top, narrower at bottom)
      s.moveTo(-w + 0.08, h);
      s.quadraticCurveTo(0, h + 0.015, w - 0.08, h);
      s.quadraticCurveTo(w, h, w - 0.01, h - 0.04);
      s.lineTo(w - 0.06, -h + 0.04);
      s.quadraticCurveTo(w - 0.08, -h, w - 0.14, -h);
      s.lineTo(-w + 0.14, -h);
      s.quadraticCurveTo(-w + 0.08, -h, -w + 0.06, -h + 0.04);
      s.lineTo(-w + 0.01, h - 0.04);
      s.quadraticCurveTo(-w, h, -w + 0.08, h);

      // Inner path (hole, slightly offset)
      const hole = new THREE.Path();
      const offset = 0.026;
      const iw = w - offset;
      const ih = h - offset;
      hole.moveTo(-iw + 0.06, ih);
      hole.quadraticCurveTo(0, ih + 0.01, iw - 0.06, ih);
      hole.quadraticCurveTo(iw, ih, iw - 0.01, ih - 0.03);
      hole.lineTo(iw - 0.05, -ih + 0.03);
      hole.quadraticCurveTo(iw - 0.07, -ih, iw - 0.12, -ih);
      hole.lineTo(-iw + 0.12, -ih);
      hole.quadraticCurveTo(-iw + 0.07, -ih, -iw + 0.05, -ih + 0.03);
      hole.lineTo(-iw + 0.01, ih - 0.03);
      hole.quadraticCurveTo(-iw, ih, -iw + 0.06, ih);

      s.holes.push(hole);
    } else if (shape === 'cateye') {
      // Upswept wing on top-right
      const w = 0.32;
      const h = 0.22;

      s.moveTo(-w + 0.05, h - 0.02);
      s.lineTo(w - 0.08, h + 0.05); // line sweeping upwards
      s.quadraticCurveTo(w + 0.08, h + 0.12, w + 0.06, h - 0.02); // swept-out wing tip
      s.lineTo(w - 0.04, -h + 0.05);
      s.quadraticCurveTo(w - 0.06, -h, 0.05, -h - 0.01);
      s.lineTo(-w + 0.08, -h + 0.02);
      s.quadraticCurveTo(-w, -h + 0.05, -w, h - 0.08);
      s.lineTo(-w + 0.05, h - 0.02);

      // Inner path (hole matching the cat eye sweeps)
      const hole = new THREE.Path();
      const iw = w - 0.024;
      const ih = h - 0.024;
      hole.moveTo(-iw + 0.04, ih - 0.02);
      hole.lineTo(iw - 0.07, ih + 0.03);
      hole.quadraticCurveTo(iw + 0.04, ih + 0.08, iw + 0.03, ih - 0.02);
      hole.lineTo(iw - 0.03, -ih + 0.04);
      hole.quadraticCurveTo(iw - 0.05, -ih, 0.04, -ih - 0.01);
      hole.lineTo(-iw + 0.07, -ih + 0.02);
      hole.quadraticCurveTo(-iw, -ih + 0.04, -iw, ih - 0.06);
      hole.lineTo(-iw + 0.04, ih - 0.02);

      s.holes.push(hole);
    } else if (shape === 'aviator') {
      // Classic teardrop shape
      const w = 0.35;
      const h = 0.28;

      s.moveTo(-0.15, h - 0.05);
      s.lineTo(w - 0.05, h - 0.05);
      s.quadraticCurveTo(w, h - 0.05, w, h - 0.1);
      s.lineTo(w - 0.02, -0.05);
      s.quadraticCurveTo(w - 0.05, -h, 0.05, -h);
      s.quadraticCurveTo(-w + 0.15, -h, -w + 0.08, -0.08);
      s.lineTo(-w + 0.04, h - 0.12);
      s.quadraticCurveTo(-w + 0.04, h - 0.05, -0.15, h - 0.05);

      // Inner path (hole, thin aviator metal look)
      const hole = new THREE.Path();
      const offset = 0.016; // aviators have very thin frames
      const iw = w - offset;
      const ih = h - offset;
      hole.moveTo(-0.15, ih - 0.05);
      hole.lineTo(iw - 0.05, ih - 0.05);
      hole.quadraticCurveTo(iw, ih - 0.05, iw, ih - 0.1);
      hole.lineTo(iw - 0.02, -0.05);
      hole.quadraticCurveTo(iw - 0.05, -ih, 0.05, -ih);
      hole.quadraticCurveTo(-iw + 0.15, -ih, -iw + 0.08, -0.08);
      hole.lineTo(-iw + 0.04, ih - 0.12);
      hole.quadraticCurveTo(-iw + 0.04, ih - 0.05, -0.15, ih - 0.05);

      s.holes.push(hole);
    }

    return new THREE.ExtrudeGeometry(s, extrudeSettings);
  }, [shape]);

  // Center translation values
  const hingeOffset = shape === 'cateye' ? 0.38 : 0.36;
  const currentHingeOffset = lensSpacingX + (hingeOffset - 0.36);

  return (
    <group position={[0, 0, 0.08]}>
      {/* ================= RIGHT EYE PIECE ================= */}
      <group position={[lensSpacingX, 0, 0]} scale={[1, lensHeightScale, 1]}>
        {/* Right Rim (Procedural Extrusion) */}
        {rightRimGeometry && (
          <mesh geometry={rightRimGeometry}>
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        )}

        {/* Right Rim Round (Torus) */}
        {shape === 'round' && (
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.26, 0.024, 16, 64]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        )}

        {/* Right Rimless Frame Corner Mount */}
        {shape === 'rimless' && (
          <mesh position={[0.27, 0.02, 0.01]}>
            <boxGeometry args={[0.04, 0.02, 0.03]} />
            <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
          </mesh>
        )}

        {/* Right Lens (Glass Body) */}
        {shape === 'round' ? (
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.008, 32]} />
            <meshPhysicalMaterial {...lensMaterialProps} />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.01]}>
            {shape === 'rectangle' ? (
              <boxGeometry args={[0.58, 0.40, 0.008]} />
            ) : shape === 'wayfarer' ? (
              <boxGeometry args={[0.60, 0.42, 0.008]} />
            ) : shape === 'cateye' ? (
              <boxGeometry args={[0.58, 0.40, 0.008]} />
            ) : shape === 'aviator' ? (
              <boxGeometry args={[0.62, 0.50, 0.008]} />
            ) : (
              // Rimless
              <boxGeometry args={[0.56, 0.38, 0.012]} />
            )}
            <meshPhysicalMaterial {...lensMaterialProps} />
          </mesh>
        )}

        {/* Right Lens 4K Anti-Reflective Glare Coating */}
        {shape === 'round' ? (
          <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.248, 0.248, 0.002, 32]} />
            <meshPhysicalMaterial
              color="#22D3EE"
              transparent
              opacity={0.06}
              roughness={0.01}
              metalness={0.2}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.012]}>
            {shape === 'rectangle' ? (
              <boxGeometry args={[0.57, 0.39, 0.002]} />
            ) : shape === 'wayfarer' ? (
              <boxGeometry args={[0.59, 0.41, 0.002]} />
            ) : shape === 'cateye' ? (
              <boxGeometry args={[0.57, 0.39, 0.002]} />
            ) : shape === 'aviator' ? (
              <boxGeometry args={[0.61, 0.49, 0.002]} />
            ) : (
              <boxGeometry args={[0.55, 0.37, 0.002]} />
            )}
            <meshPhysicalMaterial
              color="#22D3EE"
              transparent
              opacity={0.06}
              roughness={0.01}
              metalness={0.2}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>

      {/* ================= LEFT EYE PIECE ================= */}
      <group position={[-lensSpacingX, 0, 0]} scale={[-1, lensHeightScale, 1]}>
        {/* Left Rim (Mirrored Extrusion) */}
        {rightRimGeometry && (
          <mesh geometry={rightRimGeometry}>
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        )}

        {/* Left Rim Round (Torus) */}
        {shape === 'round' && (
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.26, 0.024, 16, 64]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        )}

        {/* Left Rimless Frame Corner Mount */}
        {shape === 'rimless' && (
          <mesh position={[0.27, 0.02, 0.01]}>
            <boxGeometry args={[0.04, 0.02, 0.03]} />
            <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
          </mesh>
        )}

        {/* Left Lens (Glass Body) */}
        {shape === 'round' ? (
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.008, 32]} />
            <meshPhysicalMaterial {...lensMaterialProps} />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.01]}>
            {shape === 'rectangle' ? (
              <boxGeometry args={[0.58, 0.40, 0.008]} />
            ) : shape === 'wayfarer' ? (
              <boxGeometry args={[0.60, 0.42, 0.008]} />
            ) : shape === 'cateye' ? (
              <boxGeometry args={[0.58, 0.40, 0.008]} />
            ) : shape === 'aviator' ? (
              <boxGeometry args={[0.62, 0.50, 0.008]} />
            ) : (
              // Rimless
              <boxGeometry args={[0.56, 0.38, 0.012]} />
            )}
            <meshPhysicalMaterial {...lensMaterialProps} />
          </mesh>
        )}

        {/* Left Lens 4K Anti-Reflective Glare Coating */}
        {shape === 'round' ? (
          <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.248, 0.248, 0.002, 32]} />
            <meshPhysicalMaterial
              color="#22D3EE"
              transparent
              opacity={0.06}
              roughness={0.01}
              metalness={0.2}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.012]}>
            {shape === 'rectangle' ? (
              <boxGeometry args={[0.57, 0.39, 0.002]} />
            ) : shape === 'wayfarer' ? (
              <boxGeometry args={[0.59, 0.41, 0.002]} />
            ) : shape === 'cateye' ? (
              <boxGeometry args={[0.57, 0.39, 0.002]} />
            ) : shape === 'aviator' ? (
              <boxGeometry args={[0.61, 0.49, 0.002]} />
            ) : (
              <boxGeometry args={[0.55, 0.37, 0.002]} />
            )}
            <meshPhysicalMaterial
              color="#22D3EE"
              transparent
              opacity={0.06}
              roughness={0.01}
              metalness={0.2}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>

      {/* ================= CENTRAL BRIDGE & NOSE PADS ================= */}
      <group position={[0, bridgeYOffset, 0]} scale={[lensSpacingX / 0.36, 1, 1]}>
        {/* Bridge geometries */}
        {shape === 'aviator' ? (
          <group>
            {/* Lower Bridge */}
            <mesh position={[0, 0.05, 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 0.20, 16]} />
              <meshPhysicalMaterial {...frameMaterialProps} />
            </mesh>
            {/* Upper Brow Bar */}
            <mesh position={[0, 0.16, 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 16]} />
              <meshPhysicalMaterial {...frameMaterialProps} />
            </mesh>
          </group>
        ) : shape === 'rimless' ? (
          <mesh position={[0, 0.02, 0.015]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 16]} />
            <meshPhysicalMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
          </mesh>
        ) : (
          <mesh position={[0, 0.02, 0.015]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.16, 16]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        )}

        {/* Nose Pads and metal arms inside the scaling group */}
        {/* Right Nose Pad and metal arm */}
        <mesh position={[0.08, -0.06, -0.01]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
          <meshPhysicalMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.09, -0.08, -0.03]} rotation={[0.2, -0.2, 0.4]}>
          <boxGeometry args={[0.02, 0.04, 0.012]} />
          <meshPhysicalMaterial {...nosePadMaterialProps} />
        </mesh>

        {/* Left Nose Pad and metal arm */}
        <mesh position={[-0.08, -0.06, -0.01]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
          <meshPhysicalMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.09, -0.08, -0.03]} rotation={[0.2, 0.2, -0.4]}>
          <boxGeometry args={[0.02, 0.04, 0.012]} />
          <meshPhysicalMaterial {...nosePadMaterialProps} />
        </mesh>
      </group>

      {/* ================= TEMPLES & METALLIC HINGES ================= */}
      {/* Right Hinge Joint Metal Overlay */}
      <mesh position={[currentHingeOffset + 0.02, 0.02, 0.01]}>
        <boxGeometry args={[0.022, 0.022, 0.025]} />
        <meshPhysicalMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Right Temple */}
      <group position={[currentHingeOffset + 0.28, 0.02, -0.02]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
        <mesh position={[0.015, -0.01, -0.65]} rotation={[0, 0.04, 0]}>
          <boxGeometry args={[0.018, 0.022, 1.3]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
        <mesh position={[0.04, -0.13, -1.33]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.018, 0.20, 0.02]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
      </group>

      {/* Left Hinge Joint Metal Overlay */}
      <mesh position={[-(currentHingeOffset + 0.02), 0.02, 0.01]}>
        <boxGeometry args={[0.022, 0.022, 0.025]} />
        <meshPhysicalMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Left Temple */}
      <group position={[-(currentHingeOffset + 0.28), 0.02, -0.02]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
        <mesh position={[-0.015, -0.01, -0.65]} rotation={[0, -0.04, 0]}>
          <boxGeometry args={[0.018, 0.022, 1.3]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
        <mesh position={[-0.04, -0.13, -1.33]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.018, 0.20, 0.02]} />
          <meshPhysicalMaterial {...frameMaterialProps} />
        </mesh>
      </group>
    </group>
  );
};
