# Solar System RN

This is a solar system simulation application built using React Native and Three.js. It utilizes `@react-three/fiber` and `expo-three` to render 3D scenes on mobile and web platforms.

## ✨ Features

- Simulates the orbital motion of major planets and their moons in the solar system.
- Uses Three.js for 3D rendering.
- Built with React Native and Expo, enabling cross-platform compatibility (iOS, Android, Web).
- Written in TypeScript for type safety.

## 🛠️ Tech Stack

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [expo-gl](https://docs.expo.dev/versions/latest/sdk/gl-view/)
- [expo-three](https://docs.expo.dev/versions/latest/universe/expo-three/)

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd solar-system-rn
    ```

    _Replace `<your-repository-url>` with the actual repository URL._

2.  **Install dependencies:**
    Using `yarn` is recommended:

    ```bash
    yarn install
    ```

    Or using `npm`:

    ```bash
    npm install
    ```

3.  **Run the project:**

    - **Start the Expo development server:**

      ```bash
      yarn start
      # or
      npm start
      ```

      Then follow the prompts to open the app in the Expo Go app (iOS, Android) or a web browser.

    - **Run directly on a specific platform:**

      ```bash
      # Android
      yarn android
      # or
      npm run android

      # iOS
      yarn ios
      # or
      npm run ios

      # Web
      yarn web
      # or
      npm run web
      ```

## 📁 Project Structure

```
solar-system-rn/
├── .expo/             # Expo configuration files and cache
├── .gitignore         # Git ignore file configuration
├── App.tsx            # Application root component
├── app.json           # Expo app configuration file
├── assets/            # Static assets (images, textures, etc.)
├── index.ts           # Application entry point (managed by Expo)
├── node_modules/      # Project dependencies
├── package.json       # Project metadata and dependency management
├── src/               # Main source code directory
│   ├── components/    # Reusable React components
│   ├── constants/     # Constants and configuration files
│   ├── solar-system/  # Core logic and components for the solar system simulation
│   └── utils/         # Utility functions
├── tsconfig.json      # TypeScript configuration file
└── yarn.lock          # Yarn dependency lock file (if using Yarn)
```

## 🤝 Contributing

Issues and pull requests are welcome!

## 📄 License

(Add license information as needed, e.g., MIT)
