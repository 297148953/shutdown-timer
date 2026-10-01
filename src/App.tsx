import { useState, useEffect, useRef } from 'react';
import { CountdownPanel } from './components/CountdownPanel';
import { ScheduledPanel } from './components/ScheduledPanel';
import { BackgroundSettings } from './components/BackgroundSettings';
import { useTimerStore } from './stores/timerStore';
import { useConfigStore } from './stores/configStore';
import { ipc } from './services/ipc';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { convertFileSrc } from '@tauri-apps/api/core';

type Tab = 'countdown' | 'scheduled' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('countdown');
  const { init: initTimer, setRemaining, cancel: cancelTimer } = useTimerStore();
  const { init: initConfig, background } = useConfigStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  // 标记是否主动退出，避免关闭事件循环拦截
  const isExitingRef = useRef(false);

  useEffect(() => {
    initTimer();
    initConfig();
  }, []);

  useEffect(() => {
    let unlisten1: (() => void) | undefined;
    let unlisten2: (() => void) | undefined;
    let unlisten3: (() => void) | undefined;
    let unlisten4: (() => void) | undefined;
    let unlisten5: (() => void) | undefined;

    ipc.onTimerTick((remaining) => {
      setRemaining(remaining);
    }).then((fn) => (unlisten1 = fn));

    ipc.onTimerFinished(() => {
      setShowConfirm(true);
      ipc.shutdownNow();
    }).then((fn) => (unlisten2 = fn));

    ipc.onTrayCancelTimer(() => {
      cancelTimer();
      ipc.cancelSystemShutdown().catch(() => {});
      ipc.showWindow().catch(() => {});
    }).then((fn) => (unlisten3 = fn));

    ipc.onTrayShutdownRequested(() => {
      if (confirm('确定要立即关机吗？')) {
        ipc.shutdownNow();
      }
    }).then((fn) => (unlisten4 = fn));

    // 拦截窗口关闭事件，弹出选择对话框
    getCurrentWindow().onCloseRequested((event) => {
      if (isExitingRef.current) {
        // 主动退出时不拦截，允许窗口关闭
        return;
      }
      event.preventDefault();
      setShowCloseDialog(true);
    }).then((fn) => (unlisten5 = fn));

    return () => {
      unlisten1?.();
      unlisten2?.();
      unlisten3?.();
      unlisten4?.();
      unlisten5?.();
    };
  }, []);

  // 纯色背景样式（直接应用在 .app 上）
  const getColorBgStyle = (): React.CSSProperties => {
    if (background.bgType !== 'color') {
      return { background: '#ffffff' };
    }
    const hex = background.color;
    const opacity = background.opacity;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { background: `rgba(${r}, ${g}, ${b}, ${opacity})` };
  };

  // 背景图片层样式（独立层，可用 opacity 控制透明度）
  const getImageLayerStyle = (): React.CSSProperties | null => {
    if (background.bgType !== 'image' || !background.imagePath) return null;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("${convertFileSrc(background.imagePath)}")`,
      backgroundSize:
        background.fitMode === 'stretch' ? '100% 100%' : background.fitMode,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: background.opacity,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    };
  };

  const handleCancelShutdown = () => {
    setShowConfirm(false);
    ipc.cancelSystemShutdown();
    cancelTimer();
  };

  // 关闭对话框：退出应用（通过 Rust 命令真正退出进程）
  const handleExitApp = () => {
    setShowCloseDialog(false);
    isExitingRef.current = true;
    ipc.exitApp().catch(() => {
      // 兜底：如果命令失败，直接关闭窗口
      getCurrentWindow().close().catch(() => {});
    });
  };

  // 关闭对话框：最小化到托盘（通过 Rust 命令隐藏窗口）
  const handleMinimizeToTray = () => {
    setShowCloseDialog(false);
    ipc.hideWindow().catch((e) => {
      console.error('Failed to hide window:', e);
    });
  };

  const imageLayerStyle = getImageLayerStyle();

  return (
    <div className="app" style={getColorBgStyle()}>
      {imageLayerStyle && <div className="bg-image-layer" style={imageLayerStyle} />}

      <div className="app-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'countdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('countdown')}
          >
            倒计时
          </button>
          <button
            className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            定时
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            设置
          </button>
        </div>

        <div className="content">
          {activeTab === 'countdown' && <CountdownPanel />}
          {activeTab === 'scheduled' && <ScheduledPanel />}
          {activeTab === 'settings' && <BackgroundSettings />}
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>即将关机</h3>
            <p>系统将在 30 秒后关闭，您可以取消此操作。</p>
            <button className="btn-primary" onClick={handleCancelShutdown}>
              取消关机
            </button>
          </div>
        </div>
      )}

      {showCloseDialog && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>关闭程序</h3>
            <p>请选择操作：</p>
            <div className="dialog-buttons">
              <button className="btn-secondary" onClick={handleMinimizeToTray}>
                最小化到托盘
              </button>
              <button className="btn-primary" onClick={handleExitApp}>
                退出应用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;