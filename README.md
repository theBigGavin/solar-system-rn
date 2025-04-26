# Solar System RN (太阳系模拟 React Native 版)

这是一个使用 React Native 和 Three.js 构建的太阳系模拟应用程序。它利用 `@react-three/fiber` 和 `expo-three` 在移动端和 Web 端渲染 3D 场景。

## ✨ 特性

- 模拟太阳系中主要行星及其卫星的轨道运动。
- 使用 Three.js 进行 3D 渲染。
- 基于 React Native 和 Expo，可跨平台运行 (iOS, Android, Web)。
- 使用 TypeScript 编写，提供类型安全。

## 🛠️ 技术栈

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [expo-gl](https://docs.expo.dev/versions/latest/sdk/gl-view/)
- [expo-three](https://docs.expo.dev/versions/latest/universe/expo-three/)

## 🚀 如何开始

1.  **克隆仓库:**

    ```bash
    git clone <your-repository-url>
    cd solar-system-rn
    ```

    _请将 `<your-repository-url>` 替换为实际的仓库地址。_

2.  **安装依赖:**
    推荐使用 `yarn`：

    ```bash
    yarn install
    ```

    或者使用 `npm`：

    ```bash
    npm install
    ```

3.  **运行项目:**

    - **启动 Expo 开发服务器:**

      ```bash
      yarn start
      # 或者
      npm start
      ```

      然后根据提示在 Expo Go 应用 (iOS, Android) 或 Web 浏览器中打开。

    - **直接在特定平台运行:**

      ```bash
      # Android
      yarn android
      # 或者
      npm run android

      # iOS
      yarn ios
      # 或者
      npm run ios

      # Web
      yarn web
      # 或者
      npm run web
      ```

## 📁 项目结构

```
solar-system-rn/
├── .expo/             # Expo 配置文件和缓存
├── .gitignore         # Git 忽略文件配置
├── App.tsx            # 应用根组件
├── app.json           # Expo 应用配置文件
├── assets/            # 静态资源 (图像, 纹理等)
├── index.ts           # 应用入口文件 (由 Expo 管理)
├── node_modules/      # 项目依赖
├── package.json       # 项目元数据和依赖管理
├── src/               # 主要源代码目录
│   ├── components/    # 可复用的 React 组件
│   ├── constants/     # 常量和配置文件
│   ├── solar-system/  # 太阳系模拟核心逻辑和组件
│   └── utils/         # 工具函数
├── tsconfig.json      # TypeScript 配置文件
└── yarn.lock          # Yarn 依赖锁定文件 (如果使用 Yarn)
```

## 🤝 贡献

欢迎提交问题和合并请求！

## 📄 许可证

(请根据需要添加许可证信息，例如 MIT)
