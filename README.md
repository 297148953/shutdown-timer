# 定时关机 - Shutdown Timer

一个轻量级的 Windows 桌面自动定时关机应用，基于 Tauri + React 构建。

## ✨ 功能特性

- **倒计时模式**：设置 N 分钟后自动关机，支持快捷按钮
- **指定时间模式**：设置具体时间点关机，自动跨天计算
- **系统托盘**：关闭窗口最小化到托盘，后台静默运行
- **自定义背景**：支持纯色背景（可调透明度）和图片背景（多种适配模式）
- **低资源占用**：基于 Tauri，内存占用 < 50MB，安装包 < 10MB

## 🏗️ 技术栈

- **前端**：React 18 + TypeScript + Vite + Zustand
- **后端**：Rust + Tauri 2.0
- **状态管理**：Zustand
- **系统集成**：系统托盘、关机命令、配置持久化

## 📦 环境准备

### 1. 安装 Node.js (v18+)

下载地址：https://nodejs.org/

安装后验证：
```powershell
node --version
npm --version
```

### 2. 安装 Rust

下载地址：https://www.rust-lang.org/tools/install

或使用命令：
```powershell
winget install Rustlang.Rustup
```

安装后验证：
```powershell
rustc --version
cargo --version
```

### 3. 安装 WebView2（Windows 10/11 通常已自带）

下载地址：https://developer.microsoft.com/microsoft-edge/webview2/

### 4. 安装 Tauri CLI（可选，项目已包含）

```powershell
npm install -g @tauri-apps/cli
```

## 🚀 快速开始

### 安装依赖

```powershell
cd shutdown-timer
npm install
```

### 开发模式运行

```powershell
npm run tauri dev
```

### 构建生产版本

```powershell
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/msi/` 目录。

## 📁 项目结构

```
shutdown-timer/
├── src/                             # React 前端
│   ├── main.tsx                     # 入口文件
│   ├── App.tsx                      # 主应用组件
│   ├── components/
│   │   ├── CountdownPanel.tsx       # 倒计时面板
│   │   ├── ScheduledPanel.tsx       # 定时面板
│   │   ├── BackgroundSettings.tsx   # 背景设置
│   │   └── TimerDisplay.tsx         # 时间显示组件
│   ├── stores/
│   │   ├── timerStore.ts            # 定时器状态
│   │   └── configStore.ts           # 配置状态
│   ├── services/
│   │   └── ipc.ts                   # IPC 通信封装
│   ├── types/
│   │   └── index.ts                 # TypeScript 类型定义
│   ├── utils/
│   │   └── format.ts                # 时间格式化工具
│   └── styles/
│       └── global.css               # 全局样式
├── src-tauri/                       # Rust 后端
│   ├── src/
│   │   ├── main.rs                  # 主入口
│   │   ├── tray.rs                  # 系统托盘
│   │   ├── shutdown.rs              # 关机命令
│   │   ├── config.rs                # 配置存储
│   │   └── timer.rs                 # 定时器
│   ├── Cargo.toml                   # Rust 依赖
│   ├── tauri.conf.json              # Tauri 配置
│   ├── build.rs                     # 构建脚本
│   └── icons/                       # 应用图标
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 使用说明

### 倒计时模式

1. 在输入框中设置分钟数，或点击快捷按钮（10/30/60/90/120 分钟）
2. 点击「开始」启动倒计时
3. 倒计时运行中可「暂停」或「取消」
4. 最后 60 秒文字变红闪烁提醒

### 定时模式

1. 设置具体的关机时间（时:分，24 小时制）
2. 点击「启动定时」
3. 若设置的时间早于当前时间，将在第二天同一时间执行

### 系统托盘

- 点击窗口关闭按钮：最小化到托盘（不退出）
- 左键点击托盘图标：显示/隐藏主窗口
- 右键点击托盘图标：打开菜单
  - 显示主窗口
  - 取消定时
  - 立即关机
  - 退出

### 背景设置

- **纯色模式**：选择颜色 + 调节不透明度
- **图片模式**：选择本地图片，可选适配方式（拉伸/居中/覆盖/包含）
- 设置自动保存，下次启动自动恢复

## ⚙️ 配置文件位置

配置文件保存在系统应用数据目录：
```
%APPDATA%\定时关机\config.json
```

## 🔧 性能指标

| 指标 | 目标 |
|------|------|
| 冷启动时间 | < 2 秒 |
| 运行内存 | < 50MB |
| 空闲 CPU | < 1% |
| 安装包大小 | < 10MB |

## 📝 开发说明

### TDD 原则

本项目遵循测试驱动开发：
- Rust 模块包含单元测试（`cargo test`）
- 核心逻辑先写测试再实现

### 运行测试

```powershell
# Rust 单元测试
cd src-tauri
cargo test
```

## ⚠️ 注意事项

1. 关机命令使用 Windows 系统 `shutdown` 命令，关机前有 30 秒缓冲时间可取消
2. 建议首次使用时设置短时间（如 2 分钟）测试功能是否正常
3. 最小化到托盘后程序仍在运行，需从托盘菜单选择「退出」才能完全关闭

## 📄 许可证

MIT License
