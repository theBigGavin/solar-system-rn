import React, { useMemo } from "react";
import { THREE } from "expo-three";
import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from "three"; // Import necessary types

interface AsteroidBeltProps {
  innerRadius: number;
  outerRadius: number;
  count?: number;
  particleSize?: number;
  color?: THREE.ColorRepresentation;
  thickness?: number; // How much vertical spread
}

const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  innerRadius,
  outerRadius,
  count = 5000, // Default number of asteroids
  particleSize = 0.015, // Default size of each asteroid particle
  color = 0xaaaaaa, // Default color (light gray)
  thickness = 0.1, // Default vertical thickness
}) => {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3); // x, y, z for each particle

    for (let i = 0; i < count; i++) {
      // Random angle
      const theta = Math.random() * Math.PI * 2;
      // Random radius within the belt
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      // Random vertical position within the thickness
      const y = (Math.random() - 0.5) * thickness;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const bufferGeometry = new BufferGeometry();
    bufferGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );
    return bufferGeometry;
  }, [count, innerRadius, outerRadius, thickness]);

  const material = useMemo(() => {
    return new PointsMaterial({
      color: color,
      size: particleSize,
      sizeAttenuation: true, // Points get smaller further away
      transparent: true, // Enable transparency
      opacity: 0.6, // Make points slightly transparent
      depthWrite: false, // Helps with transparency sorting issues
      blending: THREE.AdditiveBlending, // Brighter where points overlap
    });
  }, [color, particleSize]);

  // Use primitive because Points is not a standard R3F component type
  return <primitive object={new THREE.Points(geometry, material)} />;
};

export default AsteroidBelt;
