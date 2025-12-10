import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Tree } from './Tree';
import { useTreeStore } from '../store';
import * as THREE from 'three';

const CameraController: React.FC = () => {
  const { handGesture } = useTreeStore();
  const controlsRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Gentle auto rotation
      controlsRef.current.autoRotate = handGesture.gesture === 'None';
      controlsRef.current.autoRotateSpeed = 0.5;
      
      if (handGesture.gesture !== 'None') {
        // Map Hand X (0-1) to Azimuth angle range
        // Map Hand Y (0-1) to Polar angle range
        
        const targetAzimuth = (handGesture.x - 0.5) * Math.PI * 2; // -PI to PI
        const targetPolar = THREE.MathUtils.clamp(handGesture.y * Math.PI, 0.5, 2.5);

        controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(controlsRef.current.getAzimuthalAngle(), targetAzimuth, delta * 2));
        controlsRef.current.setPolarAngle(THREE.MathUtils.lerp(controlsRef.current.getPolarAngle(), targetPolar, delta * 2));
      }
      
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={12}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2} 
    />
  );
};

const BackgroundGlow: React.FC = () => {
  // A subtle radial gradient billboard behind the tree to create the "glow" against black
  return (
    <mesh position={[0, 5, -20]} scale={[60, 60, 1]}>
      <planeGeometry />
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            float dist = distance(vUv, vec2(0.5));
            float alpha = smoothstep(0.5, 0.0, dist);
            // Golden/Warm white glow fading to black
            vec3 color = vec3(0.5, 0.4, 0.2); 
            gl_FragColor = vec4(color, alpha * 0.4);
          }
        `}
      />
    </mesh>
  );
};

export const Experience: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 30], fov: 45 }}
      dpr={[1, 2]} // Optimize for pixel ratio
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      {/* Black Void Background */}
      <color attach="background" args={['#000000']} />
      <fogExp2 attach="fog" args={['#000000', 0.02]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <spotLight position={[10, 25, 15]} angle={0.4} penumbra={0.5} intensity={2} castShadow color="#fff5d6" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#046307" />
      
      {/* Custom Background Glow */}
      <BackgroundGlow />

      {/* Luxury Environment - subdued */}
      <Environment preset="lobby" background={false} environmentIntensity={0.8} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={300} scale={15} size={3} speed={0.4} opacity={0.6} color="#FFD700" />

      {/* Main Content */}
      <Tree />
      
      {/* Controls */}
      <CameraController />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.7} 
            mipmapBlur 
            intensity={1.0} 
            radius={0.5} 
            color="#FFD700" 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
        <Noise opacity={0.03} />
      </EffectComposer>
    </Canvas>
  );
};