import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useTreeStore } from '../store';
import { AppState, OrnamentData } from '../types';
import { getConePoint, getRandomSpherePoint } from '../utils/geometry';

// Increased counts for a much fuller, luxurious tree
const NUM_NEEDLES = 12000;
const NUM_ORNAMENTS = 350;
const NUM_POLAROIDS = 35;
const TREE_HEIGHT = 16;
const TREE_RADIUS = 6.5;

// --- Shaders for Foliage ---
const foliageVertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Increased size multiplier from 300.0 to 450.0 for fuller look
    gl_PointSize = size * (450.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const foliageFragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Add a golden glow to the center
    float glow = 1.0 - (r * 2.0);
    vec3 finalColor = mix(vColor, vec3(1.0, 0.9, 0.5), glow * 0.5);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- Components ---

const Foliage: React.FC = () => {
  const { appState } = useTreeStore();
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate Data
  const { positions, colors, sizes, targets, chaos } = useMemo(() => {
    const p = new Float32Array(NUM_NEEDLES * 3);
    const c = new Float32Array(NUM_NEEDLES * 3);
    const s = new Float32Array(NUM_NEEDLES);
    const t = new Float32Array(NUM_NEEDLES * 3); // Target (Formed)
    const ch = new Float32Array(NUM_NEEDLES * 3); // Chaos

    const baseColor = new THREE.Color('#046307');
    const goldColor = new THREE.Color('#FFD700');

    for (let i = 0; i < NUM_NEEDLES; i++) {
      // Formed State
      const formed = getConePoint(TREE_HEIGHT, TREE_RADIUS, -TREE_HEIGHT / 2);
      t[i * 3] = formed.x;
      t[i * 3 + 1] = formed.y;
      t[i * 3 + 2] = formed.z;

      // Chaos State
      const exploded = getRandomSpherePoint(30); // Slightly larger chaos radius
      ch[i * 3] = exploded.x;
      ch[i * 3 + 1] = exploded.y;
      ch[i * 3 + 2] = exploded.z;

      // Current Pos (Start at Chaos)
      p[i * 3] = exploded.x;
      p[i * 3 + 1] = exploded.y;
      p[i * 3 + 2] = exploded.z;

      // Color mixing (Mostly emerald, some gold tips)
      const isGold = Math.random() > 0.92; // Slightly fewer gold tips percentage-wise due to higher count
      const col = isGold ? goldColor : baseColor;
      
      // Variation
      if (!isGold) {
        col.offsetHSL(0, 0, (Math.random() - 0.5) * 0.15);
      }

      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;

      s[i] = Math.random() * 0.5 + 0.3; // Slightly larger minimum size
    }
    return { positions: p, colors: c, sizes: s, targets: t, chaos: ch };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const isFormed = appState === AppState.FORMED;
    
    const speed = isFormed ? 2.5 : 4.0; // Explosion is faster

    for (let i = 0; i < NUM_NEEDLES; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const targetX = isFormed ? targets[ix] : chaos[ix];
      const targetY = isFormed ? targets[iy] : chaos[iy];
      const targetZ = isFormed ? targets[iz] : chaos[iz];

      // Lerp
      posAttr.array[ix] += (targetX - posAttr.array[ix]) * delta * speed;
      posAttr.array[iy] += (targetY - posAttr.array[iy]) * delta * speed;
      posAttr.array[iz] += (targetZ - posAttr.array[iz]) * delta * speed;
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={NUM_NEEDLES} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={NUM_NEEDLES} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={NUM_NEEDLES} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

const Ornaments: React.FC = () => {
    const { appState } = useTreeStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const data = useMemo(() => {
        const arr: OrnamentData[] = [];
        const colors = [new THREE.Color('#FFD700'), new THREE.Color('#D4AF37'), new THREE.Color('#C0C0C0'), new THREE.Color('#8B0000')]; // Gold, Dark Gold, Silver, Deep Red

        for (let i = 0; i < NUM_ORNAMENTS; i++) {
            const formed = getConePoint(TREE_HEIGHT - 1, TREE_RADIUS * 0.9, -TREE_HEIGHT / 2 + 0.5);
            const chaos = getRandomSpherePoint(25);
            
            arr.push({
                id: i,
                chaosPos: chaos,
                targetPos: formed,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI,
                type: Math.random() > 0.7 ? 'gift' : 'ball',
                rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                scale: Math.random() * 0.5 + 0.3
            });
        }
        return arr;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const isFormed = appState === AppState.FORMED;
        const speedMultiplier = isFormed ? 1.5 : 3.0;

        const mat = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const rot = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        for(let i=0; i<NUM_ORNAMENTS; i++) {
            meshRef.current.getMatrixAt(i, mat);
            mat.decompose(pos, rot, scale);

            const item = data[i];
            const target = isFormed ? item.targetPos : item.chaosPos;

            // Float effect
            const floatY = Math.sin(state.clock.elapsedTime + item.phase) * 0.05;

            pos.lerp(new THREE.Vector3(target.x, target.y + floatY, target.z), delta * item.speed * 0.5);
            
            // Rotation
            dummy.position.copy(pos);
            dummy.rotation.x += item.rotationSpeed.x * delta;
            dummy.rotation.y += item.rotationSpeed.y * delta;
            dummy.scale.setScalar(item.scale);
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, item.color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if(meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_ORNAMENTS]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial metalness={1} roughness={0.1} envMapIntensity={2} />
        </instancedMesh>
    );
}

const Polaroids: React.FC = () => {
    const { appState } = useTreeStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const data = useMemo(() => {
        const arr: OrnamentData[] = [];
        for (let i = 0; i < NUM_POLAROIDS; i++) {
             // Place polaroids slightly outside the tree
            const formed = getConePoint(TREE_HEIGHT, TREE_RADIUS + 1.2, -TREE_HEIGHT / 2);
            const chaos = getRandomSpherePoint(35); // Further out
            arr.push({
                id: i,
                chaosPos: chaos,
                targetPos: formed,
                color: new THREE.Color('#E3E4E5'),
                speed: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI,
                type: 'polaroid',
                rotationSpeed: new THREE.Vector3(0, Math.random() * 0.5, 0),
                scale: 1.5
            });
        }
        return arr;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const isFormed = appState === AppState.FORMED;

        const mat = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const rot = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        for(let i=0; i<NUM_POLAROIDS; i++) {
            meshRef.current.getMatrixAt(i, mat);
            mat.decompose(pos, rot, scale);

            const item = data[i];
            const target = isFormed ? item.targetPos : item.chaosPos;

            pos.lerp(target, delta * item.speed * 0.8);
            
            dummy.position.copy(pos);
            // Face camera slightly or rotate slowly
            dummy.lookAt(0,0,0); 
            dummy.rotateY(state.clock.elapsedTime * 0.2 + item.phase);
            
            dummy.scale.set(1.2, 1.5, 0.1); // Polaroid shape
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, item.color);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
         <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_POLAROIDS]}>
            <boxGeometry />
            <meshStandardMaterial metalness={0.9} roughness={0.2} color="#eeeeee" />
        </instancedMesh>
    )
}

export const Tree: React.FC = () => {
  return (
    <group>
      <Foliage />
      <Ornaments />
      <Polaroids />
      
      {/* Cinematic Floor Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -9, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
            color="#050505" 
            roughness={0.1} 
            metalness={0.9} 
        />
      </mesh>
    </group>
  );
};