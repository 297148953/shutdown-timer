import { useConfigStore } from '../stores/configStore';

const FIT_MODES = [
  { value: 'stretch', label: '拉伸' },
  { value: 'center', label: '居中' },
  { value: 'cover', label: '覆盖' },
  { value: 'contain', label: '包含' },
] as const;

export function BackgroundSettings() {
  const { background, setBackground } = useConfigStore();

  const handlePickImage = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: '图片',
            extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'],
          },
        ],
      });
      if (selected && typeof selected === 'string') {
        setBackground({ bgType: 'image', imagePath: selected });
      }
    } catch (e) {
      console.error('Failed to pick image:', e);
    }
  };

  return (
    <div className="panel background-panel">
      <div className="panel-header">
        <h2>背景设置</h2>
      </div>

      <div className="bg-type-switch">
        <button
          className={`type-btn ${background.bgType === 'color' ? 'active' : ''}`}
          onClick={() => setBackground({ bgType: 'color' })}
        >
          纯色
        </button>
        <button
          className={`type-btn ${background.bgType === 'image' ? 'active' : ''}`}
          onClick={() => setBackground({ bgType: 'image' })}
        >
          图片
        </button>
      </div>

      {background.bgType === 'color' && (
        <div className="color-settings">
          <div className="setting-row">
            <label>颜色</label>
            <input
              type="color"
              value={background.color}
              onChange={(e) => setBackground({ color: e.target.value })}
            />
            <span className="color-hex">{background.color}</span>
          </div>
          <div className="setting-row">
            <label>不透明度</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(background.opacity * 100)}
              onChange={(e) => setBackground({ opacity: parseInt(e.target.value, 10) / 100 })}
            />
            <span>{Math.round(background.opacity * 100)}%</span>
          </div>
          <div className="color-preview" style={{ background: background.color }} />
        </div>
      )}

      {background.bgType === 'image' && (
        <div className="image-settings">
          <button className="btn-primary" onClick={handlePickImage}>
            选择图片
          </button>
          {background.imagePath && (
            <div className="image-preview-hint">
              已选择: {background.imagePath.split('\\').pop()}
            </div>
          )}
          <div className="setting-row">
            <label>适配方式</label>
            <select
              value={background.fitMode}
              onChange={(e) => setBackground({ fitMode: e.target.value as any })}
            >
              {FIT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="setting-row">
            <label>透明度</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(background.opacity * 100)}
              onChange={(e) => setBackground({ opacity: parseInt(e.target.value, 10) / 100 })}
            />
            <span>{Math.round(background.opacity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}