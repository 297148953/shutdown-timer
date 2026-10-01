# 定时关机 - Shutdown Timer

一个轻量级的 Windows 桌面自动定时关机应用，基于 Tauri 2.0 + React 构建。内存占用低于 50MB，安装包体积小于 10MB。

## 功能特性

- **倒计时模式** — 设置 N 分钟后自动关机，支持快捷按钮（10/30/60/90/120 分钟）
- **指定时间模式** — 设置具体时间点关机，若时间已过则自动顺延至次日
- **系统托盘** — 关闭窗口最小化到托盘，后台静默运行，左键切换显示状态，右键打开菜单
- **暂停/继续** — 倒计时运行中可随时暂停和恢复
- **自定义背景** — 支持纯色背景（可调透明度）和图片背景（拉伸/居中/覆盖/包含四种适配模式）
- **关机前确认** — 倒计时结束时弹出确认窗口，有 30 秒缓冲时间可取消
- **配置持久化** — 背景设置、关闭行为等配置自动保存，下次启动自动恢复
- **低资源占用** — 基于 Tauri，运行内存 < 50MB，空闲 CPU < 1%

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 状态管理 | Zustand |
| 桌面框架 | Tauri 2.0 |
| 后端语言 | Rust |
| 系统集成 | 托盘图标、关机命令、文件系统 |

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **Rust** ≥ 1.70（通过 rustup 安装）
- **WebView2** — Windows 10/11 通常已自带，若缺失请从 [Microsoft 官网](https://developer.microsoft.com/microsoft-edge/webview2/) 安装

### 安装依赖

```bash
cd shutdown-timer
npm install
```

### 开发模式

```bash
npm run tauri dev
```

首次启动会下载 Rust 依赖并编译，需要几分钟时间。

### 构建生产版本

```bash
npm run tauri build
```

构建完成后，MSI 安装包位于：

```
src-tauri/target/release/bundle/msi/
```

## 使用说明

### 倒计时模式

1. 在输入框中设置分钟数，或点击快捷按钮
2. 点击「开始」启动倒计时
3. 运行中可「暂停」或「取消」
4. 剩余 60 秒时时间显示变红，提醒即将关机
5. 倒计时结束后弹出确认窗口，系统将在 30 秒后关机，可手动取消

### 定时模式

1. 设置具体的关机时间（时:分，24 小时制）
2. 点击「启动定时」
3. 若设置的时间早于当前时间，将在第二天同一时间执行

### 系统托盘

| 操作 | 效果 |
|------|------|
| 左键单击托盘图标 | 显示 / 隐藏主窗口 |
| 右键单击托盘图标 | 打开托盘菜单 |
| 「显示主窗口」 | 调出主界面 |
| 「取消定时」 | 取消当前正在运行的定时器 |
| 「立即关机」 | 弹出确认后立即执行关机 |
| 「退出」 | 完全退出应用程序 |

### 背景设置

- **纯色模式** — 选择颜色并调节不透明度
- **图片模式** — 选择本地图片，可选拉伸、居中、覆盖、包含四种适配方式
- 设置自动保存，下次启动自动恢复

## 项目结构

```
shutdown-timer/
├── src/                          # React 前端
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 主应用组件（标签页、关闭拦截、事件监听）
│   ├── components/
│   │   ├── CountdownPanel.tsx    # 倒计时面板
│   │   ├── ScheduledPanel.tsx    # 定时面板
│   │   ├── BackgroundSettings.tsx # 背景设置面板
│   │   └── TimerDisplay.tsx      # 时间显示组件
│   ├── stores/
│   │   ├── timerStore.ts         # 定时器状态管理
│   │   └── configStore.ts        # 配置状态管理
│   ├── services/
│   │   └── ipc.ts                # IPC 通信封装
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── utils/
│   │   └── format.ts             # 时间格式化工具
│   └── styles/
│       └── global.css            # 全局样式
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs               # 主入口，注册命令与托盘
│   │   ├── tray.rs               # 系统托盘菜单与事件
│   │   ├── shutdown.rs           # 关机命令封装
│   │   ├── config.rs             # 配置文件读写
│   │   └── timer.rs              # 定时器核心逻辑
│   ├── icons/                    # 应用图标
│   ├── capabilities/             # Tauri 权限配置
│   ├── Cargo.toml                # Rust 依赖
│   ├── tauri.conf.json           # Tauri 配置
│   └── build.rs                  # 构建脚本
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 配置文件

配置以 JSON 格式保存在系统应用数据目录：

```
%APPDATA%\定时关机\config.json
```

包含以下字段：

```json
{
  "background": {
    "bgType": "color",
    "color": "#ffffff",
    "opacity": 1.0,
    "imagePath": null,
    "fitMode": "cover"
  },
  "confirmBeforeShutdown": true,
  "minimizeToTray": true
}
```

## 开发

### 运行测试

Rust 单元测试：

```bash
cd src-tauri
cargo test
```

### 核心 IPC 命令

| 命令 | 说明 |
|------|------|
| `load_config` | 读取配置文件 |
| `save_config` | 保存配置文件 |
| `start_countdown` | 启动倒计时（参数：minutes） |
| `start_scheduled` | 启动定时关机（参数：hour, minute） |
| `cancel_timer` | 取消定时器 |
| `pause_timer` | 暂停定时器 |
| `resume_timer` | 恢复定时器 |
| `get_timer_status` | 获取当前定时器状态 |
| `shutdown_now` | 立即执行关机（30 秒缓冲） |
| `cancel_system_shutdown` | 取消已发起的系统关机 |
| `show_window` / `hide_window` | 显示 / 隐藏主窗口 |
| `exit_app` | 退出应用 |

### 事件

| 事件 | 触发时机 |
|------|----------|
| `timer_tick` | 每秒触发，携带剩余秒数 |
| `timer_finished` | 定时器归零 |
| `tray_cancel_timer` | 从托盘菜单点击「取消定时」 |
| `tray_shutdown_requested` | 从托盘菜单点击「立即关机」 |

## 注意事项

1. 关机命令调用 Windows 系统自带的 `shutdown /s /t 30`，有 30 秒缓冲时间，可通过 `shutdown /a` 取消
2. 首次使用建议设置 2 分钟测试功能是否正常
3. 点击窗口关闭按钮默认弹出选择框（最小化到托盘 / 退出应用），可在设置中调整行为
4. 最小化到托盘后程序仍在后台运行，需从托盘菜单选择「退出」才能完全关闭

## 许可证

MIT License
