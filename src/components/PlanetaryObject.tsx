import React, { useState, useEffect, useRef, forwardRef } from "react"; // Add forwardRef
import { THREE } from "expo-three"; // 替换 three 为 expo-three
import { useTexture } from "@react-three/drei/native";
import { Asset } from "expo-asset"; // Import Asset
import { textureMap } from "../constants/textureMap";

// Define the structure of the planet data prop
export interface PlanetData {
  // Export the interface
  name: string;
  name_cn?: string; // Add Chinese name field (optional)
  radius: number;
  distance: number;
  period: number;
  daylength: number;
  type: "star" | "planet" | "moon" | "ring";
  orbits?: string;
  tilt: number;
  traversable: boolean;
  textures: {
    map?: string;
    bump?: string;
    specular?: string; // Keep for data structure, even if not used in material
    atmosphere?: string;
    atmosphereAlpha?: string;
  };
  labels?: any[];
  offset?: number;
  moonsData?: PlanetData[]; // Add optional moonsData field
  orbitalInclination?: number; // Add orbital inclination (degrees)
}

// Define Transform interface locally or import if shared
interface Transform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

// Remove old scale factors (ensure they are fully removed or commented out)
// const RADIUS_SCALE_FACTOR = 0.0001;
// const POSITION_SCALE_FACTOR = 0.1;

interface PlanetaryObjectProps {
  planetData: PlanetData;
  // Add optional position prop if needed for direct placement, but prefer groups
  position?: [number, number, number];
  // brightness: number; // Remove brightness prop
}

// Wrap component with forwardRef
const PlanetaryObject = forwardRef<THREE.Mesh, PlanetaryObjectProps>(
  (
    {
      planetData,
      position, // Use position if provided
      // brightness, // Remove brightness destructuring
    },
    ref
  ) => {
    // Add ref parameter
    // Destructure only necessary props for rendering (not animation)
    const {
      radius, // Use the raw radius here
      textures: texturesData,
      type,
      // distance, // Not needed directly in PlanetaryObject anymore
      // period, // Not needed directly in PlanetaryObject anymore
      // daylength, // Not needed directly in PlanetaryObject anymore
      // tilt, // Not needed directly in PlanetaryObject anymore
      // offset = 0, // Not needed directly in PlanetaryObject anymore
    } = planetData;

    // State for resolved URIs and loading status
    const [resolvedTextureUris, setResolvedTextureUris] = useState<{
      [key: string]: string;
    }>({});
    // State for resolved texture info (key and URI pairs)
    const [resolvedTextureInfo, setResolvedTextureInfo] = useState<
      [string, string][]
    >([]);
    const [isLoadingTextures, setIsLoadingTextures] = useState(true);
    const [textureError, setTextureError] = useState<string | null>(null);
    // const originalColor = useRef<THREE.Color | null>(null); // Remove originalColor ref

    // Remove the useFrame hook that applied transforms from the ref
    /*
  const frameCounter = useRef(0);
  useFrame(() => {
    frameCounter.current++;
    const logThisFrame = frameCounter.current % 120 === 0;

    if (meshRef.current && transformsRef.current) {
      const myTransform = transformsRef.current[planetData.name];
      if (myTransform) {
        if (logThisFrame) {
          console.log(
            `[PlanetaryObject ${planetData.name} Frame ${
              frameCounter.current
            }] Applying Pos: x=${myTransform.position.x.toFixed(
              4
            )}, z=${myTransform.position.z.toFixed(4)}`
          );
        }
        meshRef.current.position.copy(myTransform.position);
        meshRef.current.rotation.copy(myTransform.rotation);
      } else {
        // console.warn(`Transform not found for ${planetData.name}`);
      }
    }
  });
  */

    // Effect to load texture assets asynchronously (Keep this)
    useEffect(() => {
      let isMounted = true;
      const loadAllTextures = async () => {
        setIsLoadingTextures(true);
        setTextureError(null);
        const uris: { [key: string]: string } = {};
        const uriInfoList: [string, string][] = []; // Store [key, uri] pairs
        const textureKeysToLoad = Object.keys(texturesData).filter(
          (key) => texturesData[key as keyof typeof texturesData]
        ); // Get keys with filenames

        try {
          await Promise.all(
            textureKeysToLoad.map(async (key) => {
              const filename = texturesData[key as keyof typeof texturesData];
              if (typeof filename === "string" && textureMap[filename]) {
                const assetModule = textureMap[filename];
                const asset = Asset.fromModule(assetModule);
                await asset.downloadAsync();
                const uriToUse = asset.localUri || asset.uri;
                // Add check for non-empty string URI
                if (typeof uriToUse === "string" && uriToUse.trim() !== "") {
                  uris[key] = uriToUse;
                  uriInfoList.push([key, uriToUse]); // Add pair to the list
                } else {
                  // Add planet name to warning for better debugging
                  console.warn(
                    `[${planetData.name}] Could not get a valid string URI for ${filename}. Got:`,
                    uriToUse
                  );
                }
              } else if (typeof filename === "string") {
                console.warn(
                  `Texture filename "${filename}" is not in textureMap.`
                );
              } else {
                console.warn(
                  `Invalid texture filename for key ${key}: ${filename}`
                );
              }
            })
          );

          if (isMounted) {
            // setResolvedTextureUris(uris); // No longer needed
            setResolvedTextureInfo(uriInfoList); // Set the array of pairs
          }
        } catch (error: any) {
          console.error(
            `Error loading textures for ${planetData.name}:`,
            error
          );
          if (isMounted)
            setTextureError(`Error loading textures: ${error.message}`);
        } finally {
          if (isMounted) setIsLoadingTextures(false);
        }
      };

      loadAllTextures();

      return () => {
        isMounted = false;
      };
    }, [planetData.name, texturesData]); // Re-run if planetData changes

    // Remove the brightness useEffect hook entirely

    // Load textures using the resolved URIs (only if URIs are ready)
    // Extract just the URIs for useTexture
    // Filter for valid, non-empty string URIs before passing to useTexture
    const validTextureUrisToLoad = !isLoadingTextures
      ? resolvedTextureInfo
          .map(([, uri]) => uri)
          .filter(
            (uri): uri is string => typeof uri === "string" && uri.trim() !== ""
          ) // Filter for valid strings
      : [];
    // console.log(`[${planetData.name}] Valid URIs passed to useTexture:`, validTextureUrisToLoad); // Optional: Add for debugging
    const loadedTexturesArray = useTexture(validTextureUrisToLoad); // Pass filtered array

    // Apply original project's radius normalization
    // Map the loaded textures back to an object using the keys from resolvedTextureInfo
    const loadedTextures: { [key: string]: THREE.Texture | undefined } = {};
    if (!isLoadingTextures) {
      // Map loaded textures back based on the original resolvedTextureInfo,
      // but only for URIs that were actually loaded.
      let textureIndex = 0;
      resolvedTextureInfo.forEach(([key, uri]) => {
        // Only map if the URI was valid and thus loaded
        if (typeof uri === "string" && uri.trim() !== "") {
          // Ensure the index doesn't go out of bounds if filtering removed items
          if (textureIndex < loadedTexturesArray.length) {
            loadedTextures[key] = loadedTexturesArray[textureIndex];
            textureIndex++;
          } else {
            console.warn(
              `[${planetData.name}] Texture index out of bounds for key ${key}. This might indicate an issue with filtering or loading.`
            );
          }
        }
      });
    }
    const scaledRadius = Math.sqrt(radius) / 500; // Apply correct scaling
    // Increase segments for smoother spheres
    const geometryArgs: [number, number, number] = [scaledRadius, 64, 64]; // Use normalized radius and increased segments

    // Show loading indicator (e.g., wireframe) or error
    if (isLoadingTextures) {
      return (
        <mesh>
          <sphereGeometry args={geometryArgs} />
          <meshBasicMaterial color="lightblue" wireframe />
        </mesh>
      );
    }
    if (textureError) {
      return (
        <mesh>
          <sphereGeometry args={geometryArgs} />
          <meshBasicMaterial color="pink" wireframe />
        </mesh>
      );
    }

    // Ensure textures object has the expected structure even if some failed
    const finalTextures: { [key: string]: THREE.Texture | "" } = {};
    Object.keys(texturesData).forEach((key) => {
      const tex = loadedTextures[key];
      if (tex instanceof THREE.Texture) {
        finalTextures[key] = tex;
      } else {
        finalTextures[key] = "";
      }
    });

    // Force update on loaded textures
    Object.values(finalTextures).forEach((texture) => {
      if (texture instanceof THREE.Texture) {
        texture.needsUpdate = true;
      }
    });

    return (
      // Return only the mesh
      <mesh
        ref={ref} // Use the forwarded ref here
        position={position} // Apply position if passed as prop
        // Apply tilt directly here based on planetData
        // Tilt is now handled by the parent group in SolarSystem.tsx
        // Rotation order might be important depending on how tilt interacts with potential future rotation
        // rotation-order="YXZ" // Example if needed later
        // --- Shadow Casting/Receiving ---
        castShadow={planetData.type === "moon"} // Moons cast shadows
        receiveShadow={
          planetData.type === "planet" || planetData.type === "moon"
        } // Planets and Moons receive shadows
      >
        <sphereGeometry args={geometryArgs} />
        {/* Star material */}
        {type === "star" ? (
          <meshBasicMaterial
            map={finalTextures.map || undefined}
            // Increase color values significantly to simulate intense brightness
            color={new THREE.Color(5, 5, 4)} // Very bright yellowish white
            transparent={false}
            toneMapped={false} // Disable tone mapping for a brighter look
          />
        ) : (
          // Planet/Moon material
          <meshStandardMaterial
            map={finalTextures.map || undefined}
            bumpMap={finalTextures.bump || undefined}
            // specularMap removed - StandardMaterial doesn't use it directly like Phong
            // Use scaledRadius for bumpScale, similar to original project?
            bumpScale={finalTextures.bump ? 0.2 : 0} // Increased bumpScale for visibility
            // Add metalness and roughness if desired for PBR look
            // metalness={0.1}
            // roughness={0.8}
          />
        )}
        {/* Add atmosphere mesh for Earth */}
        {planetData.name === "Earth" &&
          finalTextures.atmosphere &&
          finalTextures.atmosphereAlpha && (
            <mesh>
              {/* Slightly larger sphere for atmosphere, also increase segments */}
              <sphereGeometry args={[scaledRadius + 0.0005, 64, 64]} />
              <meshStandardMaterial // Or MeshPhongMaterial if preferred
                map={finalTextures.atmosphere}
                alphaMap={finalTextures.atmosphereAlpha}
                transparent={true}
                // Optional: Adjust opacity, blending, etc. if needed
                // opacity={0.8}
                // depthWrite={false} // May help with transparency sorting
              />
            </mesh> // Add name for easier selection if needed later
          )}
        {/* Rings are handled separately in SolarSystem.tsx */}
      </mesh>
    );
  }
); // Close forwardRef

export default PlanetaryObject;

// Remove the findMoonsForPlanet helper, as SolarSystem will handle filtering
/*
export const findMoonsForPlanet = (
  planetName: string,
  allData: PlanetData[]
): PlanetData[] => {
  return allData.filter(
    (item) => item.type === "moon" && item.orbits === planetName
  );
};
*/
