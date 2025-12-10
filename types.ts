import * as THREE from 'three';

export enum AppState {
  FORMED = 'FORMED',
  CHAOS = 'CHAOS',
}

export interface ParticleData {
  id: number;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: THREE.Color;
  speed: number;
  phase: number;
}

export interface OrnamentData extends ParticleData {
  type: 'ball' | 'gift' | 'polaroid';
  rotationSpeed: THREE.Vector3;
  scale: number;
  image?: string; // For polaroids
}

export interface HandGesture {
  gesture: string; // "Open_Palm", "Closed_Fist", "None"
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
}
