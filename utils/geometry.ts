import * as THREE from 'three';

export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const getConePoint = (height: number, baseRadius: number, yOffset: number = 0): THREE.Vector3 => {
  const h = Math.random() * height; // Random height
  const r = (1 - h / height) * baseRadius; // Radius at height h
  
  // Distribute points more towards surface but fill volume slightly
  const angle = Math.random() * Math.PI * 2;
  const radiusJitter = Math.sqrt(Math.random()) * r; 
  
  const x = radiusJitter * Math.cos(angle);
  const z = radiusJitter * Math.sin(angle);
  const y = h + yOffset;
  
  return new THREE.Vector3(x, y, z);
};
