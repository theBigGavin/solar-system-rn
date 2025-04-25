import React, { useRef } from "react"; // Import useRef
import { useFrame, useThree } from "@react-three/fiber/native";
import { THREE } from "expo-three"; // 替换 three 为 expo-three
import { useTexture } from "@react-three/drei/native"; // Import useTexture

// Import PlanetaryObject component and planet data
import PlanetaryObject, { PlanetData } from "./PlanetaryObject";
import Rings from "./Rings";
import OrbitalPath from "./OrbitalPath";
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
  // Use a higher exponent (0.6) and adjust divisor to better differentiate sizes
  return Math.pow(radius, 0.6) / 1000;
};

// --- Animated Solar System Assembly ---
const AnimatedSystem = ({
  meshRefs,
  orbitRefs, // Renaming for clarity: these are planet orbits around the sun
  timeScale, // Add timeScale to props
}: {
  meshRefs: React.MutableRefObject<{ [key: string]: THREE.Mesh | null }>;
  orbitRefs: React.MutableRefObject<{ [key: string]: THREE.Group | null }>; // Planet orbits
  timeScale: number; // Define the type for timeScale prop
  // brightness: number; // Remove brightness prop type
}) => {
  // Ref to store accumulated simulated time
  const accumulatedSimulatedDays = useRef(0);

  // Refs for moon orbits around planets
  const moonOrbitRefs = React.useRef<{ [key: string]: THREE.Group | null }>({});

  // Load glow texture for the Sun (assuming 'assets/textures/glow.png' exists)
  // Note: Error handling for texture loading is omitted for brevity.
  // If the texture doesn't load, the sprite won't render.
  let glowTexture: THREE.Texture | null = null;
  try {
    // It's safer to load textures conditionally or handle errors,
    // but for this example, we'll assume it loads.
    // useTexture needs to be called unconditionally at the top level.
    const loadedGlowTexture = useTexture("assets/textures/glow.png");
    if (loadedGlowTexture) {
      glowTexture = loadedGlowTexture;
    }
  } catch (e) {
    console.warn("Could not load glow texture 'assets/textures/glow.png':", e);
  }

  // Type assertion for the imported JSON data
  const allPlanetData = allPlanetDataJson as PlanetData[];
  const sunData = allPlanetData.find((p) => p.type === "star");
  const saturnRingData = allPlanetData.find((p) => p.type === "ring");

  if (!sunData) {
    console.error("Sun data not found!");
    return null;
  }

  useFrame(({ clock }, delta) => {
    // Get delta time from useFrame
    // Calculate simulated days passed in this frame
    const frameSimulatedDays = delta * timeScale;
    // Accumulate the simulated days
    accumulatedSimulatedDays.current += frameSimulatedDays;

    // Use the accumulated simulated days for calculations
    const currentSimulatedDays = accumulatedSimulatedDays.current;

    allPlanetData.forEach((body) => {
      // --- Planet Orbit Calculation (around Sun) ---
      if (body.type === "planet" && body.period && body.orbits === "Sun") {
        const planetOrbitGroupRef = orbitRefs.current[body.name];
        if (planetOrbitGroupRef && body.period > 0) {
          const orbitFraction = currentSimulatedDays / body.period; // Use accumulated days
          const orbitAngle =
            orbitFraction * Math.PI * 2 + degreesToRadians(body.offset || 0);
          planetOrbitGroupRef.rotation.y = orbitAngle;
        }
      }

      // --- Moon Orbit Calculation (around Planet) ---
      if (body.type === "moon" && body.period && body.orbits) {
        const moonOrbitGroupRef = moonOrbitRefs.current[body.name];
        if (moonOrbitGroupRef && body.period > 0) {
          const orbitFraction = currentSimulatedDays / body.period; // Use accumulated days
          const orbitAngle =
            orbitFraction * Math.PI * 2 + degreesToRadians(body.offset || 0);
          moonOrbitGroupRef.rotation.y = orbitAngle;
        }
      }

      // --- Body Rotation Calculation (Self-rotation) ---
      if (body.type !== "ring" && body.daylength) {
        const meshRef = meshRefs.current[body.name];
        if (meshRef && body.daylength !== 0) {
          // Convert daylength from hours to days
          const dayLengthInDays = body.daylength / 24;
          // Calculate rotation angle based on accumulated simulated days
          const rotationFraction = currentSimulatedDays / dayLengthInDays; // Use accumulated days
          const rotationAngle = rotationFraction * Math.PI * 2;
          meshRef.rotation.y = rotationAngle;

          // Removed logging for Mercury/Venus
        }
        // Removed logging for Mercury/Venus skip case
      }
    });
  });

  // Calculate normalized radius for sun to scale the glow sprite
  const sunNormalizedRadius = sunData ? normalizeRadius(sunData.radius) : 0.1; // Use the same normalization as PlanetaryObject
  const glowScaleFactor = 6; // Adjust this factor to control glow size
  const glowScale: [number, number, number] = [
    sunNormalizedRadius * glowScaleFactor,
    sunNormalizedRadius * glowScaleFactor,
    1, // Scale for sprite is 2D
  ];

  return (
    <>
      {/* Sun */}
      <PlanetaryObject
        ref={(el) => (meshRefs.current[sunData.name] = el)}
        planetData={sunData}
        position={[0, 0, 0]}
        // brightness={brightness} // Remove passing brightness to Sun
      />
      {/* Sun Glow Sprite - Renders only if glowTexture loaded successfully */}
      {glowTexture && sunData && (
        <sprite position={[0, 0, 0]} scale={glowScale}>
          <spriteMaterial
            map={glowTexture}
            blending={THREE.AdditiveBlending} // Make it additive for glow effect
            transparent={true}
            depthWrite={false} // Don't block objects behind it
            opacity={0.75} // Adjust opacity for desired intensity
            color={0xffffcc} // Tint the glow slightly yellowish
          />
        </sprite>
      )}

      {/* Planets, Moons, Rings */}
      {allPlanetData
        .filter((p) => p.type === "planet")
        .map((planet) => {
          const scaledDistance = normalizeDistance(planet.distance);
          const planetPositionInGroup: [number, number, number] = [
            scaledDistance,
            0,
            0,
          ];
          const moons = allPlanetData.filter(
            (m) => m.type === "moon" && m.orbits === planet.name
          );
          const ringsData = planet.name === "Saturn" ? saturnRingData : "";

          return (
            <group
              key={planet.name}
              ref={(el) => (orbitRefs.current[planet.name] = el)}
              position={[0, 0, 0]}
            >
              {/* Planet */}
              <PlanetaryObject
                ref={(el) => (meshRefs.current[planet.name] = el)}
                planetData={planet}
                position={planetPositionInGroup}
                // brightness={brightness} // Remove passing brightness to Planet
              />
              {/* Add a local light for Saturn and its rings if it's Saturn */}
              {planet.name === "Saturn" && (
                <pointLight
                  position={[
                    scaledDistance,
                    normalizeRadius(planet.radius) * 0.5,
                    0,
                  ]} // Position slightly above Saturn
                  intensity={3.0} // Increase local light intensity significantly
                  distance={normalizeRadius(planet.radius) * 3} // Limit range to roughly rings extent
                  decay={2} // Default decay
                  color="#ffffff"
                  castShadow={false} // Don't cast shadows from this local light
                />
              )}
              {/* Moons - Now with their own orbit groups */}
              {moons.map((moon) => {
                const scaledMoonDistance = normalizeDistance(moon.distance);
                const moonScaleFactor = 0.8; // Increase factor again (from 0.5)
                // Position of the moon *within* its own orbit group
                const moonYOffset = 0.05; // Small offset to lift moon orbit above ring plane
                const moonPositionInItsOrbit: [number, number, number] = [
                  scaledMoonDistance * moonScaleFactor, // Apply the extra scaling factor
                  moonYOffset, // Add Y offset
                  0,
                ];

                // Calculate adjusted distance for path *before* returning JSX
                const visualMoonDistanceForPath =
                  moon.distance * Math.pow(moonScaleFactor, 2.5);

                return (
                  // Moon's orbit group, positioned at the planet's location within the planet's orbit group
                  <group
                    key={`${moon.name}-orbit`}
                    ref={(el) => (moonOrbitRefs.current[moon.name] = el)}
                    position={planetPositionInGroup} // Position the moon's orbit center at the planet's position
                  >
                    {/* The Moon itself, positioned relative to its orbit center */}
                    <PlanetaryObject
                      key={moon.name}
                      ref={(el) => (meshRefs.current[moon.name] = el)}
                      planetData={moon}
                      position={moonPositionInItsOrbit} // Position the moon away from its orbit center
                      // brightness={brightness} // Remove passing brightness to Moon
                    />
                    {/* Add Orbital Path for the moon */}
                    <group position={[0, moonYOffset, 0]}>
                      {" "}
                      {/* Apply Y offset to the path group */}
                      <OrbitalPath
                        key={`${moon.name}-path`}
                        distance={visualMoonDistanceForPath} // Pass adjusted distance
                        // Optional: Use a different color or style for moon paths if desired
                        // color={0x888888}
                      />
                    </group>
                  </group>
                );
              })}
              {/* Rings - Positioned relative to the planet */}
              {/* Improved type check for ringsData */}
              {planet.name === "Saturn" &&
                ringsData && // Ensure ringsData exists
                typeof ringsData !== "string" && // Ensure it's not the empty string ""
                ringsData.textures?.map && ( // Ensure textures and map exist
                  // Wrap Rings in a group and apply position to the group
                  <group position={planetPositionInGroup}>
                    <Rings
                      textureFilename={ringsData.textures.map}
                      innerRadius={normalizeRadius(planet.radius) * 1.2}
                      outerRadius={normalizeRadius(planet.radius) * 2.5}
                      tilt={degreesToRadians(planet.tilt)}
                    />
                  </group>
                )}
            </group>
          );
        })}

      {/* Orbital Paths */}
      {allPlanetData
        .filter((p) => p.type === "planet")
        .map((planet) => (
          <OrbitalPath key={`${planet.name}-path`} distance={planet.distance} />
        ))}

      {/* Add the Asteroid Belt */}
      <AsteroidBelt
        innerRadius={9.5} // Between Mars (8.8) and Jupiter (13.0) normalized distance
        outerRadius={12.5}
        count={5000} // Number of asteroids
        particleSize={0.01} // Adjust size as needed
        thickness={0.2} // Adjust vertical spread
      />
    </>
  );
};

export default AnimatedSystem;
