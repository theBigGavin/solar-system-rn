import React, { useRef, useMemo, useEffect, useState } from "react";
import * as R3F from "@react-three/fiber/native";
import * as THREE from "three";
import { useTexture } from "@react-three/drei/native"; // Keep for potential future use if needed elsewhere
import { Asset } from "expo-asset";
import { textureMap } from "../constants/textureMap";
import { loadTextureAsync } from "expo-three"; // Import loadTextureAsync

interface RingsProps {
  textureFilename: string;
  innerRadius: number; // Scaled inner radius
  outerRadius: number; // Scaled outer radius
  // tilt: number; // Tilt is now handled by the parent group
}

const Rings: React.FC<RingsProps> = ({
  textureFilename,
  innerRadius,
  outerRadius,
  // tilt, // Removed
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.RingGeometry>(null!);

  // --- Texture Loading State ---
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);
  const [textureError, setTextureError] = useState<string | null>(null);

  // --- Load Texture Asset URI ---
  useEffect(() => {
    let isMounted = true;
    const loadTextureUri = async () => {
      setIsLoadingTexture(true);
      setTextureError(null);
      setResolvedUri(null); // Reset URI on prop change
      try {
        if (textureFilename && textureMap[textureFilename]) {
          const assetModule = textureMap[textureFilename];
          const asset = Asset.fromModule(assetModule);
          // Check if already downloaded to avoid re-downloading
          if (!asset.downloaded) {
            console.log(`Downloading ring texture: ${textureFilename}`);
            await asset.downloadAsync();
          } else {
            console.log(`Using cached ring texture: ${textureFilename}`);
          }

          const uriToUse = asset.localUri || asset.uri;
          if (isMounted && uriToUse) {
            setResolvedUri(uriToUse);
          } else if (isMounted) {
            const errorMsg = `Could not get URI for ${textureFilename}`;
            console.warn(errorMsg);
            setTextureError(errorMsg);
          }
        } else {
          const errorMsg = `Texture ${textureFilename} not found in textureMap`;
          console.warn(errorMsg);
          if (isMounted) setTextureError(errorMsg);
        }
      } catch (error: any) {
        console.error(`Error loading ring texture ${textureFilename}:`, error);
        if (isMounted)
          setTextureError(`Error loading texture: ${error.message}`);
      } finally {
        if (isMounted) setIsLoadingTexture(false);
      }
    };
    loadTextureUri();
    return () => {
      isMounted = false;
    };
  }, [textureFilename]); // Re-run only if filename changes

  // --- Loading/Error Display ---
  if (isLoadingTexture) {
    console.log(`Ring ${textureFilename}: Loading texture URI...`);
    // Render placeholder while texture URI is loading
    return (
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="grey" wireframe side={THREE.DoubleSide} />
      </mesh>
    );
  }

  if (textureError) {
    console.error(`Ring ${textureFilename}: Texture error - ${textureError}`);
    // Render error placeholder
    return (
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="red" wireframe side={THREE.DoubleSide} />
      </mesh>
    );
  }

  // --- Render RingsRenderer only when URI is resolved ---
  // If resolvedUri is null here, it means loading finished but failed to get URI
  if (!resolvedUri) {
    console.warn(
      `Ring ${textureFilename}: Resolved URI is null after loading attempt.`
    );
    // Render error or different placeholder
    return (
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="purple" wireframe side={THREE.DoubleSide} />
      </mesh>
    );
  }

  // URI is ready, render the component that will load the texture manually
  return (
    <RingsRenderer
      resolvedUri={resolvedUri}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      // tilt={tilt} // Removed
      textureFilename={textureFilename} // Pass filename for logging
    />
  );
};

// --- RingsRenderer Component ---
// This component handles the actual rendering once the texture URI is available.
// It calls useTexture unconditionally at its top level.
interface RingsRendererProps extends Omit<RingsProps, "textureFilename"> {
  // Omit textureFilename from props if not needed inside
  resolvedUri: string;
  textureFilename: string; // Keep filename for logging
}

const RingsRenderer: React.FC<RingsRendererProps> = ({
  resolvedUri,
  innerRadius,
  outerRadius,
  // tilt, // Removed from props
  textureFilename, // Receive filename for logging
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  console.log(
    `RingsRenderer for ${textureFilename}: Received resolvedUri: ${resolvedUri}`
  );

  // --- Load Texture Manually with expo-three's loadTextureAsync ---
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const loadAsync = async () => {
      if (!resolvedUri) return;

      console.log(
        `RingsRenderer for ${textureFilename}: Attempting to load texture via expo-three loadTextureAsync...`
      );
      setTexture(null); // Reset texture state
      setLoadError(null); // Reset error state

      try {
        const loadedTexture = await loadTextureAsync({ asset: resolvedUri });
        if (isMounted) {
          console.log(
            `RingsRenderer for ${textureFilename}: Texture loaded successfully via loadTextureAsync:`,
            loadedTexture
          );
          // Ensure texture properties are suitable for rings
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          // loadedTexture.needsUpdate = true; // Often handled by expo-three/R3F
          setTexture(loadedTexture);
        }
      } catch (error: unknown) {
        console.error(
          `RingsRenderer for ${textureFilename}: Error loading texture via loadTextureAsync:`,
          error
        );
        if (isMounted) {
          // Type checking for unknown error
          let errorMessage = "Unknown texture loading error";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            errorMessage = error.message;
          }
          setLoadError(`loadTextureAsync failed: ${errorMessage}`);
          setTexture(null);
        }
      }
    };

    loadAsync();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates
    };
  }, [resolvedUri, textureFilename]); // Re-run if URI changes

  // --- Geometry Creation ---
  const geometry = useMemo(() => {
    console.log(
      `Creating RingGeometry for ${textureFilename}: inner=${innerRadius}, outer=${outerRadius}`
    );
    const validInner =
      typeof innerRadius === "number" && isFinite(innerRadius)
        ? innerRadius
        : 0.1;
    const validOuter =
      typeof outerRadius === "number" && isFinite(outerRadius)
        ? outerRadius
        : 0.2;
    if (validInner >= validOuter) {
      console.warn(
        `Ring ${textureFilename} innerRadius (${validInner}) >= outerRadius (${validOuter}). Adjusting inner radius.`
      );
      return new THREE.RingGeometry(validOuter * 0.9, validOuter, 64);
    }
    return new THREE.RingGeometry(validInner, validOuter, 64);
  }, [innerRadius, outerRadius, textureFilename]);

  // --- UV Adjustment ---
  useEffect(() => {
    if (geometry) {
      console.log(`Adjusting Ring UVs for ${textureFilename}...`);
      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      const v3 = new THREE.Vector3();
      const radiusDiff = outerRadius - innerRadius;

      if (!pos || !uv) {
        console.warn(
          `Cannot adjust UVs for ${textureFilename}: Geometry attributes missing.`
        );
        return;
      }

      if (radiusDiff <= 0) {
        console.warn(
          `Cannot adjust UVs for ${textureFilename}: outerRadius <= innerRadius`
        );
        return;
      }

      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        const distance = v3.length();
        let u = (distance - innerRadius) / radiusDiff;
        u = Math.max(0, Math.min(1, u));
        uv.setX(i, u);
      }
      uv.needsUpdate = true;
      console.log(`Ring UVs adjusted for ${textureFilename}.`);
    }
  }, [geometry, innerRadius, outerRadius, textureFilename]);

  // --- Render based on manual texture loading state ---
  // This part executes once texture is loaded (Suspense handled it).
  // Handle potential array return type from useTexture
  // --- Render based on manual texture loading state ---
  if (loadError) {
    console.error(
      `RingsRenderer for ${textureFilename}: Rendering error placeholder due to load error: ${loadError}`
    );
    return (
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="darkred" wireframe side={THREE.DoubleSide} />
      </mesh>
    );
  }

  if (!texture) {
    console.log(
      `RingsRenderer for ${textureFilename}: Waiting for manual texture load...`
    );
    // Render placeholder while texture is loading via TextureLoader
    return (
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="yellow" wireframe side={THREE.DoubleSide} />
      </mesh>
    );
  }

  // Texture is loaded manually and valid
  console.log(
    `RingsRenderer for ${textureFilename}: Rendering mesh with manually loaded texture.`
  );

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation-x={Math.PI / 2} // Rotate ring to be horizontal relative to its parent
      receiveShadow // Re-enable receiving shadows
    >
      {/* Restore MeshStandardMaterial with texture and transparency */}
      <meshStandardMaterial
        map={texture} // Restore texture map
        side={THREE.DoubleSide}
        transparent={true} // Restore transparency for ring texture
        roughness={0.1} // Keep smooth for now
        metalness={0} // Explicitly set metalness to 0
        alphaTest={0.1} // Add alphaTest to discard nearly transparent pixels
      />
    </mesh>
  );
};

export default Rings;
