import React, { useState, useEffect } from "react";
import { Environment } from "@react-three/drei/native";
import { Asset } from "expo-asset";
import { textureMap } from "../constants/textureMap";

const ENV_FILES = [
  "environment/px.png",
  "environment/nx.png",
  "environment/py.png",
  "environment/ny.png",
  "environment/pz.png",
  "environment/nz.png",
];

const SceneEnvironment: React.FC = () => {
  const [resolvedEnvUris, setResolvedEnvUris] = useState<string[] | null>(null);
  const [isLoadingEnv, setIsLoadingEnv] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadEnvAssets = async () => {
      setIsLoadingEnv(true);
      setEnvError(null);
      const uris: string[] = [];
      try {
        await Promise.all(
          ENV_FILES.map(async (filename) => {
            if (textureMap[filename]) {
              const assetModule = textureMap[filename];
              const asset = Asset.fromModule(assetModule);
              await asset.downloadAsync();
              const uriToUse = asset.localUri || asset.uri;
              if (uriToUse) {
                // 修复 Android 上路径解析问题
                uris.push(uriToUse.replace("file://", ""));
              } else {
                console.warn(`Could not get URI for ${filename}`);
                throw new Error(`Failed to resolve URI for ${filename}`); // Throw error if URI is missing
              }
            } else {
              console.warn(
                `Environment texture ${filename} not found in textureMap.`
              );
              throw new Error(`Texture ${filename} not in textureMap`); // Throw error if require is missing
            }
          })
        );

        // Check if all URIs were resolved in the correct order
        if (
          uris.length === ENV_FILES.length &&
          uris.every((uri) => typeof uri === "string")
        ) {
          if (isMounted) {
            // console.log("Resolved Environment URIs:", uris);
            setResolvedEnvUris(uris);
          }
        } else {
          throw new Error(
            "Failed to resolve all environment map URIs correctly."
          );
        }
      } catch (error: any) {
        console.error("Error loading environment assets:", error);
        if (isMounted)
          setEnvError(`Error loading environment: ${error.message}`);
      } finally {
        if (isMounted) setIsLoadingEnv(false);
      }
    };

    loadEnvAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoadingEnv) {
    // Optionally return a loader or null while loading
    return null;
  }

  if (envError || !resolvedEnvUris) {
    // Optionally return an error indicator or null
    console.error("Failed to load environment map:", envError);
    return null;
  }

  // Render the Environment component once URIs are resolved
  return <Environment files={resolvedEnvUris} background />;
};

export default SceneEnvironment;
