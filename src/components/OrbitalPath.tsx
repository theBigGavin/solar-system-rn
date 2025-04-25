import React, { useMemo } from "react";
import { THREE } from "expo-three"; // 替换 three 为 expo-three

// Function for distance normalization based on original project
const normalizeDistance = (distance: number): number => {
  // Handle potential zero or negative distance before pow
  if (distance <= 0) return 0;
  return Math.pow(distance, 0.4);
};

interface OrbitalPathProps {
  distance: number; // The original orbital distance (semi-major axis)
  // Remove scaleFactor prop
  segments?: number; // Number of segments for the circle approximation
  color?: THREE.ColorRepresentation;
  dashed?: boolean; // Keep dashed removed for now
}

const OrbitalPath: React.FC<OrbitalPathProps> = ({
  distance, // Receive original distance
  // Remove scaleFactor from props
  segments = 128, // Default segments for a smooth circle
  color = 0xaaaaaa, // Default color (light gray)
}) => {
  const points = useMemo(() => {
    // Apply normalization internally
    const scaledDistance = normalizeDistance(distance);
    const pointsArray: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pointsArray.push(
        new THREE.Vector3(
          Math.cos(theta) * scaledDistance,
          0, // Assume orbits are on the XZ plane for now
          Math.sin(theta) * scaledDistance
        )
      );
    }
    return pointsArray;
  }, [distance, segments]); // Remove scaleFactor dependency

  const geometry = useMemo(() => {
    // Always create basic geometry without computing line distances
    // return new THREE.BufferGeometry().setFromPoints(points);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    // if (dashed) {
    //   // Compute line distances for dashed lines
    //   geom.computeLineDistances(); // This caused the error
    // }
    return geom;
  }, [points]); // Remove dashed dependency

  const material = useMemo(() => {
    // Always use LineBasicMaterial for now
    return new THREE.LineBasicMaterial({ color });
    // if (dashed) {
    //   return new THREE.LineDashedMaterial({
    //     color,
    //     linewidth: 1, // Note: linewidth might not work on all platforms/drivers
    //     scale: 1,
    //     dashSize: 0.5, // Adjust dash size
    //     gapSize: 0.5, // Adjust gap size
    //   });
    // } else {
    //   return new THREE.LineBasicMaterial({ color });
    // }
  }, [color]); // Remove dashed dependency

  return useMemo(() => {
    // Ensure compatibility with React Native by creating the line object directly
    const line = new THREE.Line(geometry, material);
    line.matrixAutoUpdate = false; // Disable auto-updates to avoid unnecessary computations
    return <primitive object={line} />;
  }, [geometry, material]);
};

export default OrbitalPath;
