import React, { useRef, useEffect } from "react"; // Import useEffect
import { useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Default camera settings
const defaultCameraPosition = new THREE.Vector3(0, 10, 25);
const defaultTarget = new THREE.Vector3(0, 0, 0);
const focusLerpFactor = 0.08;
const unfocusLerpFactor = 0.05;
const positionThreshold = 0.1; // Threshold to determine if lerp is complete

// --- Camera Controller Logic ---
const CameraController = ({
  targetName,
  meshRefs,
  controlsRef,
}: {
  targetName: string | null;
  meshRefs: React.MutableRefObject<{ [key: string]: THREE.Mesh | null }>;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3()); // Where the controls should look at
  const desiredCameraPosition = useRef(new THREE.Vector3()); // Where the camera should move to
  const isFocusing = useRef(false); // Is the focus/unfocus animation running?
  const wasFocused = useRef(false); // Was a target previously selected?
  const prevTargetRotationY = useRef<number>(0); // Store previous target rotation for follow effect
  const followRotationFactor = 0.05; // How much the camera follows rotation (adjust as needed)

  // Effect to trigger focus/unfocus animation when targetName changes
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (targetName) {
      const targetMesh = meshRefs.current[targetName];
      if (targetMesh) {
        // Calculate target and desired camera positions for focusing
        targetMesh.getWorldPosition(targetPosition.current);
        const targetRadius = targetMesh.geometry.boundingSphere?.radius || 1;
        const offsetDistance = Math.max(targetRadius * 3, 1); // Ensure minimum distance
        const offset = new THREE.Vector3(0, targetRadius * 0.5, offsetDistance);
        // Calculate desired position relative to the target's world position
        const worldOffset = offset.applyQuaternion(targetMesh.getWorldQuaternion(new THREE.Quaternion()));
        desiredCameraPosition.current.copy(targetPosition.current).add(worldOffset);

        isFocusing.current = true; // Start focusing animation
        wasFocused.current = true;
        controls.enabled = false; // Disable controls during animation
        // Initialize prev rotation when focus starts
        prevTargetRotationY.current = targetMesh.rotation.y;
      }
    } else if (wasFocused.current) {
      // If target is removed and we were focused, start unfocusing
      targetPosition.current.copy(defaultTarget);
      desiredCameraPosition.current.copy(defaultCameraPosition);
      isFocusing.current = true; // Start unfocusing animation
      controls.enabled = false; // Disable controls during animation
    }
  }, [targetName, meshRefs, controlsRef, camera]); // Rerun when targetName changes

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (isFocusing.current) {
      // --- Animate Focus/Unfocus ---
      const currentTarget = targetName ? targetPosition.current : defaultTarget;
      const currentDesiredCameraPos = targetName ? desiredCameraPosition.current : defaultCameraPosition;
      const lerpFactor = targetName ? focusLerpFactor : unfocusLerpFactor;

      controls.target.lerp(currentTarget, lerpFactor);
      camera.position.lerp(currentDesiredCameraPos, lerpFactor);
      controls.update(); // Necessary to see the lerp effect

      // Check if animation is complete
      if (
        camera.position.distanceTo(currentDesiredCameraPos) < positionThreshold &&
        controls.target.distanceTo(currentTarget) < positionThreshold
      ) {
        isFocusing.current = false; // Stop animation
        controls.target.copy(currentTarget); // Set final target precisely
        camera.position.copy(currentDesiredCameraPos); // Set final position precisely
        controls.enabled = true; // Re-enable controls AFTER animation
        if (!targetName) {
          wasFocused.current = false; // Mark unfocus as complete
        }
        controls.update(); // Update one last time with precise values
        // Reset prev rotation when unfocus animation completes
        if (!targetName) {
          prevTargetRotationY.current = 0;
        }
      }
    } else if (targetName) {
      // --- Maintain Focus (Animation Complete) ---
      const targetMesh = meshRefs.current[targetName];
      if (targetMesh) {
        // 1. Update controls target
        targetMesh.getWorldPosition(controls.target);

        // 2. Calculate rotation delta
        const currentTargetRotationY = targetMesh.rotation.y;
        let deltaRotationY = currentTargetRotationY - prevTargetRotationY.current;

        // Handle rotation wrap-around (+/- 2*PI)
        const twoPi = Math.PI * 2;
        if (deltaRotationY > Math.PI) {
          deltaRotationY -= twoPi;
        } else if (deltaRotationY < -Math.PI) {
          deltaRotationY += twoPi;
        }

        // 3. Apply partial rotation to camera position if delta is significant
        if (Math.abs(deltaRotationY) > 0.0001) { // Avoid tiny adjustments
          const relativeCamPos = camera.position.clone().sub(controls.target);
          const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), // Rotate around world Y-axis
            deltaRotationY * followRotationFactor
          );
          relativeCamPos.applyQuaternion(rotationQuaternion);
          camera.position.copy(controls.target).add(relativeCamPos);
        }

        // 4. Update previous rotation for next frame
        prevTargetRotationY.current = currentTargetRotationY;

        // 5. Update controls (handles user input and finalizes camera state)
        controls.update();
      } else {
        // Target mesh somehow disappeared, fallback? Maybe unfocus.
        // For now, just allow free control.
        controls.update();
      }
    } else {
      // --- No Target, No Animation ---
      // Allow free orbit controls
      controls.update();
    }
  });

  return null;
};

export default CameraController;