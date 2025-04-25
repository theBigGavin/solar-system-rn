import React, { Suspense, useRef, useState, useEffect } from "react"; // Add useEffect import
import { Canvas } from "@react-three/fiber/native";
import { THREE } from "expo-three"; // 替换 three 为 expo-three
import { PerspectiveCamera, OrbitControls } from "@react-three/drei/native";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Import React Native components for UI
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native"; // Added Platform
import Slider from "@react-native-community/slider"; // Import Slider

// Import PlanetaryObject component and planet data
import { PlanetData } from "../components/PlanetaryObject";
import SceneEnvironment from "../components/SceneEnvironment";
import allPlanetDataJson from "../constants/planets.json";

import CameraController from "../utils/CameraControl";
import AnimatedSystem from "../components/AnimatedSystem";

// Type assertion for the imported JSON data
const allPlanetData = allPlanetDataJson as PlanetData[];

export default function SolarSystem() {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [brightness, setBrightness] = useState(33.33); // State for brightness (now controls light intensity multiplier)
  // console.log(`SolarSystem Initial Mount - Brightness State: ${brightness}`); // Remove log
  const [timeScale, setTimeScale] = useState(1); // State for time scale factor

  const meshRefs = useRef<{ [key: string]: THREE.Mesh | null }>({});
  const orbitRefs = useRef<{ [key: string]: THREE.Group | null }>({});
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const pointLightRef = useRef<THREE.PointLight>(null); // Ref for the main light
  const baseLightIntensity = 10; // Increase base intensity significantly

  const selectableTargetsList = [
    { name: "View Solar System", value: null },
    ...allPlanetData
      .filter(
        (p) =>
          (p.type === "planet" || p.type === "moon" || p.type === "star") &&
          p.traversable !== false
      )
      .map((p) => ({ name: p.name, value: p.name })),
  ];

  const goToNextTarget = () => {
    const nextIndex = (currentTargetIndex + 1) % selectableTargetsList.length;
    setCurrentTargetIndex(nextIndex);
    setSelectedTarget(selectableTargetsList[nextIndex].value);
  };

  const goToPreviousTarget = () => {
    const prevIndex =
      (currentTargetIndex - 1 + selectableTargetsList.length) %
      selectableTargetsList.length;
    setCurrentTargetIndex(prevIndex);
    setSelectedTarget(selectableTargetsList[prevIndex].value);
  };

  const currentTargetDisplayName =
    selectableTargetsList[currentTargetIndex]?.name;

  // Effect to update light intensity based on brightness slider
  useEffect(() => {
    // Update light intensity
    if (pointLightRef.current) {
      const newIntensity = baseLightIntensity * brightness;
      pointLightRef.current.intensity = newIntensity;
      // console.log(
      //   `Updating light intensity: base=${baseLightIntensity}, brightness=${brightness.toFixed(
      //     2
      //   )}, newIntensity=${newIntensity.toFixed(2)}`
      // ); // Remove log
    }
    // else { // Remove ref check log and isInitialMount ref
    //   console.log("PointLight ref not yet available.");
    // }
  }, [brightness, pointLightRef]); // Rerun when brightness changes OR pointLightRef becomes available

  return (
    <View style={styles.container}>
      <Canvas
        gl={{
          antialias: true,
          debug: {
            checkShaderErrors: true,
            onShaderError: null,
          },
        }}
        style={styles.canvas}
      >
        {/* Environment */}
        <Suspense fallback={null}>
          <SceneEnvironment />
        </Suspense>
        {/* Render the animated system */}
        <Suspense fallback={null}>
          <AnimatedSystem
            meshRefs={meshRefs}
            orbitRefs={orbitRefs}
            timeScale={timeScale} // Pass timeScale state down
            // brightness={brightness} // Remove passing brightness down
          />
        </Suspense>
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          fov={75}
          near={0.2}
          far={10000}
          position={[0, 10, 25]}
        />
        {/* Lights */}
        <ambientLight intensity={0.2} /> {/* Restore ambient light */}
        <pointLight
          ref={pointLightRef} // Assign ref to the point light
          position={[0, 0, 0]}
          // Set initial intensity based on initial brightness state
          intensity={baseLightIntensity * brightness}
          decay={2} // Restore default light decay
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={1.5}
          shadow-camera-far={500}
          shadow-radius={16}
        />
        {/* OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={200}
        />
        {/* Camera Controller */}
        <CameraController
          targetName={selectedTarget}
          meshRefs={meshRefs}
          controlsRef={controlsRef}
        />
        {/* Stats - Commented out */}
        {/* <Stats /> */}
      </Canvas>

      {/* Brightness Slider UI */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Brightness:</Text>
        <Slider
          style={styles.slider}
          minimumValue={1.0} // Min brightness multiplier
          maximumValue={50.0} // Max brightness multiplier
          step={0.05}
          value={brightness}
          onValueChange={setBrightness}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#AAAAAA"
          thumbTintColor={Platform.OS === "android" ? "#FFFFFF" : undefined} // Style thumb for Android
        />
        <Text style={styles.sliderValue}>{brightness.toFixed(2)}</Text>
      </View>

      {/* Time Scale Slider UI */}
      <View style={styles.timeScaleSliderContainer}>
        <Text style={styles.sliderLabel}>Time Scale:</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.1} // Min time scale (0.1 day/sec)
          maximumValue={50} // Max time scale (50 days/sec)
          step={1}
          value={timeScale}
          onValueChange={setTimeScale}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#AAAAAA"
          thumbTintColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
        />
        <Text style={styles.sliderValue}>{timeScale.toFixed(0)}</Text>
      </View>

      {/* Camera Control UI */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={goToPreviousTarget}
          style={styles.arrowButton}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.targetNameText}>{currentTargetDisplayName}</Text>
        <TouchableOpacity onPress={goToNextTarget} style={styles.arrowButton}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  canvas: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: "rgba(50, 50, 50, 0.85)",
    borderRadius: 8,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  targetNameText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 90, // Position above the target controls
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: "rgba(50, 50, 50, 0.85)",
    borderRadius: 8,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  sliderLabel: {
    color: "#FFF",
    fontSize: 14,
    marginRight: 10,
  },
  slider: {
    flex: 1,
    height: 40, // Ensure slider is tall enough to grab easily
  },
  sliderValue: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 10,
    minWidth: 35, // Ensure space for the value text
    textAlign: "right",
  },
  // Style for the new time scale slider container
  timeScaleSliderContainer: {
    position: "absolute",
    bottom: 140, // Position above the brightness slider
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: "rgba(50, 50, 50, 0.85)",
    borderRadius: 8,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
});
