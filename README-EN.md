# Solar System RN (React Native Solar System Simulation)

This is a solar system simulation application built using React Native and Three.js (@react-three/fiber). It allows users to explore the planets of our solar system and their orbits on mobile devices or the web.

## ✨ Features

- Built with React Native and Expo, supporting iOS, Android, and Web platforms.
- Utilizes `@react-three/fiber` and `@react-three/drei` for 3D rendering.
- Displays major planets and their moons in the solar system.
- Simulates planetary orbital motion.
- Includes planetary textures for a more realistic visual experience.
- Supports gesture interactions (via `react-native-gesture-handler`).

## 🛠️ Tech Stack

- **Framework:** React Native, Expo
- **Language:** TypeScript
- **3D Rendering:** Three.js, @react-three/fiber, @react-three/drei, expo-three
- **UI & Interaction:** React Native Gesture Handler, @react-native-picker/picker, @react-native-community/slider

## 🚀 How to Run

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:theBigGavin/solar-system-rn.git
    cd solar-system-rn
    ```
2.  **Install dependencies:**
    ```bash
    yarn install
    # or npm install
    ```
3.  **Start the application:** - Start the Expo development server:
    `bash
      yarn start
      ` - Run on an Android device/emulator:
    `bash
      yarn android
      ` - Run on an iOS device/simulator (requires macOS and Xcode):
    `bash
      yarn ios
      ` - Run in a web browser:
    `bash
yarn web
`
    Follow the prompts in the Expo Go app or your terminal.

## 📁 Project Structure

```
solar-system-rn/
├── assets/         # Static assets like images, textures
├── src/            # Project source code
│   ├── components/ # Reusable UI and 3D components
│   ├── constants/  # Constants and configuration files (e.g., planet data)
│   ├── solar-system/ # Core logic for the solar system simulation
│   └── utils/      # Utility functions
├── App.tsx         # Root application component
├── app.json        # Expo configuration file
├── package.json    # Project dependencies and scripts
└── ...             # Other configuration files and directories
```
