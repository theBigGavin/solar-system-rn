# Solar System RN (太阳系模拟 React Native 应用)

这是一个使用 React Native 和 Three.js (@react-three/fiber) 构建的太阳系模拟应用程序。它允许用户在移动设备或 Web 上探索太阳系的行星及其轨道。

## 预览
<img width="1680" alt="image" src="https://github.com/user-attachments/assets/ea8ffc4d-2c2f-46c6-ac58-8be01e304e9b" />
https://thebiggavin.github.io/solar-system-rn/

## ✨ 特性

- 基于 React Native 和 Expo 构建，支持 iOS、Android 和 Web 平台。
- 使用 `@react-three/fiber` 和 `@react-three/drei` 进行 3D 渲染。
- 展示太阳系中的主要行星及其卫星。
- 模拟行星的轨道运动。
- 包含行星纹理贴图，提供更逼真的视觉效果。
- 支持手势交互（通过 `react-native-gesture-handler`）。

## 🛠️ 技术栈

- **框架:** React Native, Expo
- **语言:** TypeScript
- **3D 渲染:** Three.js, @react-three/fiber, @react-three/drei, expo-three
- **UI & 交互:** React Native Gesture Handler, @react-native-picker/picker, @react-native-community/slider

## 🚀 如何运行

1.  **克隆仓库:**
    ```bash
    git clone git@github.com:theBigGavin/solar-system-rn.git
    cd solar-system-rn
    ```
2.  **安装依赖:**
    ```bash
    yarn install
    # 或者 npm install
    ```
3.  **启动应用:** - 启动 Expo 开发服务器:
    `bash
      yarn start
      ` - 在 Android 设备/模拟器上运行:
    `bash
      yarn android
      ` - 在 iOS 设备/模拟器上运行 (需要 macOS 和 Xcode):
    `bash
      yarn ios
      ` - 在 Web 浏览器中运行:
    `bash
yarn web
`
    根据 Expo Go 应用或终端中的提示进行操作。

## 📁 项目结构

```
solar-system-rn/
├── assets/         # 存放图片、纹理等静态资源
├── src/            # 项目源代码
│   ├── components/ # 可复用的 UI 和 3D 组件
│   ├── constants/  # 常量和配置文件 (如行星数据)
│   ├── solar-system/ # 太阳系模拟核心逻辑
│   └── utils/      # 工具函数
├── App.tsx         # 应用根组件
├── app.json        # Expo 配置文件
├── package.json    # 项目依赖和脚本
└── ...             # 其他配置文件和目录
```
