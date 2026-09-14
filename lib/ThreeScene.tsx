import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useVideoConfigContext, TimelineElement } from './template';

// ─── Crisp 3D Text Billboard (Synchronous, Zero Network Dependencies) ───────

const Text3DBillboard: React.FC<{
  content: string;
  fontSize?: number;
  color: string;
  letterSpacing?: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
}> = ({ content, fontSize = 1.2, color, letterSpacing = 2, position, rotation, scale, opacity }) => {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Format text with spacing if specified
    const formatted = letterSpacing > 0 
      ? content.split('').join(' '.repeat(Math.min(3, Math.max(1, Math.round(letterSpacing / 4)))))
      : content;

    // Glowing background aura
    ctx.shadowColor = color;
    ctx.shadowBlur = 35;

    // Font styling
    ctx.font = '900 110px "Space Grotesk", "Inter", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(formatted, canvas.width / 2, canvas.height / 2);

    // Color tint overlay
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fillText(formatted, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [content, color, letterSpacing]);

  if (!texture) return null;

  const aspect = 4; // 2048 / 512
  const planeHeight = fontSize * 1.6;
  const planeWidth = planeHeight * aspect;

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={opacity} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </mesh>
  );
};

// ─── Individual 3D Element Renderer ─────────────────────────────────────────

const Element3DRenderer: React.FC<{ element: TimelineElement }> = ({ element }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { resolveColor } = useVideoConfigContext();

  const { startFrame, endFrame, type } = element;
  if (frame < startFrame || frame > endFrame) return null;

  const elementFrame = frame - startFrame;
  const entranceDuration = element.animateDuration || 25;
  const exitDuration = 18;

  const springEntrance = spring({
    frame: elementFrame,
    fps,
    config: { mass: 0.6, damping: 12, stiffness: 110 },
  });

  const enterProgress = interpolate(elementFrame, [0, entranceDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitProgress = interpolate(frame, [endFrame - exitDuration, endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = (element.scale ?? 1) * Math.max(0, springEntrance) * exitProgress;
  const basePos = element.position ?? [0, 0, 0];
  const baseRot = element.rotation ?? [0, 0, 0];
  const color = resolveColor(element.color || 'primary');

  // Smooth frame-driven continuous motion (purely deterministic, zero useFrame)
  const floatOffset = Math.sin((frame + (element.startFrame || 0)) * 0.05) * 0.15;
  const rotX = baseRot[0] + (elementFrame * 0.015);
  const rotY = baseRot[1] + (elementFrame * 0.022);

  // 1. 3D TEXT
  if (type === 'text3d') {
    return (
      <Text3DBillboard
        content={element.content || ''}
        fontSize={element.fontSize ?? 1.2}
        color={color}
        letterSpacing={element.letterSpacing ?? 4}
        position={[basePos[0], basePos[1] + floatOffset, basePos[2]]}
        rotation={[baseRot[0], baseRot[1], baseRot[2]]}
        scale={scale}
        opacity={Math.min(1, enterProgress) * exitProgress}
      />
    );
  }

  // 2. 3D GEOMETRY
  if (type === 'geometry') {
    const isGlass = element.materialType === 'glass';
    return (
      <mesh 
        position={[basePos[0], basePos[1] + floatOffset, basePos[2]]}
        rotation={[rotX, rotY, baseRot[2]]}
        scale={scale}
      >
        {element.geometryType === 'torusknot' ? (
          <torusKnotGeometry args={[1, 0.32, 128, 32]} />
        ) : element.geometryType === 'icosahedron' ? (
          <icosahedronGeometry args={[1.2, 0]} />
        ) : (
          <boxGeometry args={[1.4, 1.4, 1.4]} />
        )}
        
        {isGlass ? (
          <meshPhysicalMaterial 
            color={color}
            roughness={0.12}
            transmission={0.88}
            thickness={1.5}
            ior={1.45}
            transparent
            opacity={0.85}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial 
            color={color}
            metalness={0.92}
            roughness={0.18}
            emissive={color}
            emissiveIntensity={0.2}
          />
        )}
      </mesh>
    );
  }

  // 3. HUD RING
  if (type === 'hudRing') {
    const ringRadius = element.r || 2;
    return (
      <group 
        position={[basePos[0], basePos[1], basePos[2]]} 
        rotation={[baseRot[0], baseRot[1], baseRot[2] + elementFrame * 0.01]}
      >
        <mesh scale={scale}>
          <ringGeometry args={[ringRadius - 0.06, ringRadius, 64]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.65 * enterProgress * exitProgress} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {element.showTicks && (
          <mesh scale={scale}>
            <ringGeometry args={[ringRadius + 0.12, ringRadius + 0.18, 48, 1, 0, Math.PI * 1.85]} />
            <meshBasicMaterial 
              wireframe 
              color={resolveColor('accent')} 
              transparent 
              opacity={0.4 * enterProgress * exitProgress} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}
      </group>
    );
  }

  return null;
};

// ─── Camera Rig (Driven directly by frame) ──────────────────────────────────

const DynamicCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { stylePreset } = useVideoConfigContext();

  const progress = frame / Math.max(1, durationInFrames);
  
  let camX = 0;
  let camY = 0;
  let camZ = 8;

  if (stylePreset === 'cinematic') {
    camX = Math.sin(progress * Math.PI) * 1.8;
    camY = Math.cos(progress * Math.PI) * 0.4 - 0.2;
    camZ = 8 - progress * 2.8; // Smooth dolly in
  } else {
    camZ = 7 - progress * 1.2;
  }

  return (
    <PerspectiveCamera 
      makeDefault 
      fov={45} 
      position={[camX, camY, camZ]} 
    />
  );
};

// ─── Main Scene Setup ───────────────────────────────────────────────────────

export const ThreeScene: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { config, resolveColor } = useVideoConfigContext();
  const activeEffects = config.backgroundEffects ?? { particles: true };

  const bgHex = resolveColor('bgGradient')?.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)?.[0] || '#030206';

  return (
    <ThreeCanvas 
      width={width} 
      height={height} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
    >
      <color attach="background" args={[bgHex]} />
      
      {/* Studio 3-Point Lighting */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 12, 6]} intensity={2.2} color={resolveColor('primary')} />
      <pointLight position={[-8, -6, -4]} intensity={1.8} color={resolveColor('accent')} />
      <spotLight position={[0, 10, 4]} intensity={2.5} angle={0.5} penumbra={0.9} color="#ffffff" />

      {/* Particle Stars */}
      {activeEffects.particles && (
        <Stars radius={80} depth={40} count={2200} factor={3.5} saturation={0.2} fade speed={1} />
      )}
      
      {/* Deterministic Camera */}
      <DynamicCamera />

      {/* 3D Elements */}
      {(config.elements || []).map((el) => (
        <Element3DRenderer key={el.id} element={el} />
      ))}
    </ThreeCanvas>
  );
};
