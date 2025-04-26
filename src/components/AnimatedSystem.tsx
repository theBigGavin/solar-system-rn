import React, { useRef, useState, useEffect } from "react"; // Import useRef, useState, useEffect
import { useFrame } from "@react-three/fiber/native";
import { THREE } from "expo-three"; // 替换 three 为 expo-three
import { useTexture } from "@react-three/drei/native"; // Import useTexture
import { Asset } from "expo-asset"; // Import Asset
import { textureMap } from "../constants/textureMap"; // Import textureMap

// Import PlanetaryObject component and planet data
import PlanetaryObject, { PlanetData } from "./PlanetaryObject";
import Rings from "./Rings";
import OrbitalPath from "./OrbitalPath"; // OrbitalPath no longer takes inclination prop
import AsteroidBelt from "./AsteroidBelt"; // Import AsteroidBelt
import allPlanetDataJson from "../constants/planets.json";

const degreesToRadians = (degrees: number): number => {
  return THREE.MathUtils.degToRad(degrees);
};

const normalizeDistance = (distance: number): number => {
  if (distance <= 0) return 0;
  return Math.pow(distance, 0.4);
};

// --- Normalization Functions ---
const normalizeRadius = (radius: number): number => {
  if (radius <= 0) return 0.01;
  return Math.pow(radius, 0.6) / 1000;
};

// --- Animated Solar System Assembly ---
const AnimatedSystem = ({
  meshRefs,
  orbitRefs, // These refs now point to the REVOLUTION group
  timeScale,
}: {
  meshRefs: React.MutableRefObject<{ [key: string]: THREE.Mesh | null }>;
  orbitRefs: React.MutableRefObject<{ [key: string]: THREE.Group | null }>; // Planet/Moon revolution groups
  timeScale: number;
}) => {
  const accumulatedSimulatedDays = useRef(0);
  const moonOrbitRefs = React.useRef<{ [key: string]: THREE.Group | null }>({});

  const [glowTextureUri, setGlowTextureUri] = useState<string | null>(null);
  const [isLoadingGlow, setIsLoadingGlow] = useState(true);
  const [glowError, setGlowError] = useState<string | null>(null);

  // Effect to load glow texture
  useEffect(() => {
    let isMounted = true;
    const loadGlowTexture = async () => {
      setIsLoadingGlow(true);
      setGlowError(null);
      try {
        const assetModule = textureMap["glow.png"];
        if (assetModule) {
          const asset = Asset.fromModule(assetModule);
          await asset.downloadAsync();
          const uriToUse = asset.localUri || asset.uri;
          if (
            isMounted &&
            typeof uriToUse === "string" &&
            uriToUse.trim() !== ""
          ) {
            setGlowTextureUri(uriToUse);
          } else if (isMounted) {
            console.warn(
              "Could not get a valid string URI for glow.png. Got:",
              uriToUse
            );
            setGlowError("Failed to get glow texture URI");
          }
        } else {
          console.warn("glow.png not found in textureMap.");
          if (isMounted) setGlowError("glow.png not in textureMap");
        }
      } catch (error: any) {
        console.error("Error loading glow texture:", error);
        if (isMounted) setGlowError(`Error loading glow: ${error.message}`);
      } finally {
        if (isMounted) setIsLoadingGlow(false);
      }
    };

    loadGlowTexture();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once

  // Load texture using the hook only when URI is ready
  const glowTextureArray = useTexture(glowTextureUri ? [glowTextureUri] : []);
  const glowTexture =
    glowTextureUri && glowTextureArray.length > 0 ? glowTextureArray[0] : null;

  const allPlanetData = allPlanetDataJson as PlanetData[];
  const sunData = allPlanetData.find((p) => p.type === "star");
  const saturnRingData = allPlanetData.find((p) => p.type === "ring");

  if (!sunData) {
    console.error("Sun data not found!");
    return null;
  }

  useFrame(({ clock }, delta) => {
    const frameSimulatedDays = delta * timeScale;
    accumulatedSimulatedDays.current += frameSimulatedDays;
    const currentSimulatedDays = accumulatedSimulatedDays.current;

    allPlanetData.forEach((body) => {
      // Planet Revolution
      if (body.type === "planet" && body.period && body.orbits === "Sun") {
        const planetRevolutionGroupRef = orbitRefs.current[body.name];
        if (planetRevolutionGroupRef && body.period > 0) {
          const orbitFraction = currentSimulatedDays / body.period;
          const orbitAngle =
            orbitFraction * Math.PI * 2 + degreesToRadians(body.offset || 0);
          planetRevolutionGroupRef.rotation.y = orbitAngle;
        }
      }

      // Moon Revolution
      if (body.type === "moon" && body.period && body.orbits) {
        const moonRevolutionGroupRef = moonOrbitRefs.current[body.name];
        if (moonRevolutionGroupRef && body.period > 0) {
          const orbitFraction = currentSimulatedDays / body.period;
          const orbitAngle =
            orbitFraction * Math.PI * 2 + degreesToRadians(body.offset || 0);
          moonRevolutionGroupRef.rotation.y = orbitAngle;
        }
      }

      // Body Rotation (Self-rotation on Mesh)
      if (body.type !== "ring" && body.daylength) {
        const meshRef = meshRefs.current[body.name];
        if (meshRef && body.daylength !== 0) {
          const dayLengthInDays = body.daylength / 24;
          const rotationFraction = currentSimulatedDays / dayLengthInDays;
          const rotationAngle = rotationFraction * Math.PI * 2;
          meshRef.rotation.y = rotationAngle;
        }
      }
    });
  });

  const sunNormalizedRadius = sunData ? normalizeRadius(sunData.radius) : 0.1;
  const glowScaleFactor = 2.5; // Adjust this value to change the glow size
  const glowScale: [number, number, number] = [
    sunNormalizedRadius * glowScaleFactor,
    sunNormalizedRadius * glowScaleFactor,
    1,
  ];

  return (
    <>
      {/* Sun */}
      <PlanetaryObject
        ref={(el) => (meshRefs.current[sunData.name] = el)}
        planetData={sunData}
        position={[0, 0, 0]}
      />
      {/* Sun Glow Sprite */}
      {glowTexture && sunData && (
        <sprite position={[0, 0, 0]} scale={glowScale}>
          <spriteMaterial
            map={glowTexture}
            blending={THREE.AdditiveBlending}
            transparent={true}
            depthWrite={false}
            opacity={0.75}
            color={0xffffcc}
          />
        </sprite>
      )}

      {/* Planets, Moons, Rings, and their Orbital Paths */}
      {allPlanetData
        .filter((p) => p.type === "planet")
        .map((planet) => {
          const scaledDistance = normalizeDistance(planet.distance);
          const planetPositionInRevolutionGroup: [number, number, number] = [
            scaledDistance,
            0,
            0,
          ];
          const moons = allPlanetData.filter(
            (m) => m.type === "moon" && m.orbits === planet.name
          );
          const ringsData =
            planet.name === "Saturn" ? saturnRingData : undefined;

          return (
            // Group for Orbital Inclination (Static) - Applies to Planet, Moons, and Planet's Path
            <group
              key={`${planet.name}-inclination`}
              rotation={[
                degreesToRadians(planet.orbitalInclination || 0),
                0,
                0,
              ]}
            >
              {/* Planet's Orbital Path (Inside Inclination Group) */}
              <OrbitalPath
                key={`${planet.name}-path`}
                distance={planet.distance} // Use original distance for path radius
                // No inclination prop needed here
              />

              {/* Group for Revolution Animation (Dynamic) - Contains Planet Tilt Group and Moon Systems */}
              <group
                key={`${planet.name}-revolution`}
                ref={(el) => (orbitRefs.current[planet.name] = el)}
                position={[0, 0, 0]}
              >
                {/* Group for Axial Tilt and Contents (Planet, Rings, Local Light) */}
                <group
                  key={`${planet.name}-tilt`}
                  position={planetPositionInRevolutionGroup}
                  rotation={[0, 0, degreesToRadians(planet.tilt)]}
                >
                  {/* Planet Mesh */}
                  <PlanetaryObject
                    key={planet.name}
                    ref={(el) => (meshRefs.current[planet.name] = el)}
                    planetData={planet}
                    position={[0, 0, 0]}
                  />

                  {/* Saturn's Local Light */}
                  {planet.name === "Saturn" && (
                    <pointLight
                      position={[0, normalizeRadius(planet.radius) * 0.5, 0]}
                      intensity={3.0}
                      distance={normalizeRadius(planet.radius) * 3}
                      decay={2}
                      color="#ffffff"
                      castShadow={false}
                    />
                  )}

                  {/* Saturn's Rings */}
                  {planet.name === "Saturn" &&
                    ringsData &&
                    ringsData.textures?.map && (
                      <Rings
                        textureFilename={ringsData.textures.map}
                        innerRadius={normalizeRadius(planet.radius) * 0.9}
                        outerRadius={normalizeRadius(planet.radius) * 1.2}
                      />
                    )}
                </group>

                {/* Moon Systems (Positioned relative to Planet's Revolution Group) */}
                {moons.map((moon) => {
                  const scaledMoonDistance = normalizeDistance(moon.distance);
                  const moonScaleFactor = 0.8;
                  const moonYOffset = 0.05; // Keep Y offset for visual separation
                  const moonPositionInRevolutionGroup: [
                    number,
                    number,
                    number
                  ] = [scaledMoonDistance * moonScaleFactor, moonYOffset, 0];
                  const visualMoonDistanceForPath =
                    moon.distance * Math.pow(moonScaleFactor, 2.5);

                  return (
                    // Position the entire moon system relative to the planet's position in its revolution group
                    <group
                      key={`${moon.name}-system`}
                      position={planetPositionInRevolutionGroup}
                    >
                      {/* Group for Moon Orbital Inclination (Static relative to planet's orbit plane) - Applies to Moon Revolution and Path */}
                      <group
                        key={`${moon.name}-inclination`}
                        rotation={[
                          degreesToRadians(moon.orbitalInclination || 0),
                          0,
                          0,
                        ]}
                      >
                        {/* Moon's Orbital Path (Inside Moon Inclination Group) */}
                        <group position={[0, moonYOffset, 0]}>
                          {" "}
                          {/* Apply Y offset to path group */}
                          <OrbitalPath
                            key={`${moon.name}-path`}
                            distance={visualMoonDistanceForPath} // Use visually adjusted distance
                            // No inclination prop needed here
                          />
                        </group>

                        {/* Group for Moon Revolution Animation (Dynamic) */}
                        <group
                          key={`${moon.name}-revolution`}
                          ref={(el) => (moonOrbitRefs.current[moon.name] = el)}
                          position={[0, 0, 0]}
                        >
                          {/* Group for Moon Axial Tilt */}
                          <group
                            key={`${moon.name}-tilt`}
                            position={moonPositionInRevolutionGroup} // Position relative to revolution center
                            rotation={[0, 0, degreesToRadians(moon.tilt)]}
                          >
                            {/* The Moon Mesh */}
                            <PlanetaryObject
                              key={moon.name}
                              ref={(el) => (meshRefs.current[moon.name] = el)}
                              planetData={moon}
                              position={[0, 0, 0]}
                            />
                          </group>
                        </group>
                      </group>
                    </group>
                  );
                })}
              </group>
            </group>
          );
        })}

      {/* Asteroid Belt (Remains flat for now) */}
      <AsteroidBelt
        innerRadius={9.5}
        outerRadius={12.5}
        count={5000}
        particleSize={0.01}
        thickness={0.2}
      />
    </>
  );
};

export default AnimatedSystem;
